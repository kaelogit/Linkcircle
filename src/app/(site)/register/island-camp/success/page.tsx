import type { Metadata } from "next";
import Link from "next/link";
import { getRegistrationByReference } from "@/lib/registrations";
import {
  ISLAND_CAMP_AMOUNT_NAIRA,
  ISLAND_CAMP_EVENT_SLUG,
  ISLAND_CAMP_REGISTRATION_CLOSES_AT,
} from "@/lib/island-camp";
import { islandCampBalanceUrl } from "@/lib/island-camp-balance";

export const metadata: Metadata = {
  title: "Booking confirmed · LC Island Camp",
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ ref?: string; deposit?: string; balance?: string }>;
};

export default async function IslandCampSuccessPage({ searchParams }: Props) {
  const { ref, deposit, balance } = await searchParams;
  let name = "";
  let email = "";
  let gender = "";
  let paid = false;
  let depositOnly = false;
  let balanceUrl = "";
  let balanceRef = "";

  if (ref) {
    const reg = await getRegistrationByReference(ref);
    if (reg) {
      name = reg.fullName;
      email = reg.email;
      gender = reg.gender ?? "";
      paid = reg.status === "paid";
      depositOnly = reg.status === "deposit_paid";
      if (reg.balanceReference) {
        balanceRef = reg.balanceReference;
        balanceUrl = islandCampBalanceUrl(reg.balanceReference);
      }
    }
  }

  if (!balanceRef && balance) {
    balanceRef = balance;
    balanceUrl = islandCampBalanceUrl(balance);
  }

  const isDepositSuccess = deposit === "1" || depositOnly;
  const deadline = new Date(ISLAND_CAMP_REGISTRATION_CLOSES_AT).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "long", year: "numeric" },
  );

  return (
    <div className="pt-8 sm:pt-12">
      <section className="section-pad mx-auto max-w-2xl pb-24 text-center">
        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
            isDepositSuccess && !paid
              ? "bg-amber-500/15"
              : "bg-emerald-500/15"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className={`h-10 w-10 ${
              isDepositSuccess && !paid ? "text-amber-600" : "text-emerald-600"
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <p className="mt-8 text-sm uppercase tracking-[0.22em] text-lagoon">
          {isDepositSuccess && !paid ? "Deposit received" : "You&apos;re in"}
        </p>
        <h1 className="font-display mt-4 text-4xl sm:text-5xl">
          {name
            ? isDepositSuccess && !paid
              ? `Slot held, ${name.split(" ")[0]}`
              : `See you on the island, ${name.split(" ")[0]}!`
            : isDepositSuccess && !paid
              ? "Deposit received"
              : "Booking confirmed"}
        </h1>
        <p className="mt-4 text-lg text-ink-soft">
          {paid
            ? `Your ₦${ISLAND_CAMP_AMOUNT_NAIRA.toLocaleString("en-NG")} camp fee is confirmed for LC Island Camp.`
            : isDepositSuccess
              ? `Your 50% deposit is confirmed and your slot is reserved. Pay the remaining balance before ${deadline} to stay on the camp list. The deposit is non-refundable.`
              : "We are confirming your payment. If this page does not update, message an admin."}
          {gender ? ` ${gender.charAt(0).toUpperCase()}${gender.slice(1)} slot secured.` : ""}
        </p>

        {isDepositSuccess && !paid && balanceUrl && (
          <div className="mx-auto mt-8 max-w-md rounded-2xl border border-amber-200/60 bg-amber-50/80 px-5 py-5 text-left">
            <p className="text-xs uppercase tracking-[0.16em] text-amber-800/70">
              Balance payment
            </p>
            <p className="mt-2 text-sm text-amber-950/80">
              Save this link. You will need it to pay the remaining 50% before{" "}
              {deadline}.
            </p>
            <Link
              href={`/register/island-camp/balance?ref=${encodeURIComponent(balanceRef)}`}
              className="mt-4 inline-flex w-full justify-center rounded-full bg-lagoon py-3 text-sm font-semibold text-white"
            >
              Pay balance now
            </Link>
            <p className="mt-3 break-all text-xs text-amber-900/50">{balanceUrl}</p>
          </div>
        )}

        {paid && (
          <p className="mt-3 text-ink-soft">
            Jetty meet-up details and the full timeline will drop in the Link
            Circle WhatsApp group. Food is on you, but there is plenty to buy on
            the island. Sort your tent-mate with them directly.
          </p>
        )}

        {(email || ref) && paid && (
          <div className="mx-auto mt-8 max-w-md rounded-2xl border border-ink/10 bg-white px-5 py-4 text-left text-sm">
            <p className="text-xs uppercase tracking-[0.16em] text-ink/40">
              Booking summary
            </p>
            <dl className="mt-3 space-y-2 text-ink-soft">
              {name && (
                <div className="flex justify-between gap-4">
                  <dt>Name</dt>
                  <dd className="font-medium text-ink">{name}</dd>
                </div>
              )}
              {email && (
                <div className="flex justify-between gap-4">
                  <dt>Email</dt>
                  <dd className="truncate font-medium text-ink">{email}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt>Camp fee</dt>
                <dd className="font-medium text-ink">
                  ₦{ISLAND_CAMP_AMOUNT_NAIRA.toLocaleString("en-NG")}
                </dd>
              </div>
            </dl>
          </div>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href={`/events/${ISLAND_CAMP_EVENT_SLUG}`}
            className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-foam"
          >
            Event details
          </Link>
          <Link
            href="/events"
            className="rounded-full border border-ink/20 px-6 py-3 text-sm font-semibold"
          >
            All events
          </Link>
        </div>
      </section>
    </div>
  );
}
