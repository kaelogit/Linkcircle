"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/weekly", label: "Weekly" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/events", label: "Events" },
  { href: "/directory", label: "Directory" },
  { href: "/coordinators", label: "People" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dark = pathname === "/";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`relative z-50 section-pad ${
        dark
          ? "atmosphere text-foam"
          : "border-b border-ink/10 bg-foam text-ink"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between py-4">
        <Link href="/" className="group flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={SITE.logo}
            alt="Link Circle"
            className="h-10 w-10 rounded-full object-cover shadow-sm ring-1 ring-black/10"
          />
          <span className="font-display text-lg leading-none sm:text-xl">
            {SITE.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition ${
                  active
                    ? dark
                      ? "text-sand"
                      : "text-sunset"
                    : dark
                      ? "text-white/70 hover:text-white"
                      : "text-ink-soft hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <a
            href={SITE.whatsappInvite}
            target="_blank"
            rel="noreferrer"
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              dark
                ? "bg-sunset text-white hover:bg-sunset-deep"
                : "bg-ink text-foam hover:bg-ink-soft"
            }`}
          >
            Join the Circle
          </a>
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className={`relative z-[60] grid h-10 w-10 place-items-center rounded-full border lg:hidden ${
            dark || open
              ? "border-white/25 text-foam"
              : "border-ink/15 text-ink"
          } ${open ? "bg-ink" : ""}`}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <span className="flex w-4 flex-col gap-1">
            <span
              className={`h-0.5 w-full rounded-full bg-current transition ${
                open ? "translate-y-[6px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-0.5 w-full rounded-full bg-current transition ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-0.5 w-full rounded-full bg-current transition ${
                open ? "-translate-y-[6px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            className="absolute inset-0 bg-ink/70"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-[min(100%,20rem)] flex-col bg-ink px-6 pb-8 pt-24 text-foam shadow-2xl">
            <nav className="flex flex-col gap-1">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-xl px-3 py-3.5 text-lg ${
                    pathname === link.href ? "bg-white/10 text-sand" : ""
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <a
              href={SITE.whatsappInvite}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className="mt-6 rounded-full bg-sunset px-4 py-3.5 text-center font-semibold"
            >
              Join the Circle
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
