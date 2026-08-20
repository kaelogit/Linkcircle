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

/** LC admins who get a complimentary picnic seat (no Paystack). Skip if already paid. */
export type PicnicAdminSeat = {
  fullName: string;
  phone: string;
  email: string;
  residence?: string;
  bringItem?: string;
  /** Founder already paid publicly — never auto-comp */
  skipAuto?: boolean;
};

export const PICNIC_ADMIN_COMPLIMENTARY_SEATS: PicnicAdminSeat[] = [
  {
    fullName: "Abdulkareem Abdulkareem",
    phone: "",
    email: "founder@linkcircle.ng",
    skipAuto: true,
  },
  {
    fullName: "Chukwuebuka Elvis",
    phone: "08112759009",
    email: "elvis@linkcircle.ng",
    residence: "Link Circle admin",
    bringItem: "Admin / hosting support",
  },
  {
    fullName: "Mohammed Aalliyah Kaaka",
    phone: "08112849937",
    email: "aalliyah@linkcircle.ng",
    residence: "Link Circle admin",
    bringItem: "Admin / hosting support",
  },
  {
    fullName: "Fehintade Habibat Omolara",
    phone: "08108359209",
    email: "omolara@linkcircle.ng",
    residence: "Link Circle admin",
    bringItem: "Admin / hosting support",
  },
  {
    fullName: "Aremu Barakat Ejide",
    phone: "09077397922",
    email: "aremu@linkcircle.ng",
    residence: "Link Circle admin",
    bringItem: "Admin / hosting support",
  },
  {
    fullName: "Kiel Tee",
    phone: "09133263052",
    email: "kiel.tee@linkcircle.ng",
    residence: "Ajah / Lekki corridor",
    bringItem: "Admin / hosting support",
  },
];
