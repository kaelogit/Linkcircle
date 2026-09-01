import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { PicnicRegisterForm } from "@/components/PicnicRegisterForm";
import { getEventBySlug } from "@/lib/events";
import { SITE, isEventUpcoming } from "@/lib/site";

const picnicOgImage = "/events/networking-picnic-aug-29.png";
const registerUrl = `${SITE.url}/events/networking-picnic-aug-29/register`;

export const metadata: Metadata = {
  title: "Register · Networking Picnic",
  description:
    "Link Circle Networking Picnic — Saturday 29 August 2026. Registration is now closed.",
  openGraph: {
    title: "Link Circle Networking Picnic",
    description: "Saturday 29 August 2026 · Registration closed.",
    url: registerUrl,
    siteName: SITE.name,
    locale: "en_NG",
    type: "website",
    images: [
      {
        url: picnicOgImage,
        width: 1200,
        height: 630,
        alt: "Link Circle Networking Picnic — Saturday 29th August 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Link Circle Networking Picnic",
    description: "Saturday 29 August 2026 · Registration closed.",
    images: [picnicOgImage],
  },
};

export const dynamic = "force-dynamic";

export default async function PicnicRegisterPage() {
  const event = await getEventBySlug("networking-picnic-aug-29");
  const open = event && isEventUpcoming(event);

  return (
    <div className="pt-8 sm:pt-12">
      <section className="section-pad mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[1.75rem] border border-ink/10 bg-ink sm:rounded-[2rem]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={picnicOgImage}
            alt="Link Circle Networking Picnic — Saturday 29th August 2026"
            className="h-auto w-full object-cover object-top"
          />
        </div>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4 px-1">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-lagoon">
              Saturday 29 August 2026 · Past event
            </p>
            <h1 className="font-display mt-2 text-3xl sm:text-5xl">
              Networking Picnic
            </h1>
            <p className="mt-2 max-w-xl text-ink-soft">
              {open
                ? "Good people. Great conversations. Unforgettable memories. Only 30 seats — payment reserves yours."
                : "This hangout has passed. Registration is closed — watch Events for the next drop."}
            </p>
          </div>
          <Link
            href="/events/networking-picnic-aug-29"
            className="text-sm font-semibold text-sunset underline-offset-4 hover:underline"
          >
            ← Event details
          </Link>
        </div>
      </section>

      <section className="section-pad mx-auto max-w-6xl py-10 sm:py-14">
        {open ? (
          <Suspense
            fallback={<p className="text-ink-soft">Loading registration…</p>}
          >
            <PicnicRegisterForm />
          </Suspense>
        ) : (
          <div className="rounded-[1.75rem] border border-ink/10 bg-mist p-8 sm:p-10">
            <h2 className="font-display text-2xl">Registration closed</h2>
            <p className="mt-3 max-w-xl text-ink-soft">
              The Networking Picnic on 29 August 2026 is over. Thanks to everyone
              who came out.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/events/networking-picnic-aug-29"
                className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-foam"
              >
                View event recap
              </Link>
              <Link
                href="/events"
                className="rounded-full border border-ink/20 px-6 py-3 text-sm font-semibold"
              >
                See all events
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
