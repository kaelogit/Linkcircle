/** LC Island Camp: Tarkwa Bay overnight camping */
export const ISLAND_CAMP_EVENT_ID = "evt_island_camp_1003";
export const ISLAND_CAMP_EVENT_SLUG = "lc-island-camp-oct-3";
export const ISLAND_CAMP_CAPACITY = 30;
export const ISLAND_CAMP_CAPACITY_PER_GENDER = 15;
export const ISLAND_CAMP_AMOUNT_KOBO = 2_300_000; // ₦23,000 net to LC
export const ISLAND_CAMP_AMOUNT_NAIRA = 23_000;
/** Registration closes 24 September 2026, 11:59pm WAT */
export const ISLAND_CAMP_REGISTRATION_CLOSES_AT = "2026-09-24T23:59:59+01:00";
export const PENDING_HOLD_MS = 30 * 60 * 1000;

export type CampGender = "male" | "female";

export function isIslandCampReference(reference: string) {
  return reference.startsWith("lc_island_");
}

export function isIslandCampRegistrationOpen(now = Date.now()) {
  return now <= new Date(ISLAND_CAMP_REGISTRATION_CLOSES_AT).getTime();
}
