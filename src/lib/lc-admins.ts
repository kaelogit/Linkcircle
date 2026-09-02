import { normalizePhoneKey } from "./members";

export type LcAdminRole = "Founder" | "Admin";

export type LcAdminContact = {
  fullName: string;
  phone: string;
  email: string;
  role: LcAdminRole;
  /** Picnic only: founder pays publicly, no auto complimentary seat */
  skipPicnicAutoComp?: boolean;
  residence?: string;
  bringItem?: string;
};

/** LC team phones — used to flag admin registrations on admin pages. */
export const LC_ADMIN_CONTACTS: LcAdminContact[] = [
  {
    fullName: "Abdulkareem Abdulkareem",
    phone: "09125951202",
    email: "founder@linkcircle.ng",
    role: "Founder",
    skipPicnicAutoComp: true,
    residence: "Link Circle admin",
    bringItem: "Admin / hosting support",
  },
  {
    fullName: "Chukwuebuka Elvis",
    phone: "08112759009",
    email: "elvis@linkcircle.ng",
    role: "Admin",
    residence: "Link Circle admin",
    bringItem: "Admin / hosting support",
  },
  {
    fullName: "Mohammed Aalliyah Kaaka",
    phone: "08112849937",
    email: "aalliyah@linkcircle.ng",
    role: "Admin",
    residence: "Link Circle admin",
    bringItem: "Admin / hosting support",
  },
  {
    fullName: "Fehintade Habibat Omolara",
    phone: "08108359209",
    email: "omolara@linkcircle.ng",
    role: "Admin",
    residence: "Link Circle admin",
    bringItem: "Admin / hosting support",
  },
  {
    fullName: "Aremu Barakat Ejide",
    phone: "09077397922",
    email: "aremu@linkcircle.ng",
    role: "Admin",
    residence: "Link Circle admin",
    bringItem: "Admin / hosting support",
  },
  {
    fullName: "Kiel Tee",
    phone: "09133263052",
    email: "kiel.tee@linkcircle.ng",
    role: "Admin",
    residence: "Ajah / Lekki corridor",
    bringItem: "Admin / hosting support",
  },
];

export function phoneMatchKey(phone: string) {
  const digits = normalizePhoneKey(phone);
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

export function matchLcAdminByPhone(phone: string) {
  const key = phoneMatchKey(phone);
  if (!key) return null;
  return (
    LC_ADMIN_CONTACTS.find(
      (admin) => admin.phone && phoneMatchKey(admin.phone) === key,
    ) ?? null
  );
}
