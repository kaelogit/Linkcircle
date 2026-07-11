"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { DumpMedia, resolveDumpType } from "@/components/DumpMedia";
import type { EventDump } from "@/lib/site";

export type GalleryDump = EventDump & {
  eventTitle?: string;
  eventSlug?: string;
};

export function DumpGallery({
  dumps,
  linkToEvent = false,
}: {
  dumps: GalleryDump[];
  linkToEvent?: boolean;
}) {
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const prev = useCallback(() => {
    setActive((i) => (i === null ? i : (i - 1 + dumps.length) % dumps.length));
  }, [dumps.length]);
  const next = useCallback(() => {
    setActive((i) => (i === null ? i : (i + 1) % dumps.length));
  }, [dumps.length]);

  useEffect(() => {
    if (active === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [active, close, prev, next]);

  if (dumps.length === 0) return null;

  const current = active !== null ? dumps[active] : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {dumps.map((dump, index) => (
          <button
            key={dump.id}
            type="button"
            onClick={() => setActive(index)}
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink text-left"
          >
            <DumpMedia
              dump={dump}
              alt={dump.caption || dump.eventTitle || "Event dump"}
              controls={false}
              className="transition duration-500 group-hover:scale-105"
            />
            {resolveDumpType(dump) === "video" && (
              <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-foam">
                Video
              </span>
            )}
          </button>
        ))}
      </div>

      {current && active !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Dump viewer"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 z-10 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-sm text-foam"
          >
            Close
          </button>

          {dumps.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 px-3 py-3 text-foam sm:left-6"
                aria-label="Previous"
              >
                ←
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 px-3 py-3 text-foam sm:right-6"
                aria-label="Next"
              >
                →
              </button>
            </>
          )}

          <div
            className="flex max-h-[90vh] w-full max-w-5xl flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black shadow-2xl">
              <DumpMedia
                dump={current}
                alt={current.caption || current.eventTitle || "Event dump"}
                fit="contain"
                controls
              />
            </div>
            <div className="mt-4 flex w-full flex-wrap items-center justify-between gap-3 px-1 text-foam">
              <div>
                <p className="text-sm text-foam/55">
                  {active + 1} / {dumps.length}
                </p>
                {current.caption &&
                  !current.caption.toLowerCase().includes("whatsapp") && (
                    <p className="mt-1 text-sm text-foam/80">{current.caption}</p>
                  )}
              </div>
              {linkToEvent && current.eventSlug && (
                <Link
                  href={`/events/${current.eventSlug}`}
                  className="rounded-full border border-white/25 px-4 py-2 text-sm text-foam hover:bg-white/10"
                >
                  View event
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
