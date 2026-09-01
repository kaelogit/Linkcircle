import type { EventRegistration } from "./registrations";
import {
  ISLAND_CAMP_REGISTRATION_CLOSES_AT,
  ISLAND_CAMP_AMOUNT_KOBO,
} from "./island-camp";
import { paystackGrossFromNet } from "./paystack";
import { SITE } from "./site";

export const ISLAND_CAMP_DEPOSIT_NET_KOBO = ISLAND_CAMP_AMOUNT_KOBO / 2;

export function islandCampDepositGrossKobo() {
  return paystackGrossFromNet(ISLAND_CAMP_DEPOSIT_NET_KOBO);
}

export function islandCampBalanceGrossKobo() {
  return paystackGrossFromNet(ISLAND_CAMP_DEPOSIT_NET_KOBO);
}

export function islandCampBalanceUrl(balanceReference: string) {
  return `${SITE.url}/register/island-camp/balance?ref=${encodeURIComponent(balanceReference)}`;
}

export function islandCampBalanceDeadlineLabel() {
  return new Date(ISLAND_CAMP_REGISTRATION_CLOSES_AT).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "long", year: "numeric" },
  );
}

export function islandCampBalanceReminderMessage(reg: EventRegistration) {
  const first = reg.fullName.trim().split(/\s+/)[0] || "there";
  const balanceNaira = Math.ceil(
    (reg.balanceDueKobo || islandCampBalanceGrossKobo()) / 100,
  );
  const deadline = islandCampBalanceDeadlineLabel();
  const url = reg.balanceReference
    ? islandCampBalanceUrl(reg.balanceReference)
    : `${SITE.url}/register/island-camp/balance`;

  return [
    `Hi ${first}, this is Link Circle about LC Island Camp.`,
    "",
    `Your 50% deposit is confirmed. Please pay your remaining balance of ₦${balanceNaira.toLocaleString("en-NG")} before ${deadline} to keep your slot.`,
    "",
    "Pay here:",
    url,
    "",
    "The deposit is non-refundable. Reply here if you have questions.",
    "",
    "Link Circle",
  ].join("\n");
}

export function whatsappShareUrl(message: string, phone?: string) {
  const text = encodeURIComponent(message);
  const digits = (phone || "").replace(/\D/g, "");
  let intl = digits;
  if (digits.length === 11 && digits.startsWith("0")) {
    intl = `234${digits.slice(1)}`;
  }
  if (intl.length >= 10 && intl.length <= 15) {
    return `https://wa.me/${intl}?text=${text}`;
  }
  return `https://wa.me/?text=${text}`;
}
