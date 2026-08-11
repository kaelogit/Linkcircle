import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { PicnicRegisterForm } from "@/components/PicnicRegisterForm";

export const metadata: Metadata = {
  title: "Register · Networking Picnic",
};

export default function PicnicRegisterPage() {
  return (
    <div className="pt-8 sm:pt-12">
      <section className="section-pad mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[1.75rem] border border-ink/10 bg-ink sm:rounded-[2rem]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/events/networking-picnic-aug-29.png"
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
        <Suspense fallback={<p className="text-ink-soft">Loading registration…</p>}>
          <PicnicRegisterForm />
        </Suspense>
      </section>
    </div>
  );
}
