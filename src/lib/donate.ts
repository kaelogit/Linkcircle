import { randomBytes } from "crypto";
import {
  initializePaystackPayment,
  isPaystackConfigured,
  siteOriginFromRequest,
} from "@/lib/paystack";

export const DONATE_PRESETS_NAIRA = [1_000, 2_000, 5_000, 10_000, 25_000, 50_000] as const;

export function isDonateReference(reference: string) {
  return reference.startsWith("lc_donate_");
}

export function createDonateReference() {
  return `lc_donate_${randomBytes(12).toString("hex")}`;
}

export async function startDonation(input: {
  request: Request;
  email: string;
  name: string;
  amountNaira: number;
  note?: string;
}) {
  if (!isPaystackConfigured()) {
    throw new Error(
      "Payments are not configured yet. Add Paystack keys to the server.",
    );
  }

  const amountNaira = Math.round(input.amountNaira);
  if (!Number.isFinite(amountNaira) || amountNaira < 500) {
    throw new Error("Minimum donation is ₦500.");
  }
  if (amountNaira > 5_000_000) {
    throw new Error("Amount is too large. Contact us for large gifts.");
  }

  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  if (!name || !email) {
    throw new Error("Name and email are required.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a valid email address.");
  }

  const reference = createDonateReference();
  const origin = siteOriginFromRequest(input.request);
  const callbackUrl = `${origin}/api/paystack/callback`;

  const paystack = await initializePaystackPayment({
    email,
    amountKobo: amountNaira * 100,
    reference,
    callbackUrl,
    metadata: {
      type: "donation",
      donor_name: name,
      note: input.note?.trim() || undefined,
    },
  });

  return paystack;
}
