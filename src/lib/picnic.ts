/** Networking Picnic — fixed event for public registration */
export const PICNIC_EVENT_ID = "evt_networking_picnic_0829";
export const PICNIC_EVENT_SLUG = "networking-picnic-aug-29";
export const PICNIC_CAPACITY = 30;
export const PICNIC_AMOUNT_KOBO = 500_000; // ₦5,000
export const PICNIC_AMOUNT_NAIRA = 5_000;
/** Soft hold: pending checkouts count toward remaining for this long */
export const PENDING_HOLD_MS = 30 * 60 * 1000;

export const BRING_OPTIONS = [
  "Jollof Rice & Chicken",
  "Fried Rice",
  "Spaghetti",
  "Meat Pie",
  "Shawarma",
  "Pizza",
  "Burgers",
  "Hot Dogs",
  "Fries",
  "Small Chops",
  "Sandwiches",
  "Scotch Eggs",
  "Popcorn",
  "Biscuits",
  "Chocolates",
  "Sweets",
  "Groundnuts",
  "Fruits",
  "Soft Drinks",
  "Juice",
  "Water",
  "Smoothies",
  "Cake or Cupcakes",
  "Fried Rice & Turkey",
  "Other",
] as const;

export type BringOption = (typeof BRING_OPTIONS)[number];

import { LC_ADMIN_CONTACTS } from "./lc-admins";

export type PicnicAdminSeat = {
  fullName: string;
  phone: string;
  email: string;
  residence?: string;
  bringItem?: string;
  /** Founder already paid publicly — never auto-comp */
  skipAuto?: boolean;
};

export const PICNIC_ADMIN_COMPLIMENTARY_SEATS: PicnicAdminSeat[] =
  LC_ADMIN_CONTACTS.map((admin) => ({
    fullName: admin.fullName,
    phone: admin.phone,
    email: admin.email,
    residence: admin.residence,
    bringItem: admin.bringItem,
    skipAuto: admin.skipPicnicAutoComp,
  }));
