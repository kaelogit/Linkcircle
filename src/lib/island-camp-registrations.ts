import { randomBytes } from "crypto";
import {
  type EventRegistration,
  getRegistrationByReference,
  listRegistrations,
  markRegistrationFailed,
} from "./registrations";
import { isSupabaseConfigured, getSupabaseAdmin } from "./supabase";
import { ensureMemberFromParticipant } from "./members";
import { paystackGrossFromNet } from "./paystack";
import { readJsonFile, writeJsonFile } from "./json-store";
import {
  ISLAND_CAMP_AMOUNT_KOBO,
  ISLAND_CAMP_CAPACITY,
  ISLAND_CAMP_CAPACITY_PER_GENDER,
  ISLAND_CAMP_EVENT_ID,
  ISLAND_CAMP_REGISTRATION_CLOSES_AT,
  PENDING_HOLD_MS,
  isIslandCampRegistrationOpen,
  type CampGender,
} from "./island-camp";
import { normalizePhoneKey } from "./members";

const FILENAME = "event-registrations.json";

type RegistrationRow = {
  id: string;
  event_id: string;
  full_name: string;
  email: string;
  phone: string;
  residence: string;
  whatsapp: string | null;
  bring_item: string;
  gender: CampGender | null;
  community_identity: string | null;
  waiver_accepted: boolean;
  amount_kobo: number;
  currency: string;
  status: string;
  paystack_reference: string;
  participant_id: string | null;
  created_at: string;
  updated_at: string;
};

function toRow(r: EventRegistration): RegistrationRow {
  return {
    id: r.id,
    event_id: r.eventId,
    full_name: r.fullName,
    email: r.email,
    phone: r.phone,
    residence: r.residence,
    whatsapp: r.whatsapp ?? null,
    bring_item: r.bringItem ?? "",
    gender: r.gender ?? null,
    community_identity: r.communityIdentity ?? null,
    waiver_accepted: r.waiverAccepted ?? false,
    amount_kobo: r.amountKobo,
    currency: r.currency,
    status: r.status,
    paystack_reference: r.paystackReference,
    participant_id: r.participantId ?? null,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
  };
}

async function readLocal(): Promise<EventRegistration[]> {
  const list = await readJsonFile<EventRegistration[]>(FILENAME, []);
  return Array.isArray(list) ? list : [];
}

async function writeLocal(list: EventRegistration[]) {
  await writeJsonFile(FILENAME, list);
}

async function saveRegistration(updated: EventRegistration) {
  if (isSupabaseConfigured()) {
    const sb = getSupabaseAdmin();
    const { error } = await sb
      .from("event_registrations")
      .update(toRow(updated))
      .eq("id", updated.id);
    if (error) throw new Error(`Failed to update registration: ${error.message}`);
    return;
  }
  const list = await readLocal();
  const idx = list.findIndex((r) => r.id === updated.id);
  if (idx >= 0) {
    list[idx] = updated;
    await writeLocal(list);
  }
}

function countsTowardHold(r: EventRegistration, now = Date.now()) {
  if (r.status === "paid") return true;
  if (r.status !== "pending") return false;
  return now - +new Date(r.createdAt) < PENDING_HOLD_MS;
}

function genderCounts(list: EventRegistration[], gender: CampGender, now = Date.now()) {
  const relevant = list.filter((r) => r.gender === gender);
  const paid = relevant.filter((r) => r.status === "paid").length;
  const held = relevant.filter((r) => countsTowardHold(r, now)).length;
  return { paid, held };
}

export async function getIslandCampSlotStatus(eventId = ISLAND_CAMP_EVENT_ID) {
  const list = await listRegistrations(eventId);
  const now = Date.now();
  const male = genderCounts(list, "male", now);
  const female = genderCounts(list, "female", now);
  const paid = list.filter((r) => r.status === "paid").length;
  const held = list.filter((r) => countsTowardHold(r, now)).length;

  const registrationOpen = isIslandCampRegistrationOpen(now);
  const maleFull =
    male.paid >= ISLAND_CAMP_CAPACITY_PER_GENDER ||
    male.held >= ISLAND_CAMP_CAPACITY_PER_GENDER;
  const femaleFull =
    female.paid >= ISLAND_CAMP_CAPACITY_PER_GENDER ||
    female.held >= ISLAND_CAMP_CAPACITY_PER_GENDER;
  const totalFull =
    paid >= ISLAND_CAMP_CAPACITY || held >= ISLAND_CAMP_CAPACITY;

  return {
    capacity: ISLAND_CAMP_CAPACITY,
    capacityPerGender: ISLAND_CAMP_CAPACITY_PER_GENDER,
    paid,
    held,
    male: {
      paid: male.paid,
      held: male.held,
      remaining: Math.max(0, ISLAND_CAMP_CAPACITY_PER_GENDER - male.paid),
      full: maleFull,
    },
    female: {
      paid: female.paid,
      held: female.held,
      remaining: Math.max(0, ISLAND_CAMP_CAPACITY_PER_GENDER - female.paid),
      full: femaleFull,
    },
    registrationClosesAt: ISLAND_CAMP_REGISTRATION_CLOSES_AT,
    registrationOpen,
    closed: !registrationOpen || totalFull,
  };
}

