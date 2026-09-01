import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getEventBySlug } from "@/lib/events";
import { isEventUpcoming } from "@/lib/site";
import {
  createPendingIslandCampRegistration,
  reconcilePendingIslandCampPayments,
} from "@/lib/island-camp-registrations";
import { listRegistrations } from "@/lib/registrations";
import { ISLAND_CAMP_EVENT_ID, ISLAND_CAMP_EVENT_SLUG } from "@/lib/island-camp";
import {
  initializePaystackPayment,
  isPaystackConfigured,
  siteOriginFromRequest,
} from "@/lib/paystack";

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await reconcilePendingIslandCampPayments();
    const list = await listRegistrations(ISLAND_CAMP_EVENT_ID);
    return NextResponse.json(list);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load registrations";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const event = await getEventBySlug(ISLAND_CAMP_EVENT_SLUG);
    if (!event || !isEventUpcoming(event)) {
      return NextResponse.json(
        { error: "Registration for this event is closed." },
        { status: 409 },
      );
    }

    if (!isPaystackConfigured()) {
      return NextResponse.json(
        {
          error:
            "Payments are not configured yet. Add Paystack keys to the server.",
        },
        { status: 503 },
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const fullName = String(body.fullName ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const gender = String(body.gender ?? "").trim();
    const communityIdentity = String(body.communityIdentity ?? "").trim();
    const waiverAccepted = Boolean(body.waiverAccepted);

    if (!fullName || !email || !phone || !communityIdentity) {
      return NextResponse.json(
        {
          error:
            "Name, email, phone, and WhatsApp display name or group number are required.",
        },
        { status: 400 },
      );
    }

    if (gender !== "male" && gender !== "female") {
      return NextResponse.json(
        { error: "Select male or female for your slot." },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 },
      );
    }

    if (!waiverAccepted) {
      return NextResponse.json(
        { error: "You must accept the outdoor activity waiver." },
        { status: 400 },
      );
    }

    const registration = await createPendingIslandCampRegistration({
      fullName,
      email,
      phone,
      gender,
      communityIdentity,
      waiverAccepted,
    });

    const origin = siteOriginFromRequest(request);
    const callbackUrl = `${origin}/api/paystack/callback`;

    const paystack = await initializePaystackPayment({
      email: registration.email,
      amountKobo: registration.amountKobo,
      reference: registration.paystackReference,
      callbackUrl,
      metadata: {
        registration_id: registration.id,
        event_id: registration.eventId,
        full_name: registration.fullName,
        gender: registration.gender,
      },
    });

    return NextResponse.json({
      authorizationUrl: paystack.authorizationUrl,
      reference: registration.paystackReference,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not start registration";
    const status =
      message.includes("closed") ||
      message.includes("taken") ||
      message.includes("already")
        ? 409
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
