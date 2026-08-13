import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { BRING_OPTIONS } from "@/lib/picnic";
import {
  createPendingRegistration,
  listRegistrations,
  reconcilePendingPicnicPayments,
} from "@/lib/registrations";
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
    await reconcilePendingPicnicPayments();
    const list = await listRegistrations();
    return NextResponse.json(list);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load registrations";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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
    const residence = String(body.residence ?? "").trim();
    const whatsapp = String(body.whatsapp ?? "").trim();
    const bringPreset = String(body.bringPreset ?? "").trim();
    const bringOther = String(body.bringOther ?? "").trim();

    if (!fullName || !email || !phone || !residence) {
      return NextResponse.json(
        { error: "Name, email, phone, and residence are required." },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 },
      );
    }

    if (!bringPreset) {
      return NextResponse.json(
        { error: "Select what you will bring to share." },
        { status: 400 },
      );
    }

    const isOther = bringPreset === "Other";
    if (isOther && !bringOther) {
      return NextResponse.json(
        { error: "Tell us what you will bring (Other)." },
        { status: 400 },
      );
    }

    if (
      !isOther &&
      !(BRING_OPTIONS as readonly string[]).includes(bringPreset)
    ) {
      return NextResponse.json(
        { error: "Invalid picnic item choice." },
        { status: 400 },
      );
    }

    const bringItem = isOther ? bringOther : bringPreset;

    const registration = await createPendingRegistration({
      fullName,
      email,
      phone,
      residence,
      whatsapp: whatsapp || undefined,
      bringItem,
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
        bring_item: registration.bringItem,
      },
    });

    return NextResponse.json({
      authorizationUrl: paystack.authorizationUrl,
      reference: registration.paystackReference,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not start registration";
    const status = message.includes("closed") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
