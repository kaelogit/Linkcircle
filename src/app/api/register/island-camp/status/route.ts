import { NextResponse } from "next/server";
import {
  getIslandCampSlotStatus,
  reconcilePendingIslandCampPayments,
} from "@/lib/island-camp-registrations";
import {
  ISLAND_CAMP_AMOUNT_KOBO,
  ISLAND_CAMP_AMOUNT_NAIRA,
} from "@/lib/island-camp";
import {
  ISLAND_CAMP_DEPOSIT_NET_KOBO,
  islandCampBalanceGrossKobo,
  islandCampDepositGrossKobo,
} from "@/lib/island-camp-balance";
import { paystackFeeFromNet, paystackGrossFromNet } from "@/lib/paystack";

export async function GET() {
  try {
    await reconcilePendingIslandCampPayments();
    const slots = await getIslandCampSlotStatus();
    const feeKobo = paystackFeeFromNet(ISLAND_CAMP_AMOUNT_KOBO);
    const totalKobo = paystackGrossFromNet(ISLAND_CAMP_AMOUNT_KOBO);
    const depositFeeKobo = paystackFeeFromNet(ISLAND_CAMP_DEPOSIT_NET_KOBO);
    const depositTotalKobo = islandCampDepositGrossKobo();
    const balanceTotalKobo = islandCampBalanceGrossKobo();
    return NextResponse.json({
      ...slots,
      baseAmountNaira: ISLAND_CAMP_AMOUNT_NAIRA,
      paystackFeeNaira: Math.ceil(feeKobo / 100),
      totalAmountNaira: Math.ceil(totalKobo / 100),
      depositBaseNaira: Math.ceil(ISLAND_CAMP_DEPOSIT_NET_KOBO / 100),
      depositFeeNaira: Math.ceil(depositFeeKobo / 100),
      depositTotalNaira: Math.ceil(depositTotalKobo / 100),
      balanceTotalNaira: Math.ceil(balanceTotalKobo / 100),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load slot status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
