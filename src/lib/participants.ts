import { randomBytes } from "crypto";
import type { Participant, PaymentStatus } from "./site";
import { getEventById } from "./events";
import bundledParticipants from "../../data/participants.json";
import { readJsonFile, writeJsonFile } from "./json-store";
import { isSupabaseConfigured, getSupabaseAdmin } from "./supabase";
import {
  participantFromRow,
  participantToRow,
  type ParticipantRow,
} from "./supabase-map";

const FILENAME = "participants.json";

function bundled(): Participant[] {
  const data = bundledParticipants as Participant[];
  return Array.isArray(data) ? data : [];
}

async function readParticipantsLocal(): Promise<Participant[]> {
  const fromDisk = await readJsonFile<Participant[]>(FILENAME, bundled());
  return Array.isArray(fromDisk) ? fromDisk : bundled();
}

async function writeParticipantsLocal(list: Participant[]) {
  await writeJsonFile(FILENAME, list);
}

export async function readParticipants(): Promise<Participant[]> {
  if (isSupabaseConfigured()) {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("participants")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      throw new Error(`Failed to load participants: ${error.message}`);
    }
    return (data as ParticipantRow[]).map(participantFromRow);
  }
  return readParticipantsLocal();
}

export function createPassToken() {
  return randomBytes(24).toString("base64url");
}

export async function addParticipant(input: {
  eventId: string;
  fullName: string;
  phone: string;
  whatsapp?: string;
  paymentStatus?: PaymentStatus;
}) {
  const participant: Participant = {
    id: `p_${randomBytes(8).toString("hex")}`,
    eventId: input.eventId,
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),
    whatsapp: input.whatsapp?.trim(),
    paymentStatus: input.paymentStatus ?? "paid",
    passToken: createPassToken(),
    checkedInAt: null,
    revokedAt: null,
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    const sb = getSupabaseAdmin();
    const { error } = await sb
      .from("participants")
      .insert(participantToRow(participant));
    if (error) {
      throw new Error(`Failed to create participant: ${error.message}`);
    }
  } else {
    const list = await readParticipantsLocal();
    list.push(participant);
    await writeParticipantsLocal(list);
  }

  try {
    const { ensureMemberFromParticipant } = await import("./members");
    await ensureMemberFromParticipant({
      fullName: participant.fullName,
      phone: participant.phone,
      whatsapp: participant.whatsapp,
    });
  } catch (err) {
    console.error("Failed to sync member directory:", err);
  }

  return participant;
}

export async function getParticipantByToken(token: string) {
  if (isSupabaseConfigured()) {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("participants")
      .select("*")
      .eq("pass_token", token)
      .maybeSingle();
    if (error) {
      throw new Error(`Failed to load pass: ${error.message}`);
    }
    return data ? participantFromRow(data as ParticipantRow) : null;
  }
  const list = await readParticipantsLocal();
  return list.find((p) => p.passToken === token) ?? null;
}

export async function getParticipantsByEvent(eventId: string) {
  if (isSupabaseConfigured()) {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("participants")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });
    if (error) {
      throw new Error(`Failed to load participants: ${error.message}`);
    }
    return (data as ParticipantRow[]).map(participantFromRow);
  }
  const list = await readParticipantsLocal();
  return list.filter((p) => p.eventId === eventId);
}

export async function revokeParticipant(id: string) {
  const revokedAt = new Date().toISOString();

  if (isSupabaseConfigured()) {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("participants")
      .update({ revoked_at: revokedAt })
      .eq("id", id)
      .select("*")
      .maybeSingle();
    if (error) {
      throw new Error(`Failed to revoke participant: ${error.message}`);
    }
    return data ? participantFromRow(data as ParticipantRow) : null;
  }

  const list = await readParticipantsLocal();
  const index = list.findIndex((p) => p.id === id);
  if (index === -1) return null;
  list[index].revokedAt = revokedAt;
  await writeParticipantsLocal(list);
  return list[index];
}

export type CheckInResult =
  | { ok: true; participant: Participant; message: string }
  | { ok: false; code: string; message: string; participant?: Participant };

export async function checkInByToken(
  token: string,
  expectedEventId?: string,
): Promise<CheckInResult> {
  const participant = await getParticipantByToken(token);
  if (!participant) {
    return { ok: false, code: "not_found", message: "Pass not found." };
  }

  if (participant.revokedAt) {
    return {
      ok: false,
      code: "revoked",
      message: "This pass has been revoked.",
      participant,
    };
  }

  if (
    participant.paymentStatus !== "paid" &&
    participant.paymentStatus !== "complimentary"
  ) {
    return {
      ok: false,
      code: "unpaid",
      message: "This pass is not marked as paid.",
      participant,
    };
  }

  if (expectedEventId && participant.eventId !== expectedEventId) {
    return {
      ok: false,
      code: "wrong_event",
      message: "This pass is for a different event.",
      participant,
    };
  }

  const event = await getEventById(participant.eventId);
  if (!event) {
    return {
      ok: false,
      code: "event_missing",
      message: "Event for this pass no longer exists.",
      participant,
    };
  }

  if (participant.checkedInAt) {
    return {
      ok: false,
      code: "already_used",
      message: `Already checked in at ${new Date(participant.checkedInAt).toLocaleString()}.`,
      participant,
    };
  }

  const checkedInAt = new Date().toISOString();

  if (isSupabaseConfigured()) {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("participants")
      .update({ checked_in_at: checkedInAt })
      .eq("id", participant.id)
      .is("checked_in_at", null)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to check in: ${error.message}`);
    }
    if (!data) {
      const again = await getParticipantByToken(token);
      return {
        ok: false,
        code: "already_used",
        message: again?.checkedInAt
          ? `Already checked in at ${new Date(again.checkedInAt).toLocaleString()}.`
          : "Already checked in.",
        participant: again ?? participant,
      };
    }

    const updated = participantFromRow(data as ParticipantRow);
    return {
      ok: true,
      participant: updated,
      message: `Welcome to Link Circle, ${updated.fullName}`,
    };
  }

  const list = await readParticipantsLocal();
  const index = list.findIndex((p) => p.passToken === token);
  if (index === -1) {
    return { ok: false, code: "not_found", message: "Pass not found." };
  }
  if (list[index].checkedInAt) {
    return {
      ok: false,
      code: "already_used",
      message: `Already checked in at ${new Date(list[index].checkedInAt!).toLocaleString()}.`,
      participant: list[index],
    };
  }
  list[index].checkedInAt = checkedInAt;
  await writeParticipantsLocal(list);

  return {
    ok: true,
    participant: list[index],
    message: `Welcome to Link Circle, ${list[index].fullName}`,
  };
}
