import { randomBytes } from "crypto";
import { isSupabaseConfigured, getSupabaseAdmin } from "./supabase";
import { addParticipant } from "./participants";
import { ensureMemberFromParticipant, updateMember } from "./members";
import {
  PICNIC_AMOUNT_KOBO,
  PICNIC_CAPACITY,
  PICNIC_EVENT_ID,
  PENDING_HOLD_MS,
} from "./picnic";
import { readJsonFile, writeJsonFile } from "./json-store";

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
    bringItem: row.bring_item,
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
    bring_item: r.bringItem,
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
  const remaining = Math.max(0, PICNIC_CAPACITY - held);
  return {
    capacity: PICNIC_CAPACITY,
    paid,
    held,
    remaining,
    closed: remaining <= 0 || paid >= PICNIC_CAPACITY,
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
  if (slots.closed) {
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

/** Idempotent: verify payment succeeded and provision pass + directory member. */
export async function finalizePaidRegistration(reference: string) {
  const existing = await getRegistrationByReference(reference);
  if (!existing) throw new Error("Registration not found");

  if (existing.status === "paid" && existing.participantId) {
    const { getParticipantsByEvent } = await import("./participants");
    const participants = await getParticipantsByEvent(existing.eventId);
    const match = participants.find((p) => p.id === existing.participantId);
    return { ...existing, passToken: match?.passToken };
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

  const participant = await addParticipant({
    eventId: existing.eventId,
    fullName: existing.fullName,
    phone: existing.phone,
    whatsapp: existing.whatsapp,
    paymentStatus: "paid",
  });

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

  const paid: EventRegistration = {
    ...existing,
    status: "paid",
    participantId: participant.id,
    updatedAt: new Date().toISOString(),
  };
  await saveRegistration(paid);
  return { ...paid, passToken: participant.passToken };
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