export type CreateIslandCampInput = {
  fullName: string;
  email: string;
  phone: string;
  gender: CampGender;
  communityIdentity: string;
  waiverAccepted: boolean;
};

function phoneKey(phone: string) {
  const digits = normalizePhoneKey(phone);
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

export async function createPendingIslandCampRegistration(
  input: CreateIslandCampInput,
) {
  if (!input.waiverAccepted) {
    throw new Error("You must accept the outdoor activity waiver to register.");
  }

  if (!isIslandCampRegistrationOpen()) {
    throw new Error("Registration closed on 24 September 2026.");
  }

  const slots = await getIslandCampSlotStatus();
  if (slots.closed) {
    throw new Error("Registration is closed.");
  }

  const genderSlots = input.gender === "male" ? slots.male : slots.female;
  if (genderSlots.full) {
    throw new Error(
      `All ${input.gender} slots are taken. Try again if someone drops out before 24 September.`,
    );
  }

  const list = await listRegistrations(ISLAND_CAMP_EVENT_ID);
  const key = phoneKey(input.phone);
  const duplicate = list.find(
    (r) =>
      (r.status === "paid" || r.status === "pending") &&
      phoneKey(r.phone) === key,
  );
  if (duplicate) {
    throw new Error(
      "This phone number already has a registration for LC Island Camp.",
    );
  }

  const grossKobo = paystackGrossFromNet(ISLAND_CAMP_AMOUNT_KOBO);
  const now = new Date().toISOString();
  const registration: EventRegistration = {
    id: `reg_${randomBytes(8).toString("hex")}`,
    eventId: ISLAND_CAMP_EVENT_ID,
    fullName: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    residence: "",
    bringItem: "",
    gender: input.gender,
    communityIdentity: input.communityIdentity.trim(),
    waiverAccepted: true,
    amountKobo: grossKobo,
    currency: "NGN",
    status: "pending",
    paystackReference: `lc_island_${randomBytes(12).toString("hex")}`,
    createdAt: now,
    updatedAt: now,
  };

  if (isSupabaseConfigured()) {
    const sb = getSupabaseAdmin();
    const { error } = await sb
      .from("event_registrations")
      .insert(toRow(registration));
    if (error) throw new Error(`Failed to create registration: ${error.message}`);
  } else {
    const all = await readLocal();
    all.push(registration);
    await writeLocal(all);
  }

  return registration;
}

/** Idempotent: mark paid, sync directory — no QR pass for island camp. */
export async function finalizePaidIslandCampRegistration(reference: string) {
  const existing = await getRegistrationByReference(reference);
  if (!existing) throw new Error("Registration not found");
  if (existing.eventId !== ISLAND_CAMP_EVENT_ID) {
    throw new Error("Not an island camp registration");
  }

  if (existing.status === "paid") {
    return existing;
  }

  const list = await listRegistrations(ISLAND_CAMP_EVENT_ID);
  const gender = existing.gender;
  if (!gender) throw new Error("Registration missing gender");

  const paidInGender = list.filter(
    (r) => r.gender === gender && r.status === "paid" && r.id !== existing.id,
  ).length;
  if (paidInGender >= ISLAND_CAMP_CAPACITY_PER_GENDER) {
    const failed: EventRegistration = {
      ...existing,
      status: "failed",
      updatedAt: new Date().toISOString(),
    };
    await saveRegistration(failed);
    throw new Error(
      `Sorry — all ${gender} slots filled while checkout was open. Contact an admin.`,
    );
  }

  const paidTotal = list.filter(
    (r) => r.status === "paid" && r.id !== existing.id,
  ).length;
  if (paidTotal >= ISLAND_CAMP_CAPACITY) {
    const failed: EventRegistration = {
      ...existing,
      status: "failed",
      updatedAt: new Date().toISOString(),
    };
    await saveRegistration(failed);
    throw new Error(
      "Sorry — all 30 slots filled while checkout was open. Contact an admin.",
    );
  }

  try {
    await ensureMemberFromParticipant({
      fullName: existing.fullName,
      phone: existing.phone,
    });
  } catch (err) {
    console.error("Directory sync after island camp payment failed:", err);
  }

  const paid: EventRegistration = {
    ...existing,
    status: "paid",
    updatedAt: new Date().toISOString(),
  };
  await saveRegistration(paid);
  return paid;
}

let lastReconcileAt = 0;

export async function reconcilePendingIslandCampPayments() {
  const now = Date.now();
  if (now - lastReconcileAt < 15_000) return;
  lastReconcileAt = now;

  const { verifyPaystackPayment } = await import("./paystack");
  const list = await listRegistrations(ISLAND_CAMP_EVENT_ID);
  const pending = list.filter((r) => r.status === "pending").slice(0, 10);

  for (const row of pending) {
    try {
      const verified = await verifyPaystackPayment(row.paystackReference);
      if (
        verified.status === "success" &&
        verified.amount >= row.amountKobo
      ) {
        await finalizePaidIslandCampRegistration(row.paystackReference);
      }
    } catch (err) {
      console.error(
        `Island camp reconcile failed for ${row.paystackReference}:`,
        err,
      );
    }
  }
}

export { markRegistrationFailed };
