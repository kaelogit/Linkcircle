import { NextResponse } from "next/server";
import { checkInByToken, getParticipantByToken } from "@/lib/participants";
import { getEventById } from "@/lib/events";

type Ctx = { params: Promise<{ token: string }> };

export async function GET(_request: Request, context: Ctx) {
  const { token } = await context.params;
  const participant = await getParticipantByToken(token);
  if (!participant) {
    return NextResponse.json({ error: "Pass not found" }, { status: 404 });
  }
  const event = await getEventById(participant.eventId);
  return NextResponse.json({ participant, event });
}

export async function POST(request: Request, context: Ctx) {
  const { token } = await context.params;
  const body = await request.json().catch(() => ({}));
  const expectedEventId = body.eventId ? String(body.eventId) : undefined;
  const result = await checkInByToken(token, expectedEventId);

  if (!result.ok) {
    return NextResponse.json(result, { status: 409 });
  }

  const event = await getEventById(result.participant.eventId);
  return NextResponse.json({ ...result, event });
}
