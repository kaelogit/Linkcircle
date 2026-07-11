import type { Metadata } from "next";
import Link from "next/link";
import { MARKETPLACE_RULES, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "LC Marketplace",
};

export default function MarketplacePage() {
  return (
    <div className="pt-8 sm:pt-12">
      <section className="section-pad mx-auto max-w-6xl pb-12">
        <p className="text-sm uppercase tracking-[0.22em] text-sunset">
          LC Marketplace
        </p>
        <h1 className="font-display mt-4 max-w-3xl text-5xl leading-[1.05] sm:text-6xl">
          The official business hub of Link Circle.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-ink-soft">
          A dedicated space for buying, selling, promoting products and
          services, and connecting buyers with trusted sellers within our
          community.
        </p>
      </section>

      <section className="section-pad mx-auto max-w-6xl pb-24">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] bg-ink p-8 text-foam sm:p-10">
            <h2 className="font-display text-3xl">Promote every day.</h2>
            <p className="mt-4 text-foam/75">
              Business owners, vendors, entrepreneurs, freelancers, and service
              providers are encouraged to post and promote their businesses
              every day. Consistency creates visibility. Don&apos;t hesitate to
              showcase what you do.
            </p>
            <p className="mt-6 text-foam/75">
              Our goal is simple: a trusted marketplace where members support
              one another, discover businesses, gain customers, and grow
              together.
            </p>
            <a
              href={SITE.marketplaceInvite}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex rounded-full bg-sunset px-5 py-3 text-sm font-semibold"
            >
              Open Marketplace on WhatsApp
            </a>
          </div>

          <div className="rounded-[2rem] border border-ink/10 bg-mist p-8 sm:p-10">
            <h2 className="font-display text-2xl">House rules</h2>
            <ul className="mt-6 space-y-4">
              {MARKETPLACE_RULES.map((rule) => (
                <li key={rule} className="flex gap-3 text-ink-soft">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-lagoon" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/join"
              className="mt-8 inline-flex text-sm font-semibold text-sunset underline-offset-4 hover:underline"
            >
              Not in Link Circle yet? Join first →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
