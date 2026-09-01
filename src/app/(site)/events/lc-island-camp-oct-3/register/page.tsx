import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { IslandCampRegisterForm } from "@/components/IslandCampRegisterForm";
import { getEventBySlug } from "@/lib/events";
import { SITE, isEventUpcoming } from "@/lib/site";
import { ISLAND_CAMP_EVENT_SLUG } from "@/lib/island-camp";
import { ISLAND_CAMP_HERO } from "@/lib/island-camp-copy";

export const metadata: Metadata = {
  title: "Register · LC Island Camp",
  description:
    "Book your slot for LC Island Camp at Tarkwa Bay. 3 to 4 October 2026. ₦23,000. Link Circle community only.",
  openGraph: {
    title: "Register · LC Island Camp",
    description: ISLAND_CAMP_HERO.headline,
    url: `${SITE.url}/events/${ISLAND_CAMP_EVENT_SLUG}/register`,
    siteName: SITE.name,
    locale: "en_NG",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function IslandCampRegisterPage() {
  const event = await getEventBySlug(ISLAND_CAMP_EVENT_SLUG);
  const open = event && isEventUpcoming(event);
  const gradient =
    event?.coverGradient ??
    "linear-gradient(145deg, #0a1628 0%, #1a3a5c 30%, #0d4d4a 55%, #790720 85%, #d4a24a 100%)";

  return (
    <div className="pt-8 sm:pt-12">
      <section className="section-pad mx-auto max-w-6xl">
        <div
          className="overflow-hidden rounded-[1.75rem] sm:rounded-[2rem]"
          style={{ background: gradient }}
        >
          <div className="relative px-6 py-14 text-foam sm:px-12 sm:py-20">
            <div className="pointer-events-none absolute inset-0 grain opacity-40" />
            <div className="relative">
              <p className="text-sm uppercase tracking-[0.28em] text-sand/80">
                {ISLAND_CAMP_HERO.eyebrow}
              </p>
              <h1 className="font-display mt-4 max-w-3xl text-4xl sm:text-5xl">
                {ISLAND_CAMP_HERO.headline}
              </h1>
              <p className="mt-4 max-w-xl text-lg text-foam/80">
                {open
                  ? "Secure your slot. Payment confirms your place on the camp list."
                  : "Registration is closed for this camp."}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4 px-1">
          <p className="text-sm text-ink-soft">
            {open
              ? "₦23,000 per slot · Link Circle community · closes 24 September"
              : "This camp is not open for registration."}
          </p>
          <Link
            href={`/events/${ISLAND_CAMP_EVENT_SLUG}`}
            className="text-sm font-semibold text-lagoon underline-offset-4 hover:underline"
          >
            ← Full event page
          </Link>
        </div>
      </section>

      <section className="section-pad mx-auto max-w-6xl pb-24 pt-8 sm:pt-12 sm:pb-14">
        {open ? (
          <Suspense
            fallback={<p className="text-ink-soft">Loading registration…</p>}
          >
            <IslandCampRegisterForm />
          </Suspense>
        ) : (
          <div className="rounded-[1.75rem] border border-ink/10 bg-mist p-8 sm:p-10">
            <h2 className="font-display text-2xl">Registration closed</h2>
            <p className="mt-3 max-w-xl text-ink-soft">
              LC Island Camp registration is not open right now.
            </p>
            <Link
              href={`/events/${ISLAND_CAMP_EVENT_SLUG}`}
              className="mt-6 inline-flex rounded-full bg-ink px-6 py-3 text-sm font-semibold text-foam"
            >
              View event
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
