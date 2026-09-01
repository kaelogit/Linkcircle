import { NextResponse } from "next/server";
import {
  finalizePaidRegistration,
  getRegistrationByReference,
  markRegistrationFailed,
} from "@/lib/registrations";
import {
  finalizePaidIslandCampRegistration,
} from "@/lib/island-camp-registrations";
import {
  siteOriginFromRequest,
  verifyPaystackPayment,
} from "@/lib/paystack";
import { PICNIC_AMOUNT_KOBO } from "@/lib/picnic";
import { isIslandCampReference, ISLAND_CAMP_EVENT_SLUG } from "@/lib/island-camp";
import { getParticipantsByEvent } from "@/lib/participants";
import { isDonateReference } from "@/lib/donate";

export async function GET(request: Request) {
  const origin = siteOriginFromRequest(request);
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  if (!reference) {
    return NextResponse.redirect(`${origin}/donate?error=missing_ref`);
  }

  if (isDonateReference(reference)) {
    try {
      const verified = await verifyPaystackPayment(reference);
      if (verified.status !== "success") {
        return NextResponse.redirect(`${origin}/donate?error=payment_failed`);
      }
      const amountNaira = Math.round(verified.amount / 100);
      return NextResponse.redirect(
        `${origin}/donate/success?ref=${encodeURIComponent(reference)}&amount=${amountNaira}`,
      );
    } catch (err) {
      console.error("Donate callback error:", err);
      return NextResponse.redirect(`${origin}/donate?error=verify`);
    }
  }

  if (isIslandCampReference(reference)) {
    try {
      const verified = await verifyPaystackPayment(reference);
      const reg = await getRegistrationByReference(reference);
      const minAmount = reg?.amountKobo ?? 0;

      if (verified.status !== "success") {
        await markRegistrationFailed(reference);
        return NextResponse.redirect(
          `${origin}/events/${ISLAND_CAMP_EVENT_SLUG}/register?error=payment_failed`,
        );
      }

      if (verified.amount < minAmount) {
        await markRegistrationFailed(reference);
        return NextResponse.redirect(
          `${origin}/events/${ISLAND_CAMP_EVENT_SLUG}/register?error=amount`,
        );
      }

      await finalizePaidIslandCampRegistration(reference);
      return NextResponse.redirect(
        `${origin}/register/island-camp/success?ref=${encodeURIComponent(reference)}`,
      );
    } catch (err) {
      console.error("Island camp callback error:", err);
      const reg = await getRegistrationByReference(reference).catch(() => null);
      if (reg?.status === "paid") {
        return NextResponse.redirect(
          `${origin}/register/island-camp/success?ref=${encodeURIComponent(reference)}`,
        );
      }
      return NextResponse.redirect(
        `${origin}/events/${ISLAND_CAMP_EVENT_SLUG}/register?error=verify`,
      );
    }
  }

  // Picnic registration
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
