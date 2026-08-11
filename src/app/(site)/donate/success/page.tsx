import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Thank you",
};

type Props = {
  searchParams: Promise<{ ref?: string; amount?: string }>;
};

export default async function DonateSuccessPage({ searchParams }: Props) {
  const { amount } = await searchParams;
  const naira = amount ? Number(amount) : null;

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
          Gift received
        </p>
        <h1 className="font-display mt-4 text-4xl sm:text-5xl">
          Thank you for building with us.
        </h1>
        <p className="mt-4 text-lg text-ink-soft">
          {naira && Number.isFinite(naira)
            ? `Your ₦${naira.toLocaleString("en-NG")} gift just helped Link Circle grow.`
            : "Your gift just helped Link Circle grow."}{" "}
          Network. Grow. Belong.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-ink px-8 py-3.5 text-sm font-semibold text-foam"
          >
            Back home
          </Link>
          <Link
            href="/events"
            className="rounded-full border border-ink/15 px-8 py-3.5 text-sm font-semibold"
          >
            See events
          </Link>
        </div>
      </section>
    </div>
  );
}
