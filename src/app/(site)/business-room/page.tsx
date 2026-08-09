import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS_ROOM_RULES, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Business Room",
};

export default function BusinessRoomPage() {
  return (
    <div className="pt-8 sm:pt-12">
      <section className="section-pad mx-auto max-w-6xl pb-12">
        <p className="text-sm uppercase tracking-[0.22em] text-lagoon">
          Business Room
        </p>
        <h1 className="font-display mt-4 max-w-3xl text-5xl leading-[1.05] sm:text-6xl">
          Where ideas get sharpened.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-ink-soft">
          A dedicated space for sharing business ideas and high-minded
          discussions. Builders, founders, freelancers, and curious minds talk
          strategy, opportunities, and every kind of business conversation.
        </p>
      </section>

      <section className="section-pad mx-auto max-w-6xl pb-24">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] bg-ink p-8 text-foam sm:p-10">
            <h2 className="font-display text-3xl">Think out loud. Grow together.</h2>
            <p className="mt-4 text-foam/75">
              Pitch an idea. Pressure-test a plan. Ask for feedback. Break down
              industries, markets, and models with people who actually care about
              building.
            </p>
            <p className="mt-6 text-foam/75">
              Marketplace is for buying and selling. Business Room is for the
              conversations behind the hustle — ideas, insights, and serious
              discussion.
            </p>
            <a
              href={SITE.whatsappInvite}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex rounded-full bg-lagoon px-5 py-3 text-sm font-semibold text-ink"
            >
              Open Business Room on WhatsApp
            </a>
            <p className="mt-4 text-sm text-foam/45">
              Looking to promote a product or service?{" "}
              <Link href="/marketplace" className="underline underline-offset-4">
                Use LC Marketplace →
              </Link>
            </p>
          </div>

          <div className="rounded-[2rem] border border-ink/10 bg-mist p-8 sm:p-10">
            <h2 className="font-display text-2xl">House rules</h2>
            <ul className="mt-6 space-y-4">
              {BUSINESS_ROOM_RULES.map((rule) => (
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
