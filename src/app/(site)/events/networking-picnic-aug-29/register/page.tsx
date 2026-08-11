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
      <section
        className="section-pad mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] text-foam sm:rounded-[2rem]"
        style={{
          background:
            "linear-gradient(145deg, #1a2e24 0%, #2d4a3a 28%, #790720 72%, #d4a24a 100%)",
        }}
      >
        <div className="relative px-6 py-10 sm:px-12 sm:py-14">
          <p className="text-sm uppercase tracking-[0.22em] text-sand/90">
            Saturday 29 August 2026 · Ajah → Eleko
          </p>
          <h1 className="font-display mt-4 max-w-3xl text-4xl leading-[1.05] sm:text-6xl">
            Networking Picnic
          </h1>
          <p className="mt-4 max-w-2xl text-base text-foam/85 sm:text-lg">
            Slow down. Connect. Share a meal. Learn EQ with Mrs. Adetoun
            Irukera. Only 30 seats — payment secures your spot.
          </p>
          <Link
            href="/events/networking-picnic-aug-29"
            className="mt-6 inline-flex text-sm text-sand underline-offset-4 hover:underline"
          >
            ← Event details
          </Link>
        </div>
      </section>

      <section className="section-pad mx-auto max-w-6xl py-10 sm:py-14">
        <Suspense
          fallback={
            <p className="text-ink-soft">Loading registration…</p>
          }
        >
          <PicnicRegisterForm />
        </Suspense>
      </section>
    </div>
  );
}
