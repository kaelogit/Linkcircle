import { NextResponse } from "next/server";
import { startDonation } from "@/lib/donate";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const amountNaira =
      typeof body.amountNaira === "number"
        ? body.amountNaira
        : Number(body.amountNaira);

    const paystack = await startDonation({
      request,
      email: String(body.email ?? ""),
      name: String(body.name ?? ""),
      amountNaira,
      note: body.note ? String(body.note) : undefined,
    });

    return NextResponse.json({
      authorizationUrl: paystack.authorizationUrl,
      reference: paystack.reference,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not start donation";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
