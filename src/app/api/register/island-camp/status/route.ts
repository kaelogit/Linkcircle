import { NextResponse } from "next/server";
import {
  getIslandCampSlotStatus,
  reconcilePendingIslandCampPayments,
} from "@/lib/island-camp-registrations";
import {
  ISLAND_CAMP_AMOUNT_KOBO,
  ISLAND_CAMP_AMOUNT_NAIRA,
} from "@/lib/island-camp";
import { paystackFeeFromNet, paystackGrossFromNet } from "@/lib/paystack";

export async function GET() {
  try {
    await reconcilePendingIslandCampPayments();
    const slots = await getIslandCampSlotStatus();
    const feeKobo = paystackFeeFromNet(ISLAND_CAMP_AMOUNT_KOBO);
    const totalKobo = paystackGrossFromNet(ISLAND_CAMP_AMOUNT_KOBO);
    return NextResponse.json({
      ...slots,
      baseAmountNaira: ISLAND_CAMP_AMOUNT_NAIRA,
      paystackFeeNaira: Math.ceil(feeKobo / 100),
      totalAmountNaira: Math.ceil(totalKobo / 100),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load slot status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
