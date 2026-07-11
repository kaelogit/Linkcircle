import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Join",
};

export default function JoinPage() {
  return (
    <div className="pt-8 sm:pt-12">
      <section className="section-pad mx-auto max-w-6xl pb-24">
        <div className="overflow-hidden rounded-[2rem] atmosphere grain px-8 py-16 text-foam sm:px-12 sm:py-20">
          <p className="text-sm uppercase tracking-[0.22em] text-sand">
            Join Link Circle
          </p>
          <h1 className="font-display mt-4 max-w-3xl text-5xl leading-[1.05] sm:text-6xl">
            Your people are already here.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-foam/80">
            We&apos;re growing every day along {SITE.corridor}. Tap in, intro
            yourself on Sunday, and become part of the movement.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={SITE.whatsappInvite}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-sunset px-6 py-3.5 text-sm font-semibold"
            >
              Join WhatsApp community
            </a>
            <a
              href={`mailto:${SITE.contactEmail}?subject=Link%20Circle%20Join%20Request`}
              className="rounded-full border border-white/30 px-6 py-3.5 text-sm font-semibold"
            >
              Email the admins
            </a>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              t: "1. Request access",
              d: "Use the WhatsApp invite or message an admin.",
            },
            {
              t: "2. Introduce yourself",
              d: "Sundays are for new members and calm intros.",
            },
            {
              t: "3. Show up",
              d: "Follow the weekly rhythm. Join hangouts. Support the marketplace.",
            },
          ].map((step) => (
            <div
              key={step.t}
              className="rounded-[1.5rem] border border-ink/10 bg-mist p-6"
            >
              <h2 className="font-display text-xl">{step.t}</h2>
              <p className="mt-3 text-ink-soft">{step.d}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-ink/50">
          After you join, introduce yourself on Sunday and plug into the weekly
          rhythm.
        </p>
      </section>
    </div>
  );
}
