import { randomBytes } from "crypto";
import {
  type EventRegistration,
  type IslandCampPaymentPlan,
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
import {
  islandCampBalanceGrossKobo,
  islandCampDepositGrossKobo,
} from "./island-camp-balance";
import { sendIslandCampDepositReceivedEmail } from "./island-camp-email";
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
  payment_plan: IslandCampPaymentPlan | null;
  amount_paid_kobo: number;
  balance_due_kobo: number;
  balance_reference: string | null;
  balance_reminder_sent_at: string | null;
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
    payment_plan: r.paymentPlan ?? null,
    amount_paid_kobo: r.amountPaidKobo ?? 0,
    balance_due_kobo: r.balanceDueKobo ?? 0,
    balance_reference: r.balanceReference ?? null,
    balance_reminder_sent_at: r.balanceReminderSentAt ?? null,
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

function countsTowardSlot(r: EventRegistration, now = Date.now()) {
  if (r.status === "paid" || r.status === "deposit_paid") return true;
  if (r.status !== "pending") return false;
  return now - +new Date(r.createdAt) < PENDING_HOLD_MS;
}

async function forfeitOverdueDepositBalances(
  list: EventRegistration[],
  now = Date.now(),
) {
  if (isIslandCampRegistrationOpen(now)) return list;

  const overdue = list.filter((r) => r.status === "deposit_paid");
  if (overdue.length === 0) return list;

  const updatedAt = new Date().toISOString();
  for (const row of overdue) {
    const forfeited: EventRegistration = {
      ...row,
      status: "abandoned",
      updatedAt,
    };
    await saveRegistration(forfeited);
  }

  return list.map((r) =>
    r.status === "deposit_paid"
      ? { ...r, status: "abandoned" as const, updatedAt }
      : r,
  );
}

function genderCounts(list: EventRegistration[], gender: CampGender, now = Date.now()) {
  const relevant = list.filter((r) => r.gender === gender);
  const paid = relevant.filter((r) => r.status === "paid").length;
  const depositPaid = relevant.filter((r) => r.status === "deposit_paid").length;
  const held = relevant.filter((r) => countsTowardSlot(r, now) && r.status === "pending").length;
  const taken = relevant.filter((r) => countsTowardSlot(r, now)).length;
  return { paid, depositPaid, held, taken };
}

export async function getIslandCampSlotStatus(eventId = ISLAND_CAMP_EVENT_ID) {
  const raw = await listRegistrations(eventId);
  const list = await forfeitOverdueDepositBalances(raw);
  const now = Date.now();
  const male = genderCounts(list, "male", now);
  const female = genderCounts(list, "female", now);
  const paid = list.filter((r) => r.status === "paid").length;
  const depositPaid = list.filter((r) => r.status === "deposit_paid").length;
  const held = list.filter(
    (r) => r.status === "pending" && countsTowardSlot(r, now),
  ).length;
  const slotsTaken = paid + depositPaid + held;

  const registrationOpen = isIslandCampRegistrationOpen(now);
  const maleFull =
    male.taken >= ISLAND_CAMP_CAPACITY_PER_GENDER;
  const femaleFull =
    female.taken >= ISLAND_CAMP_CAPACITY_PER_GENDER;
  const totalFull = slotsTaken >= ISLAND_CAMP_CAPACITY;

  return {
    capacity: ISLAND_CAMP_CAPACITY,
    capacityPerGender: ISLAND_CAMP_CAPACITY_PER_GENDER,
    paid,
    depositPaid,
    slotsTaken,
    held,
    male: {
      paid: male.paid,
      depositPaid: male.depositPaid,
      held: male.held,
      taken: male.taken,
      remaining: Math.max(0, ISLAND_CAMP_CAPACITY_PER_GENDER - male.taken),
      full: maleFull,
    },
    female: {
      paid: female.paid,
      depositPaid: female.depositPaid,
      held: female.held,
      taken: female.taken,
      remaining: Math.max(0, ISLAND_CAMP_CAPACITY_PER_GENDER - female.taken),
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
  paymentPlan: IslandCampPaymentPlan;
};

function phoneKey(phone: string) {
  const digits = normalizePhoneKey(phone);
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

function activeRegistrationStatuses(): RegistrationStatus[] {
  return ["paid", "pending", "deposit_paid"];
}

type RegistrationStatus = EventRegistration["status"];

async function assertSlotAvailable(
  list: EventRegistration[],
  gender: CampGender,
  excludeId?: string,
) {
  const paidInGender = list.filter(
    (r) =>
      r.gender === gender &&
      r.status === "paid" &&
      r.id !== excludeId,
  ).length;
  if (paidInGender >= ISLAND_CAMP_CAPACITY_PER_GENDER) {
    throw new Error(
      `Sorry, all ${gender} slots filled while checkout was open. Contact an admin.`,
    );
  }

  const takenInGender = list.filter(
    (r) =>
      r.gender === gender &&
      countsTowardSlot(r) &&
      r.id !== excludeId,
  ).length;
  if (takenInGender >= ISLAND_CAMP_CAPACITY_PER_GENDER) {
    throw new Error(
      `Sorry, all ${gender} slots filled while checkout was open. Contact an admin.`,
    );
  }

  const paidTotal = list.filter(
    (r) => r.status === "paid" && r.id !== excludeId,
  ).length;
  const takenTotal = list.filter(
    (r) => countsTowardSlot(r) && r.id !== excludeId,
  ).length;
  if (takenTotal >= ISLAND_CAMP_CAPACITY) {
    throw new Error(
      "Sorry, all 30 slots filled while checkout was open. Contact an admin.",
    );
  }
  if (paidTotal >= ISLAND_CAMP_CAPACITY) {
    throw new Error(
      "Sorry, all 30 slots filled while checkout was open. Contact an admin.",
    );
  }
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
      activeRegistrationStatuses().includes(r.status) &&
      phoneKey(r.phone) === key,
  );
  if (duplicate) {
    if (duplicate.status === "deposit_paid" && duplicate.balanceReference) {
      throw new Error(
        `You already paid a deposit. Pay your balance here: /register/island-camp/balance?ref=${duplicate.balanceReference}`,
      );
    }
    throw new Error(
      "This phone number already has a registration for LC Island Camp.",
    );
  }

  const paymentPlan = input.paymentPlan === "deposit" ? "deposit" : "full";
  const depositGross = islandCampDepositGrossKobo();
  const balanceGross = islandCampBalanceGrossKobo();
  const fullGross = paystackGrossFromNet(ISLAND_CAMP_AMOUNT_KOBO);
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
    paymentPlan,
    amountKobo: paymentPlan === "deposit" ? depositGross : fullGross,
    balanceDueKobo: paymentPlan === "deposit" ? balanceGross : 0,
    amountPaidKobo: 0,
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

function expectedAmountForReference(reg: EventRegistration, reference: string) {
  if (reg.balanceReference === reference) {
    return reg.balanceDueKobo ?? islandCampBalanceGrossKobo();
  }
  return reg.amountKobo;
}

/** Idempotent: mark paid or deposit_paid, sync directory — no QR pass for island camp. */
export async function finalizePaidIslandCampRegistration(reference: string) {
  const existing = await getRegistrationByReference(reference);
  if (!existing) throw new Error("Registration not found");
  if (existing.eventId !== ISLAND_CAMP_EVENT_ID) {
    throw new Error("Not an island camp registration");
  }

  if (existing.status === "paid") {
    return existing;
  }

  const isBalancePayment = existing.balanceReference === reference;
  const isFirstPayment = existing.paystackReference === reference;

  if (!isBalancePayment && !isFirstPayment) {
    throw new Error("Unknown payment reference for this registration");
  }

  const list = await listRegistrations(ISLAND_CAMP_EVENT_ID);
  const gender = existing.gender;
  if (!gender) throw new Error("Registration missing gender");

  if (isBalancePayment) {
    if (existing.status !== "deposit_paid") {
      return existing;
    }

    await assertSlotAvailable(list, gender, existing.id);

    try {
      await ensureMemberFromParticipant({
        fullName: existing.fullName,
        phone: existing.phone,
      });
    } catch (err) {
      console.error("Directory sync after island camp balance failed:", err);
    }

    const paid: EventRegistration = {
      ...existing,
      status: "paid",
      amountPaidKobo:
        (existing.amountPaidKobo ?? 0) + (existing.balanceDueKobo ?? 0),
      balanceDueKobo: 0,
      updatedAt: new Date().toISOString(),
    };
    await saveRegistration(paid);
    return paid;
  }

  if (existing.paymentPlan === "deposit") {
    if (existing.status === "deposit_paid") {
      return existing;
    }
    if (existing.status !== "pending") {
      throw new Error("Registration is not awaiting deposit payment");
    }

    await assertSlotAvailable(list, gender, existing.id);

    const depositPaid: EventRegistration = {
      ...existing,
      status: "deposit_paid",
      amountPaidKobo: existing.amountKobo,
      balanceReference:
        existing.balanceReference ??
        `lc_island_bal_${randomBytes(12).toString("hex")}`,
      updatedAt: new Date().toISOString(),
    };
    await saveRegistration(depositPaid);

    try {
      await sendIslandCampDepositReceivedEmail(depositPaid);
    } catch (err) {
      console.error("Island camp deposit confirmation email failed:", err);
    }

    return depositPaid;
  }

  if (existing.status !== "pending") {
    return existing;
  }

  await assertSlotAvailable(list, gender, existing.id);

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
    amountPaidKobo: existing.amountKobo,
    updatedAt: new Date().toISOString(),
  };
  await saveRegistration(paid);
  return paid;
}

export async function startIslandCampBalancePayment(input: {
  balanceRef?: string;
  phone?: string;
}) {
  if (!isIslandCampRegistrationOpen()) {
    throw new Error("The balance payment deadline has passed (24 September 2026).");
  }

  const list = await forfeitOverdueDepositBalances(
    await listRegistrations(ISLAND_CAMP_EVENT_ID),
  );
  let reg: EventRegistration | undefined;

  if (input.balanceRef?.trim()) {
    reg = list.find(
      (r) =>
        r.balanceReference === input.balanceRef?.trim() &&
        r.status === "deposit_paid",
    );
  } else if (input.phone?.trim()) {
    const key = phoneKey(input.phone);
    reg = list.find(
      (r) =>
        r.status === "deposit_paid" && phoneKey(r.phone) === key,
    );
  }

  if (!reg) {
    throw new Error(
      "No outstanding balance found for that link or phone number.",
    );
  }

  if (!reg.balanceReference) {
    throw new Error("Balance payment is not ready yet. Contact an admin.");
  }

  if ((reg.balanceDueKobo ?? 0) <= 0) {
    throw new Error("This registration has no balance left to pay.");
  }

  return reg;
}

export function islandCampPaymentAmountKobo(
  reg: EventRegistration,
  reference: string,
) {
  return expectedAmountForReference(reg, reference);
}

export async function markIslandCampBalanceReminderSent(
  registrationId: string,
) {
  const list = await listRegistrations(ISLAND_CAMP_EVENT_ID);
  const existing = list.find((r) => r.id === registrationId);
  if (!existing) throw new Error("Registration not found");

  const updated: EventRegistration = {
    ...existing,
    balanceReminderSentAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await saveRegistration(updated);
  return updated;
}

export async function listIslandCampBalanceDue() {
  const list = await forfeitOverdueDepositBalances(
    await listRegistrations(ISLAND_CAMP_EVENT_ID),
  );
  return list.filter((r) => r.status === "deposit_paid");
}

let lastReconcileAt = 0;

export async function reconcilePendingIslandCampPayments() {
  const now = Date.now();
  if (now - lastReconcileAt < 15_000) return;
  lastReconcileAt = now;

  const { verifyPaystackPayment } = await import("./paystack");
  const raw = await listRegistrations(ISLAND_CAMP_EVENT_ID);
  const list = await forfeitOverdueDepositBalances(raw, now);
  const pending = list.filter((r) => r.status === "pending").slice(0, 10);
  const awaitingBalance = list
    .filter((r) => r.status === "deposit_paid" && r.balanceReference)
    .slice(0, 10);

  for (const row of pending) {
    try {
      const verified = await verifyPaystackPayment(row.paystackReference);
      const minAmount = expectedAmountForReference(row, row.paystackReference);
      if (verified.status === "success" && verified.amount >= minAmount) {
        await finalizePaidIslandCampRegistration(row.paystackReference);
      }
    } catch (err) {
      console.error(
        `Island camp reconcile failed for ${row.paystackReference}:`,
        err,
      );
    }
  }

  for (const row of awaitingBalance) {
    const ref = row.balanceReference!;
    try {
      const verified = await verifyPaystackPayment(ref);
      const minAmount = expectedAmountForReference(row, ref);
      if (verified.status === "success" && verified.amount >= minAmount) {
        await finalizePaidIslandCampRegistration(ref);
      }
    } catch (err) {
      console.error(`Island camp balance reconcile failed for ${ref}:`, err);
    }
  }
}

export { markRegistrationFailed };
