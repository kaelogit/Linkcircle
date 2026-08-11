import { NextResponse } from "next/server";
import { getPicnicSlotStatus } from "@/lib/registrations";

export async function GET() {
  try {
    const status = await getPicnicSlotStatus();
    return NextResponse.json(status);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load slot status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
