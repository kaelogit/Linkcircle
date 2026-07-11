import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import type { Participant, PaymentStatus } from "./site";
import { getEventById } from "./events";
import bundledParticipants from "../../data/participants.json";

const DATA_DIR = path.join(process.cwd(), "data");
const PARTICIPANTS_FILE = path.join(DATA_DIR, "participants.json");

export async function readParticipants(): Promise<Participant[]> {
  try {
    const raw = await fs.readFile(PARTICIPANTS_FILE, "utf8");
    const parsed = JSON.parse(raw) as Participant[];
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Missing file or read-only serverless FS.
  }
  const bundled = bundledParticipants as Participant[];
  return Array.isArray(bundled) ? bundled : [];
}

async function writeParticipants(list: Participant[]) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(PARTICIPANTS_FILE, JSON.stringify(list, null, 2), "utf8");
  } catch {
    throw new Error(
      "Participant storage is read-only on this host. Use local admin or add a database.",
    );
  }
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
  const list = await readParticipants();
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
  list.push(participant);
  await writeParticipants(list);
  return participant;
}

export async function getParticipantByToken(token: string) {
  const list = await readParticipants();
  return list.find((p) => p.passToken === token) ?? null;
}

export async function getParticipantsByEvent(eventId: string) {
  const list = await readParticipants();
  return list.filter((p) => p.eventId === eventId);
}

export async function revokeParticipant(id: string) {
  const list = await readParticipants();
  const index = list.findIndex((p) => p.id === id);
  if (index === -1) return null;
  list[index].revokedAt = new Date().toISOString();
  await writeParticipants(list);
  return list[index];
}

export type CheckInResult =
  | { ok: true; participant: Participant; message: string }
  | { ok: false; code: string; message: string; participant?: Participant };

export async function checkInByToken(
  token: string,
  expectedEventId?: string,
): Promise<CheckInResult> {
  const list = await readParticipants();
  const index = list.findIndex((p) => p.passToken === token);
  if (index === -1) {
    return { ok: false, code: "not_found", message: "Pass not found." };
  }

  const participant = list[index];

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

  participant.checkedInAt = new Date().toISOString();
  list[index] = participant;
  await writeParticipants(list);

  return {
    ok: true,
    participant,
    message: `Welcome to Link Circle, ${participant.fullName}`,
  };
}
