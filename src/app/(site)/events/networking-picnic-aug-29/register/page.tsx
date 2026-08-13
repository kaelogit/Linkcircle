import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { PicnicRegisterForm } from "@/components/PicnicRegisterForm";
import { SITE } from "@/lib/site";

const picnicOgImage = "/events/networking-picnic-aug-29.png";
const registerUrl = `${SITE.url}/events/networking-picnic-aug-29/register`;

export const metadata: Metadata = {
  title: "Register · Networking Picnic",
  description:
    "Link Circle Networking Picnic — Saturday 29 August 2026. ₦5,000 · only 30 seats. Good people, great conversations, unforgettable memories. Register & pay to reserve your spot.",
  openGraph: {
    title: "Link Circle Networking Picnic",
    description:
      "Saturday 29 August 2026 · ₦5,000 per person · Only 30 seats. Register now.",
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
    description:
      "Saturday 29 August 2026 · ₦5,000 · Only 30 seats. Register now.",
    images: [picnicOgImage],
  },
};

export default function PicnicRegisterPage() {
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
              Saturday 29 August 2026 · ₦5,000
            </p>
            <h1 className="font-display mt-2 text-3xl sm:text-5xl">
              Networking Picnic
            </h1>
            <p className="mt-2 max-w-xl text-ink-soft">
              Good people. Great conversations. Unforgettable memories. Only 30
              seats — payment reserves yours.
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
        <Suspense
          fallback={<p className="text-ink-soft">Loading registration…</p>}
        >
          <PicnicRegisterForm />
        </Suspense>
      </section>
    </div>
  );
}
