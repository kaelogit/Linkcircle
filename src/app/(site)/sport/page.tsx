import type { Metadata } from "next";
import Link from "next/link";
import { SITE, SPORT_BANTER_RULES } from "@/lib/site";

export const metadata: Metadata = {
  title: "LC Sport Banter / FPL",
};

export default function SportBanterPage() {
  return (
    <div className="pt-8 sm:pt-12">
      <section className="section-pad mx-auto max-w-6xl pb-12">
        <p className="text-sm uppercase tracking-[0.22em] text-sunset">
          LC Sport Banter / FPL
        </p>
        <h1 className="font-display mt-4 max-w-3xl text-5xl leading-[1.05] sm:text-6xl">
          Scores, shade, and Fantasy drama.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-ink-soft">
          The Link Circle sports room — football banter, match-day energy, and
          Fantasy Premier League talk. Argue transfers, celebrate wins, and
          roast the week&apos;s worst captains.
        </p>
      </section>

      <section className="section-pad mx-auto max-w-6xl pb-24">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div
            className="rounded-[2rem] p-8 text-foam sm:p-10"
            style={{
              background:
                "linear-gradient(145deg, #0b1418 0%, #0e2a1a 40%, #1a4d2e 78%, #d4a24a 100%)",
            }}
          >
            <h2 className="font-display text-3xl">Match day never sleeps.</h2>
            <p className="mt-4 text-foam/80">
              Live reactions, predictions, and classic corridor banter. Whether
              you&apos;re a die-hard fan or just here for the FPL points — this
              room stays lively.
            </p>
            <ul className="mt-6 space-y-3 text-foam/80">
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sand" />
                Football talk &amp; club rivalries
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sand" />
                Fantasy Premier League (FPL) league chat
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sand" />
                Scores, transfers, and weekly roast sessions
              </li>
            </ul>
            <a
              href={SITE.sportBanterInvite}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex rounded-full bg-sand px-5 py-3 text-sm font-semibold text-ink"
            >
              Open Sport Banter on WhatsApp
            </a>
          </div>

          <div className="rounded-[2rem] border border-ink/10 bg-mist p-8 sm:p-10">
            <h2 className="font-display text-2xl">House rules</h2>
            <ul className="mt-6 space-y-4">
              {SPORT_BANTER_RULES.map((rule) => (
                <li key={rule} className="flex gap-3 text-ink-soft">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sunset" />
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
