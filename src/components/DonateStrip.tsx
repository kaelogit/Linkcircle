"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function DonateStrip() {
  const pathname = usePathname();
  if (pathname === "/donate" || pathname?.startsWith("/donate/")) return null;

  return (
    <section className="border-t border-ink/10 bg-mist print:hidden">
      <div className="section-pad mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 py-12 sm:flex-row sm:items-center sm:py-14">
        <div className="max-w-xl">
          <p className="text-sm uppercase tracking-[0.22em] text-lagoon">
            Support Link Circle
          </p>
          <h2 className="font-display mt-3 text-2xl sm:text-3xl">
            Donate to the community.
          </h2>
          <p className="mt-2 text-ink-soft">
            Help us fund hangouts, tools, and the next chapter of the movement.
          </p>
        </div>
        <Link
          href="/donate"
          className="shrink-0 rounded-full bg-sunset px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-sunset-deep"
        >
          Donate now
        </Link>
      </div>
    </section>
  );
}
