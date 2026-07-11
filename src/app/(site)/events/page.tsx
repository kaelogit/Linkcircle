import type { Metadata } from "next";
import Link from "next/link";
import { getPastEvents, getUpcomingEvents, readEvents } from "@/lib/events";
import { formatEventRange } from "@/lib/site";

export const metadata: Metadata = {
  title: "Events",
};

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const [upcoming, past, all] = await Promise.all([
    getUpcomingEvents(),
    getPastEvents(),
    readEvents(),
  ]);
  const pastOnly = past.filter(
    (e) => e.status === "ended" || !upcoming.find((u) => u.id === e.id),
  );
  const dumpsCount = all.reduce((n, e) => n + e.dumps.length, 0);

  return (
    <div className="pt-8 sm:pt-12">
      <section className="section-pad mx-auto max-w-6xl pb-10 sm:pb-12">
        <p className="text-sm uppercase tracking-[0.22em] text-sunset">
          LC Events
        </p>
        <h1 className="font-display mt-4 max-w-3xl text-4xl leading-[1.05] sm:text-6xl">
          Past dumps. New drops. Real hangouts.
        </h1>
        <p className="mt-5 max-w-2xl text-base text-ink-soft sm:text-lg">
          From house parties to corridor meetups, with access passes for paid
          events.
          {dumpsCount > 0
            ? ` ${dumpsCount} dump photos & videos live now.`
            : ""}
        </p>
      </section>

      <section className="section-pad mx-auto max-w-6xl pb-12 sm:pb-16">
        <h2 className="font-display text-2xl">Upcoming</h2>
        <div className="mt-6 grid gap-5">
          {upcoming.length === 0 && (
            <p className="text-ink-soft">No upcoming events yet.</p>
          )}
          {upcoming.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.slug}`}
              className="group overflow-hidden rounded-[1.75rem] text-foam transition"
              style={{ background: event.coverGradient }}
            >
              <div className="px-6 py-8 sm:px-10 sm:py-10">
                <p className="text-sm uppercase tracking-[0.18em] text-white/70">
                  {formatEventRange(event.startsAt, event.endsAt)}
                </p>
                <h3 className="font-display mt-3 text-2xl sm:text-4xl">
                  {event.title}
                </h3>
                <p className="mt-3 max-w-xl text-white/85">{event.tagline}</p>
                <span className="mt-6 inline-flex text-sm font-semibold underline-offset-4 group-hover:underline">
                  View details & access →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-pad mx-auto max-w-6xl pb-20 sm:pb-24">
        <h2 className="font-display text-2xl">Past & dumps</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {pastOnly.length === 0 && (
            <p className="text-ink-soft">
              Past event dumps will appear here after upload.
            </p>
          )}
          {pastOnly.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.slug}`}
              className="rounded-[1.5rem] border border-ink/10 bg-mist p-6 transition hover:border-ink/25 sm:p-7"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-ink/45">
                {event.dumps.length > 0
                  ? `${event.dumps.length} dumps`
                  : "Archive"}
              </p>
              <h3 className="font-display mt-3 text-xl sm:text-2xl">
                {event.title}
              </h3>
              <p className="mt-2 text-ink-soft">{event.tagline}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
