import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { createEvent, readEvents } from "@/lib/events";

export async function GET() {
  const events = await readEvents();
  return NextResponse.json(events);
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  if (!body.title || !body.startsAt || !body.endsAt) {
    return NextResponse.json(
      { error: "title, startsAt, and endsAt are required" },
      { status: 400 },
    );
  }

  const event = await createEvent({
    title: String(body.title),
    tagline: body.tagline ? String(body.tagline) : "",
    description: body.description ? String(body.description) : "",
    startsAt: String(body.startsAt),
    endsAt: String(body.endsAt),
    locationPublic: body.locationPublic
      ? String(body.locationPublic)
      : undefined,
    priceLabel: body.priceLabel ? String(body.priceLabel) : undefined,
    capacity: body.capacity ? Number(body.capacity) : undefined,
    status: body.status,
    whatsIncluded: Array.isArray(body.whatsIncluded)
      ? body.whatsIncluded.map(String)
      : undefined,
  });

  return NextResponse.json(event, { status: 201 });
}
