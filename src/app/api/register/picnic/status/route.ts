import { NextResponse } from "next/server";
import {
  getPicnicSlotStatus,
  reconcilePendingPicnicPayments,
} from "@/lib/registrations";

export async function GET() {
  try {
    await reconcilePendingPicnicPayments();
    const status = await getPicnicSlotStatus();
    return NextResponse.json(status);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load slot status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
