import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DumpGallery } from "@/components/DumpGallery";
import { getEventBySlug } from "@/lib/events";
import { formatEventRange, isUpcomingStatus } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  return { title: event?.title ?? "Event" };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const isUpcoming = isUpcomingStatus(event.status);

  return (
    <div className="pt-8 sm:pt-12">
      <section
        className="section-pad mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] text-foam sm:rounded-[2rem]"
        style={{ background: event.coverGradient }}
      >
        <div className="px-6 py-10 sm:px-12 sm:py-14">
          <p className="text-sm uppercase tracking-[0.2em] text-white/70">
            {isUpcoming ? "Upcoming" : "Past hangout"} ·{" "}
            {formatEventRange(event.startsAt, event.endsAt)}
          </p>
          <h1 className="font-display mt-4 max-w-3xl text-4xl sm:text-6xl">
            {event.title}
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/85 sm:text-lg">
            {event.tagline}
          </p>
        </div>
      </section>

      <section className="section-pad mx-auto grid max-w-6xl gap-10 py-10 sm:py-14 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h2 className="font-display text-2xl">
            {isUpcoming ? "About this event" : "How it went"}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">
            {event.description}
          </p>

          {isUpcoming && event.whatsIncluded.length > 0 && (
            <>
              <h3 className="font-display mt-10 text-xl">What you get</h3>
              <ul className="mt-4 space-y-3 text-ink-soft">
                {event.whatsIncluded.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sunset" />
                    {item}
                  </li>
                ))}
              </ul>
            </>
          )}

          {event.dumps.length > 0 ? (
            <>
              <h3 className="font-display mt-10 text-xl">Event dumps</h3>
              <div className="mt-5">
                <DumpGallery
                  dumps={event.dumps.map((d) => ({
                    ...d,
                    eventTitle: event.title,
                    eventSlug: event.slug,
                  }))}
                />
              </div>
            </>
          ) : (
            !isUpcoming && (
              <p className="mt-10 rounded-2xl bg-mist px-5 py-4 text-sm text-ink-soft">
                Photo &amp; video dumps for this hangout are coming soon. Check
                back after admins upload them.
              </p>
            )
          )}
        </div>

        <aside className="h-fit rounded-[1.5rem] border border-ink/10 bg-white p-6 sm:rounded-[1.75rem] sm:p-7">
          <p className="text-xs uppercase tracking-[0.18em] text-ink/45">
            Details
          </p>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-ink/45">When</dt>
              <dd className="mt-1 font-medium">
                {formatEventRange(event.startsAt, event.endsAt)}
              </dd>
            </div>
            <div>
              <dt className="text-ink/45">Where</dt>
              <dd className="mt-1 font-medium">{event.locationPublic}</dd>
            </div>
            {isUpcoming && (
              <>
                <div>
                  <dt className="text-ink/45">Access</dt>
                  <dd className="mt-1 font-medium">{event.priceLabel}</dd>
                </div>
                {event.capacity > 0 && (
                  <div>
                    <dt className="text-ink/45">Capacity</dt>
                    <dd className="mt-1 font-medium">
                      {event.capacity} participants
                    </dd>
                  </div>
                )}
              </>
            )}
            {!isUpcoming && (
              <div>
                <dt className="text-ink/45">Status</dt>
                <dd className="mt-1 font-medium">Already happened</dd>
              </div>
            )}
          </dl>

          {isUpcoming ? (
            <div className="mt-8 space-y-3">
              <p className="text-sm text-ink-soft">
                Pay via admins in the group chat → get your unique QR pass +
                link. One scan at the door. Can&apos;t be reused.
              </p>
              <Link
                href="/join"
                className="block rounded-full bg-sunset py-3 text-center text-sm font-semibold text-white"
              >
                Ask admins to book
              </Link>
            </div>
          ) : (
            <div className="mt-8 space-y-3">
              <p className="text-sm text-ink-soft">
                This hangout is done, but the next one is loading. Don&apos;t
                miss it.
              </p>
              <Link
                href="/events"
                className="block rounded-full bg-ink py-3 text-center text-sm font-semibold text-foam"
              >
                See upcoming events
              </Link>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
