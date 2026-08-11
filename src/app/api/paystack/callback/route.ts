import { NextResponse } from "next/server";
import {
  finalizePaidRegistration,
  getRegistrationByReference,
  markRegistrationFailed,
} from "@/lib/registrations";
import {
  siteOriginFromRequest,
  verifyPaystackPayment,
} from "@/lib/paystack";
import { PICNIC_AMOUNT_KOBO } from "@/lib/picnic";
import { getParticipantsByEvent } from "@/lib/participants";

export async function GET(request: Request) {
  const origin = siteOriginFromRequest(request);
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  if (!reference) {
    return NextResponse.redirect(
      `${origin}/events/networking-picnic-aug-29/register?error=missing_ref`,
    );
  }

  try {
    const verified = await verifyPaystackPayment(reference);
    if (verified.status !== "success") {
      await markRegistrationFailed(reference);
      return NextResponse.redirect(
        `${origin}/events/networking-picnic-aug-29/register?error=payment_failed`,
      );
    }

    if (verified.amount < PICNIC_AMOUNT_KOBO) {
      await markRegistrationFailed(reference);
      return NextResponse.redirect(
        `${origin}/events/networking-picnic-aug-29/register?error=amount`,
      );
    }

    const result = await finalizePaidRegistration(reference);
    let token = result.passToken;

    if (!token && result.participantId) {
      const participants = await getParticipantsByEvent(result.eventId);
      token = participants.find((p) => p.id === result.participantId)?.passToken;
    }

    const q = new URLSearchParams({ ref: reference });
    if (token) q.set("pass", token);
    return NextResponse.redirect(
      `${origin}/register/picnic/success?${q.toString()}`,
    );
  } catch (err) {
    console.error("Paystack callback error:", err);
    const reg = await getRegistrationByReference(reference).catch(() => null);
    if (reg?.status === "paid") {
      return NextResponse.redirect(
        `${origin}/register/picnic/success?ref=${encodeURIComponent(reference)}`,
      );
    }
    return NextResponse.redirect(
      `${origin}/events/networking-picnic-aug-29/register?error=verify`,
    );
  }
}
