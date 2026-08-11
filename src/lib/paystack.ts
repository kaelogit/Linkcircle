import { SITE } from "./site";

const PAYSTACK_BASE = "https://api.paystack.co";

function secretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!key) {
    throw new Error(
      "PAYSTACK_SECRET_KEY is not set. Add it in .env.local and Vercel.",
    );
  }
  return key;
}

export function isPaystackConfigured() {
  return Boolean(
    process.env.PAYSTACK_SECRET_KEY?.trim() &&
      process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.trim(),
  );
}

export type PaystackInitResult = {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
};

export async function initializePaystackPayment(input: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<PaystackInitResult> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amountKobo,
      reference: input.reference,
      currency: "NGN",
      callback_url: input.callbackUrl,
      metadata: {
        ...input.metadata,
        site: SITE.url,
      },
    }),
  });

  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json.message || "Paystack initialize failed");
  }

  return {
    authorizationUrl: json.data.authorization_url as string,
    accessCode: json.data.access_code as string,
    reference: json.data.reference as string,
  };
}

export type PaystackVerifyResult = {
  status: string;
  amount: number;
  currency: string;
  reference: string;
  paidAt?: string;
  customerEmail?: string;
};

export async function verifyPaystackPayment(
  reference: string,
): Promise<PaystackVerifyResult> {
  const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secretKey()}` },
      cache: "no-store",
    },
  );
  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json.message || "Paystack verify failed");
  }

  return {
    status: json.data.status as string,
    amount: json.data.amount as number,
    currency: json.data.currency as string,
    reference: json.data.reference as string,
    paidAt: json.data.paid_at as string | undefined,
    customerEmail: json.data.customer?.email as string | undefined,
  };
}

export function siteOriginFromRequest(request: Request) {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim() || SITE.url;
  try {
    const url = new URL(request.url);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      return url.origin;
    }
  } catch {
    // fall through
  }
  return env.replace(/\/$/, "");
}
