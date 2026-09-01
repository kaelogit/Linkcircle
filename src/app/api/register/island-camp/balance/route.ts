import { NextResponse } from "next/server";
import { startIslandCampBalancePayment } from "@/lib/island-camp-registrations";
import {
  initializePaystackPayment,
  isPaystackConfigured,
  siteOriginFromRequest,
} from "@/lib/paystack";

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

    const balanceRef = String(body.balanceRef ?? body.ref ?? "").trim();
    const phone = String(body.phone ?? "").trim();

    if (!balanceRef && !phone) {
      return NextResponse.json(
        { error: "Enter your phone number or use your balance payment link." },
        { status: 400 },
      );
    }

    const registration = await startIslandCampBalancePayment({
      balanceRef: balanceRef || undefined,
      phone: phone || undefined,
    });

    const origin = siteOriginFromRequest(request);
    const callbackUrl = `${origin}/api/paystack/callback`;

    const paystack = await initializePaystackPayment({
      email: registration.email,
      amountKobo: registration.balanceDueKobo ?? 0,
      reference: registration.balanceReference!,
      callbackUrl,
      metadata: {
        registration_id: registration.id,
        event_id: registration.eventId,
        full_name: registration.fullName,
        payment_type: "balance",
      },
    });

    return NextResponse.json({
      authorizationUrl: paystack.authorizationUrl,
      reference: registration.balanceReference,
      amountKobo: registration.balanceDueKobo,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not start balance payment";
    const status =
      message.includes("deadline") ||
      message.includes("No outstanding") ||
      message.includes("not ready")
        ? 409
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ref = searchParams.get("ref")?.trim();
  if (!ref) {
    return NextResponse.json({ error: "Missing ref" }, { status: 400 });
  }

  try {
    const registration = await startIslandCampBalancePayment({ balanceRef: ref });
    return NextResponse.json({
      fullName: registration.fullName,
      balanceDueKobo: registration.balanceDueKobo,
      balanceDueNaira: Math.ceil((registration.balanceDueKobo ?? 0) / 100),
      balanceReference: registration.balanceReference,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Balance lookup failed";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
