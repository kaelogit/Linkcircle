import type { Metadata } from "next";
import Link from "next/link";
import { getRegistrationByReference } from "@/lib/registrations";
import {
  ISLAND_CAMP_AMOUNT_NAIRA,
  ISLAND_CAMP_EVENT_SLUG,
} from "@/lib/island-camp";

export const metadata: Metadata = {
  title: "Booking confirmed · LC Island Camp",
};

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ ref?: string }> };

export default async function IslandCampSuccessPage({ searchParams }: Props) {
  const { ref } = await searchParams;
  let name = "";
  let email = "";
  let gender = "";
  let paid = false;

  if (ref) {
    const reg = await getRegistrationByReference(ref);
    if (reg) {
      name = reg.fullName;
      email = reg.email;
      gender = reg.gender ?? "";
      paid = reg.status === "paid";
    }
  }

  return (
    <div className="pt-8 sm:pt-12">
      <section className="section-pad mx-auto max-w-2xl pb-24 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15">
          <svg
            viewBox="0 0 24 24"
            className="h-10 w-10 text-emerald-600"
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
          You&apos;re in
        </p>
        <h1 className="font-display mt-4 text-4xl sm:text-5xl">
          {name ? `See you on the island, ${name.split(" ")[0]}!` : "Booking confirmed"}
        </h1>
        <p className="mt-4 text-lg text-ink-soft">
          {paid
            ? `Your ₦${ISLAND_CAMP_AMOUNT_NAIRA.toLocaleString("en-NG")} camp fee is confirmed for LC Island Camp.`
            : "We are confirming your payment. If this page does not update, message an admin."}
          {gender ? ` ${gender.charAt(0).toUpperCase()}${gender.slice(1)} slot secured.` : ""}
        </p>
        <p className="mt-3 text-ink-soft">
          Jetty meet-up details and the full timeline will drop in the Link
          Circle WhatsApp group. Bring your own food. Sort your tent-mate with
          them directly.
        </p>

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
