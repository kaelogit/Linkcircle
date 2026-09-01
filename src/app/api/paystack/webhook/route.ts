import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import {
  finalizePaidRegistration,
  getRegistrationByReference,
  markRegistrationFailed,
} from "@/lib/registrations";
import { finalizePaidIslandCampRegistration } from "@/lib/island-camp-registrations";
import { verifyPaystackPayment } from "@/lib/paystack";
import { PICNIC_AMOUNT_KOBO } from "@/lib/picnic";
import { isIslandCampReference } from "@/lib/island-camp";
import { isDonateReference } from "@/lib/donate";

function validSignature(rawBody: string, signature: string | null) {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secret || !signature) return false;
  const hash = createHmac("sha512", secret).update(rawBody).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!validSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const event = JSON.parse(rawBody) as {
      event?: string;
      data?: { reference?: string; status?: string };
    };

    const reference = event.data?.reference;
    if (!reference || isDonateReference(reference)) {
      return NextResponse.json({ ok: true });
    }

    if (event.event === "charge.success") {
      const verified = await verifyPaystackPayment(reference);
      if (verified.status !== "success") {
        return NextResponse.json({ ok: true });
      }

      if (isIslandCampReference(reference)) {
        const reg = await getRegistrationByReference(reference);
        if (reg && verified.amount >= reg.amountKobo) {
          await finalizePaidIslandCampRegistration(reference);
        }
      } else {
        if (verified.amount >= PICNIC_AMOUNT_KOBO) {
          await finalizePaidRegistration(reference);
        }
      }
    } else if (
      event.event === "charge.failed" ||
      event.data?.status === "failed"
    ) {
      await markRegistrationFailed(reference);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Paystack webhook error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
