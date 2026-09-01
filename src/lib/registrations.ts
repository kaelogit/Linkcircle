import { randomBytes } from "crypto";
import { isSupabaseConfigured, getSupabaseAdmin } from "./supabase";
import { addParticipant } from "./participants";
import { ensureMemberFromParticipant, updateMember } from "./members";
import {
  PICNIC_AMOUNT_KOBO,
  PICNIC_CAPACITY,
  PICNIC_EVENT_ID,
  PENDING_HOLD_MS,
  PICNIC_ADMIN_COMPLIMENTARY_SEATS,
  type PicnicAdminSeat,
} from "./picnic";
import type { CampGender } from "./island-camp";
import { readJsonFile, writeJsonFile } from "./json-store";
import { normalizePhoneKey } from "./members";

function phoneMatchKey(phone: string) {
  const digits = normalizePhoneKey(phone);
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

export type RegistrationStatus =
  | "pending"
  | "paid"
  | "failed"
  | "abandoned";

export type EventRegistration = {
  id: string;
  eventId: string;
  fullName: string;
  email: string;
  phone: string;
  residence: string;
  whatsapp?: string;
  bringItem: string;
  gender?: CampGender;
  communityIdentity?: string;
  waiverAccepted?: boolean;
  amountKobo: number;
  currency: string;
  status: RegistrationStatus;
  paystackReference: string;
  participantId?: string;
  createdAt: string;
  updatedAt: string;
};

export type RegistrationRow = {
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
  status: RegistrationStatus;
  paystack_reference: string;
  participant_id: string | null;
  created_at: string;
  updated_at: string;
};

const FILENAME = "event-registrations.json";

function fromRow(row: RegistrationRow): EventRegistration {
  return {
    id: row.id,
    eventId: row.event_id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    residence: row.residence ?? "",
    whatsapp: row.whatsapp ?? undefined,
    bringItem: row.bring_item ?? "",
    gender: row.gender ?? undefined,
    communityIdentity: row.community_identity ?? undefined,
    waiverAccepted: row.waiver_accepted ?? false,
    amountKobo: row.amount_kobo,
    currency: row.currency,
    status: row.status,
    paystackReference: row.paystack_reference,
    participantId: row.participant_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

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

function countsTowardHold(r: EventRegistration, now = Date.now()) {
  if (r.status === "paid") return true;
  if (r.status !== "pending") return false;
  return now - +new Date(r.createdAt) < PENDING_HOLD_MS;
}

export async function listRegistrations(
  eventId = PICNIC_EVENT_ID,
): Promise<EventRegistration[]> {
  if (isSupabaseConfigured()) {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("event_registrations")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data as RegistrationRow[]).map(fromRow);
  }
  return (await readLocal()).filter((r) => r.eventId === eventId);
}

export async function getRegistrationByReference(reference: string) {
  if (isSupabaseConfigured()) {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("event_registrations")
      .select("*")
      .eq("paystack_reference", reference)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? fromRow(data as RegistrationRow) : null;
  }
  return (await readLocal()).find((r) => r.paystackReference === reference) ?? null;
}

export async function getPicnicSlotStatus(eventId = PICNIC_EVENT_ID) {
  const list = await listRegistrations(eventId);
  const now = Date.now();
  const paid = list.filter((r) => r.status === "paid").length;
  const held = list.filter((r) => countsTowardHold(r, now)).length;
  // Public counter is paid seats only. Pending checkouts can still block
  // new signups via `held`, but they must not look like empty seats vanished.
  const remaining = Math.max(0, PICNIC_CAPACITY - paid);
  return {
    capacity: PICNIC_CAPACITY,
    paid,
    held,
    remaining,
    closed: paid >= PICNIC_CAPACITY || held >= PICNIC_CAPACITY,
  };
}

export type CreateRegistrationInput = {
  fullName: string;
  email: string;
  phone: string;
  residence: string;
  whatsapp?: string;
  bringItem: string;
};

export async function createPendingRegistration(input: CreateRegistrationInput) {
  const slots = await getPicnicSlotStatus();
  if (slots.paid >= PICNIC_CAPACITY || slots.held >= PICNIC_CAPACITY) {
    throw new Error("Registration is closed. All 30 slots are taken.");
  }

  const now = new Date().toISOString();
  const registration: EventRegistration = {
    id: `reg_${randomBytes(8).toString("hex")}`,
    eventId: PICNIC_EVENT_ID,
    fullName: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    residence: input.residence.trim(),
    whatsapp: input.whatsapp?.trim() || undefined,
    bringItem: input.bringItem.trim(),
    amountKobo: PICNIC_AMOUNT_KOBO,
    currency: "NGN",
    status: "pending",
    paystackReference: `lc_picnic_${randomBytes(12).toString("hex")}`,
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
    const list = await readLocal();
    list.push(registration);
    await writeLocal(list);
  }

  return registration;
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

export async function findPaidRegistrationByPhone(phone: string) {
  const key = phoneMatchKey(phone);
  if (!key) return null;
  const list = await listRegistrations();
  return (
    list.find(
      (r) => r.status === "paid" && phoneMatchKey(r.phone) === key,
    ) ?? null
  );
}

/**
 * Complimentary picnic seat for LC admins — counts toward the 30, no Paystack.
 * Skips if this phone already has a paid seat (e.g. founder who paid).
 */
export async function createComplimentaryRegistration(
  input: CreateRegistrationInput & { amountKobo?: number },
) {
  const existing = await findPaidRegistrationByPhone(input.phone);
  if (existing) {
    return { registration: existing, created: false as const, skipped: "already_registered" as const };
  }

  const slots = await getPicnicSlotStatus();
  if (slots.paid >= PICNIC_CAPACITY) {
    throw new Error("Registration is closed. All 30 slots are taken.");
  }

  const now = new Date().toISOString();
  const reference = `lc_picnic_comp_${randomBytes(10).toString("hex")}`;

  const participant = await addParticipant({
    eventId: PICNIC_EVENT_ID,
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),
    whatsapp: input.whatsapp?.trim(),
    paymentStatus: "complimentary",
  });

  try {
    const member = await ensureMemberFromParticipant({
      fullName: input.fullName.trim(),
      phone: input.phone.trim(),
      whatsapp: input.whatsapp?.trim(),
    });
    if (member && input.residence?.trim() && !member.bio?.trim()) {
      await updateMember(member.id, {
        bio: `Lives in: ${input.residence.trim()}`,
      });
    }
  } catch (err) {
    console.error("Directory sync after complimentary picnic seat failed:", err);
  }

  const registration: EventRegistration = {
    id: `reg_${randomBytes(8).toString("hex")}`,
    eventId: PICNIC_EVENT_ID,
    fullName: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    residence: input.residence.trim() || "Link Circle admin",
    whatsapp: input.whatsapp?.trim() || undefined,
    bringItem: input.bringItem.trim() || "Admin / hosting support",
    amountKobo: input.amountKobo ?? 0,
    currency: "NGN",
    status: "paid",
    paystackReference: reference,
    participantId: participant.id,
    createdAt: now,
    updatedAt: now,
  };

  if (isSupabaseConfigured()) {
    const sb = getSupabaseAdmin();
    const { error } = await sb
      .from("event_registrations")
      .insert(toRow(registration));
    if (error) throw new Error(`Failed to create complimentary seat: ${error.message}`);
  } else {
    const list = await readLocal();
    list.push(registration);
    await writeLocal(list);
  }

  return {
    registration: { ...registration, passToken: participant.passToken },
    created: true as const,
    skipped: null,
  };
}

export async function registerComplimentaryAdmins(
  seats: PicnicAdminSeat[] = PICNIC_ADMIN_COMPLIMENTARY_SEATS,
) {
  const results: Array<{
    fullName: string;
    phone: string;
    status: "created" | "skipped" | "error";
    reason?: string;
    registrationId?: string;
  }> = [];

  for (const seat of seats) {
    if (seat.skipAuto) {
      results.push({
        fullName: seat.fullName,
        phone: seat.phone || "(none)",
        status: "skipped",
        reason: "Already paid / not auto-comped (founder)",
      });
      continue;
    }
    if (!seat.phone?.trim()) {
      results.push({
        fullName: seat.fullName,
        phone: "(missing)",
        status: "skipped",
        reason: "No phone on file — add one complimentary seat manually",
      });
      continue;
    }
    try {
      const result = await createComplimentaryRegistration({
        fullName: seat.fullName,
        email: seat.email,
        phone: seat.phone,
        residence: seat.residence || "Link Circle admin",
        bringItem: seat.bringItem || "Admin / hosting support",
      });
      if (result.created) {
        results.push({
          fullName: seat.fullName,
          phone: seat.phone,
          status: "created",
          registrationId: result.registration.id,
        });
      } else {
        results.push({
          fullName: seat.fullName,
          phone: seat.phone,
          status: "skipped",
          reason: "Already has a paid picnic seat",
          registrationId: result.registration.id,
        });
      }
    } catch (err) {
      results.push({
        fullName: seat.fullName,
        phone: seat.phone,
        status: "error",
        reason: err instanceof Error ? err.message : "Failed",
      });
    }
  }

  return results;
}

/** Idempotent: verify payment succeeded and provision pass + directory member. */
export async function finalizePaidRegistration(reference: string) {
  const existing = await getRegistrationByReference(reference);
  if (!existing) throw new Error("Registration not found");

  if (existing.status === "paid") {
    let passToken: string | undefined;
    if (existing.participantId) {
      const { getParticipantsByEvent } = await import("./participants");
      const participants = await getParticipantsByEvent(existing.eventId);
      passToken = participants.find((p) => p.id === existing.participantId)
        ?.passToken;
    }
    return { ...existing, passToken };
  }

  // Hard capacity lock: only count paid seats
  const list = await listRegistrations(existing.eventId);
  const paidCount = list.filter(
    (r) => r.status === "paid" && r.id !== existing.id,
  ).length;
  if (paidCount >= PICNIC_CAPACITY) {
    const failed: EventRegistration = {
      ...existing,
      status: "failed",
      updatedAt: new Date().toISOString(),
    };
    await saveRegistration(failed);
    throw new Error(
      "Sorry — all 30 paid slots filled while checkout was open. Contact an admin for a refund.",
    );
  }

  let participantId = existing.participantId;
  let passToken: string | undefined;

  if (!participantId) {
    const participant = await addParticipant({
      eventId: existing.eventId,
      fullName: existing.fullName,
      phone: existing.phone,
      whatsapp: existing.whatsapp,
      paymentStatus: "paid",
    });
    participantId = participant.id;
    passToken = participant.passToken;
  }

  try {
    const member = await ensureMemberFromParticipant({
      fullName: existing.fullName,
      phone: existing.phone,
      whatsapp: existing.whatsapp,
    });
    if (member && existing.residence && !member.bio?.trim()) {
      await updateMember(member.id, {
        bio: `Lives in: ${existing.residence}`,
      });
    }
  } catch (err) {
    console.error("Directory sync after picnic payment failed:", err);
  }

  const paid: EventRegistration = {
    ...existing,
    status: "paid",
    participantId,
    updatedAt: new Date().toISOString(),
  };
  await saveRegistration(paid);
  return { ...paid, passToken };
}

let lastReconcileAt = 0;

/** Confirm pending rows that Paystack already captured (missed callback). */
export async function reconcilePendingPicnicPayments() {
  const now = Date.now();
  if (now - lastReconcileAt < 15_000) return;
  lastReconcileAt = now;

  const { verifyPaystackPayment } = await import("./paystack");
  const list = await listRegistrations();
  const pending = list.filter((r) => r.status === "pending").slice(0, 10);

  for (const row of pending) {
    try {
      const verified = await verifyPaystackPayment(row.paystackReference);
      if (
        verified.status === "success" &&
        verified.amount >= PICNIC_AMOUNT_KOBO
      ) {
        await finalizePaidRegistration(row.paystackReference);
      }
    } catch (err) {
      console.error(
        `Picnic reconcile failed for ${row.paystackReference}:`,
        err,
      );
    }
  }
}

export async function markRegistrationFailed(reference: string) {
  const existing = await getRegistrationByReference(reference);
  if (!existing || existing.status === "paid") return existing;
  const failed: EventRegistration = {
    ...existing,
    status: "failed",
    updatedAt: new Date().toISOString(),
  };
  await saveRegistration(failed);
  return failed;
}
