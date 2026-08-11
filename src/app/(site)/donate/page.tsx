import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { DonateForm } from "@/components/DonateForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Support Link Circle — help us build better hangouts, tools, and community experiences along Ajah → Eleko.",
};

export default function DonatePage() {
  return (
    <div className="pt-8 sm:pt-12">
      <section
        className="section-pad relative mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] text-foam sm:rounded-[2rem]"
        style={{
          background:
            "linear-gradient(145deg, #0b1418 0%, #1a0a10 40%, #790720 78%, #d4a24a 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute -right-16 top-0 h-72 w-72 rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(216,162,74,0.5), transparent 70%)",
          }}
        />
        <div className="relative px-6 py-12 sm:px-12 sm:py-16">
          <p className="text-sm uppercase tracking-[0.28em] text-sand">
            Support the circle
          </p>
          <h1 className="font-display mt-4 max-w-3xl text-4xl leading-[1.05] sm:text-6xl">
            Help us build what the corridor deserves.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-foam/80 sm:text-lg">
            Link Circle is growing — hangouts, tools, marketplace energy, and
            real relationships along {SITE.corridor}. Your gift keeps the
            movement funded, organized, and alive.
          </p>
        </div>
      </section>

      <section className="section-pad mx-auto max-w-6xl py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-3xl">Where gifts go</h2>
              <p className="mt-3 max-w-xl text-ink-soft">
                Not noise. Not fluff. Fuel for the things that make this
                community feel human.
              </p>
            </div>

            <ul className="space-y-4">
              {[
                {
                  t: "Better hangouts",
                  d: "Venues, logistics, and experiences that turn chats into friendships.",
                },
                {
                  t: "Community tools",
                  d: "The website, passes, directory, and ops that keep LC organized.",
                },
                {
                  t: "Programs & growth",
                  d: "Sessions, speakers, sports days, and the next experiments we try.",
                },
                {
                  t: "Access & care",
                  d: "Support that helps more people show up and belong.",
                },
              ].map((item) => (
                <li
                  key={item.t}
                  className="rounded-[1.25rem] border border-ink/10 bg-white/80 px-5 py-5"
                >
                  <p className="font-display text-xl">{item.t}</p>
                  <p className="mt-2 text-sm text-ink-soft">{item.d}</p>
                </li>
              ))}
            </ul>

            <p className="text-sm text-ink/45">
              Prefer to plug in first?{" "}
              <Link href="/join" className="font-semibold text-sunset underline-offset-4 hover:underline">
                Join the WhatsApp community →
              </Link>
            </p>
          </div>

          <Suspense fallback={<p className="text-ink-soft">Loading…</p>}>
            <DonateForm />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
