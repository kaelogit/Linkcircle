import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  addParticipant,
  getParticipantsByEvent,
  readParticipants,
  revokeParticipant,
} from "@/lib/participants";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");
  if (eventId) {
    return NextResponse.json(await getParticipantsByEvent(eventId));
  }
  return NextResponse.json(await readParticipants());
}

export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const fullName = String(body.fullName ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const eventId = String(body.eventId ?? "");
    const whatsapp = body.whatsapp ? String(body.whatsapp).trim() : undefined;
    const paymentStatus = body.paymentStatus ?? "paid";

    if (!fullName || !phone || !eventId) {
      return NextResponse.json(
        { error: "fullName, phone, and eventId are required" },
        { status: 400 },
      );
    }

    const participant = await addParticipant({
      eventId,
      fullName,
      phone,
      whatsapp,
      paymentStatus,
    });

    const origin = new URL(request.url).origin;
    const passUrl = `${origin}/pass/${participant.passToken}`;

    return NextResponse.json({ participant, passUrl }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create participant";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    if (body.action === "revoke" && body.id) {
      const participant = await revokeParticipant(String(body.id));
      if (!participant) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json(participant);
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to update participant";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
