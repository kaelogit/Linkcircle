import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { DumpGallery } from "@/components/DumpGallery";
import { getAllDumps, getUpcomingEvents } from "@/lib/events";
import { SITE, WEEKLY, formatEventRange } from "@/lib/site";

export const dynamic = "force-dynamic";

function hoursBetween(startsAt: string, endsAt: string) {
  const ms = +new Date(endsAt) - +new Date(startsAt);
  const hours = Math.max(1, Math.round(ms / (1000 * 60 * 60)));
  return hours;
}

export default async function HomePage() {
  const upcoming = await getUpcomingEvents();
  const dumps = await getAllDumps();
  const spotlight = upcoming[0];
  const todayIndex = (new Date().getDay() + 6) % 7;
  const today = WEEKLY[todayIndex];
  const spotlightHours = spotlight
    ? hoursBetween(spotlight.startsAt, spotlight.endsAt)
    : 0;
  const startLabel = spotlight
    ? new Date(spotlight.startsAt).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : "";
  const endLabel = spotlight
    ? new Date(spotlight.endsAt).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : "";

  return (
    <>
      <section className="relative min-h-[100svh] overflow-hidden atmosphere grain text-foam">
        <div
          className="pointer-events-none absolute inset-0 animate-drift opacity-70"
          style={{
            background:
              "radial-gradient(circle at 70% 40%, rgba(121,7,32,0.4), transparent 42%), radial-gradient(circle at 20% 70%, rgba(31,111,115,0.35), transparent 40%)",
          }}
        />
        <div className="section-pad relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end pb-16 pt-10 sm:pb-20">
          <p className="animate-rise text-sm uppercase tracking-[0.28em] text-sand/90">
            {SITE.corridor}
          </p>
          <h1 className="animate-rise-delay-1 font-display mt-4 max-w-4xl text-[clamp(3.2rem,10vw,7.5rem)] leading-[0.9] font-bold">
            Link Circle
            <span aria-hidden className="ml-[0.12em]">
              ⭕️
            </span>
          </h1>
          <p className="animate-rise-delay-2 mt-6 max-w-xl text-base text-foam/80 sm:text-xl">
            {SITE.tagline} Real connections, weekly rhythm, marketplace energy,
            and hangouts that turn strangers into circle.
          </p>
          <div className="animate-rise-delay-3 mt-8 flex flex-wrap gap-3 sm:mt-10">
            <Link
              href="/join"
              className="rounded-full bg-sunset px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-sunset-deep"
            >
              Join the Circle
            </Link>
            <Link
              href="/events"
              className="rounded-full border border-white/30 bg-white/5 px-6 py-3.5 text-sm font-semibold text-foam backdrop-blur transition hover:bg-white/10"
            >
              See events
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-3 text-sm text-foam/55 sm:mt-14">
            <span className="h-2 w-2 animate-pulse-soft rounded-full bg-sunset" />
            Growing every day along {SITE.corridor}
          </div>
        </div>
      </section>

      <section className="section-pad mx-auto max-w-6xl py-16 sm:py-24">
        <Reveal>
          <p className="text-sm uppercase tracking-[0.22em] text-lagoon">
            What we are
          </p>
          <h2 className="font-display mt-4 max-w-3xl text-3xl leading-tight sm:text-5xl">
            A place where everyone belongs.
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
            {SITE.mission}
          </p>
          <Link
            href="/about"
            className="mt-8 inline-flex text-sm font-semibold text-sunset underline-offset-4 hover:underline"
          >
            Read our story →
          </Link>
        </Reveal>
      </section>

      <section className="border-y border-ink/10 bg-mist">
        <div className="section-pad mx-auto max-w-6xl py-16 sm:py-24">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-lagoon">
                  Weekly rhythm
                </p>
                <h2 className="font-display mt-3 text-3xl sm:text-5xl">
                  Every day has a purpose.
                </h2>
              </div>
              <Link
                href="/weekly"
                className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-foam"
              >
                Full structure
              </Link>
            </div>
            <div className="mt-10 grid gap-3 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {WEEKLY.map((day, i) => (
                <div
                  key={day.day}
                  className={`rounded-3xl p-5 ${
                    i === todayIndex
                      ? "bg-ink text-foam"
                      : "bg-white/70 text-ink"
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.18em] opacity-60">
                    {day.day}
                  </p>
                  <p className="font-display mt-3 text-lg sm:text-xl">
                    {day.title}
                  </p>
                  <p className="mt-2 text-sm opacity-70">{day.vibe}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-ink-soft">
              Today&apos;s energy: <strong>{today.day}</strong>. {today.title}
            </p>
          </Reveal>
        </div>
      </section>

      {spotlight && (
        <section className="relative overflow-hidden border-y border-ink/10">
          <div
            className="absolute inset-0"
            style={{ background: spotlight.coverGradient }}
          />
          <div className="pointer-events-none absolute inset-0 grain" />
          <div
            className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full opacity-40 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(216,162,74,0.55), transparent 70%)",
            }}
          />
          <div
            className="pointer-events-none absolute -left-16 bottom-0 h-80 w-80 rounded-full opacity-30 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(121,7,32,0.8), transparent 70%)",
            }}
          />

          <div className="section-pad relative mx-auto max-w-6xl py-16 text-foam sm:py-24">
            <Reveal>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm uppercase tracking-[0.28em] text-sand">
                  Coming up · LC Events
                </p>
                <Link
                  href="/events"
                  className="text-sm text-foam/60 underline-offset-4 hover:text-foam hover:underline"
                >
                  See all events
                </Link>
              </div>

              <div className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
                <div>
                  <p className="font-display text-[clamp(3rem,9vw,6.5rem)] leading-[0.88]">
                    {spotlight.title}
                  </p>
                  <p className="mt-5 max-w-xl text-lg text-foam/85 sm:text-xl">
                    {spotlight.tagline}
                  </p>
                  <p className="mt-5 max-w-2xl text-base leading-relaxed text-foam/65 sm:text-lg">
                    {spotlight.description}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href={`/events/${spotlight.slug}`}
                      className="rounded-full bg-foam px-6 py-3.5 text-sm font-semibold text-ink transition hover:bg-white"
                    >
                      Get details & access
                    </Link>
                    <Link
                      href="/join"
                      className="rounded-full border border-white/30 bg-white/5 px-6 py-3.5 text-sm font-semibold backdrop-blur transition hover:bg-white/10"
                    >
                      Join Link Circle first
                    </Link>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="rounded-[1.5rem] border border-white/15 bg-black/25 px-5 py-5 backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-sand/80">
                      When
                    </p>
                    <p className="font-display mt-2 text-2xl sm:text-3xl">
                      {startLabel}
                      <span className="mx-2 text-foam/40">→</span>
                      {endLabel}
                    </p>
                    <p className="mt-2 text-sm text-foam/55">
                      {formatEventRange(spotlight.startsAt, spotlight.endsAt)}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/15 bg-black/25 px-5 py-5 backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-sand/80">
                      Duration
                    </p>
                    <p className="font-display mt-2 text-2xl sm:text-3xl">
                      {spotlightHours} hours
                    </p>
                    <p className="mt-2 text-sm text-foam/55">
                      Non-stop Link Circle energy
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/15 bg-black/25 px-5 py-5 backdrop-blur-sm sm:col-span-2 lg:col-span-1">
                    <p className="text-xs uppercase tracking-[0.2em] text-sand/80">
                      Where
                    </p>
                    <p className="font-display mt-2 text-xl sm:text-2xl">
                      {SITE.corridor}
                    </p>
                    <p className="mt-2 text-sm text-foam/55">
                      Exact spot drops after you pay via admins
                    </p>
                  </div>
                </div>
              </div>

              {spotlight.whatsIncluded.length > 0 && (
                <div className="mt-12 border-t border-white/15 pt-8">
                  <p className="text-xs uppercase tracking-[0.22em] text-sand/70">
                    What you walk into
                  </p>
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {spotlight.whatsIncluded.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-sm text-foam/80 sm:text-base"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sand" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 text-sm text-foam/45">
                    {spotlight.priceLabel}
                    {spotlight.capacity > 0
                      ? ` · Cap ${spotlight.capacity}`
                      : ""}
                  </p>
                </div>
              )}
            </Reveal>
          </div>
        </section>
      )}

      {dumps.length > 0 && (
        <section className="border-t border-ink/10 bg-mist">
          <div className="section-pad mx-auto max-w-6xl py-16 sm:py-24">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-lagoon">
                    Event dumps
                  </p>
                  <h2 className="font-display mt-3 text-3xl sm:text-5xl">
                    Moments from the circle.
                  </h2>
                </div>
                <Link
                  href="/events"
                  className="text-sm font-semibold text-sunset underline-offset-4 hover:underline"
                >
                  All events →
                </Link>
              </div>
              <div className="mt-10">
                <DumpGallery dumps={dumps.slice(0, 8)} linkToEvent />
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <section className="border-t border-ink/10 bg-mist">
        <div className="section-pad mx-auto grid max-w-6xl gap-6 py-16 sm:gap-8 sm:py-24 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-[1.75rem] bg-ink p-7 text-foam sm:rounded-[2rem] sm:p-10">
              <p className="text-sm uppercase tracking-[0.22em] text-sand">
                LC Marketplace
              </p>
              <h2 className="font-display mt-4 text-2xl sm:text-4xl">
                The business hub of the circle.
              </h2>
              <p className="mt-4 text-foam/75">
                Buy, sell, promote, and support trusted sellers inside Link
                Circle every day, with honesty and respect.
              </p>
              <Link
                href="/marketplace"
                className="mt-8 inline-flex rounded-full bg-sunset px-5 py-3 text-sm font-semibold"
              >
                Explore marketplace
              </Link>
            </div>
          </Reveal>
          <Reveal>
            <div className="h-full rounded-[1.75rem] border border-ink/10 bg-white/80 p-7 sm:rounded-[2rem] sm:p-10">
              <p className="text-sm uppercase tracking-[0.22em] text-lagoon">
                The people
              </p>
              <h2 className="font-display mt-4 text-2xl sm:text-4xl">
                Founder & admins.
              </h2>
              <p className="mt-4 text-ink-soft">
                Meet the founder and admins keeping the movement organized:
                events, marketplace, growth, and door ops.
              </p>
              <Link
                href="/coordinators"
                className="mt-8 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-foam"
              >
                Meet the team
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-pad mx-auto max-w-6xl py-16 sm:py-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-[1.75rem] atmosphere grain px-6 py-12 text-foam sm:rounded-[2rem] sm:px-10 sm:py-16 lg:px-14">
            <div
              className="pointer-events-none absolute -right-10 top-0 h-64 w-64 rounded-full opacity-40 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(216,162,74,0.45), transparent 70%)",
              }}
            />
            <p className="relative text-sm uppercase tracking-[0.28em] text-sand">
              Join the movement
            </p>
            <h2 className="relative font-display mt-4 max-w-3xl text-3xl sm:text-6xl">
              We&apos;re growing every damn day.
            </h2>
            <p className="relative mt-5 max-w-2xl text-base leading-relaxed text-foam/80 sm:text-xl">
              New faces. New businesses. New hangouts. Link Circle keeps
              expanding along {SITE.corridor} because people want more than a
              dead group chat. They want a circle that connects, supports, and
              actually shows up in real life.
            </p>

            <div className="relative mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  t: "Daily purpose",
                  d: "A clear weekly rhythm so the chat stays useful, not noisy.",
                },
                {
                  t: "Real hangouts",
                  d: "Beach days, house parties, meetups, then dumps you can relive.",
                },
                {
                  t: "Business support",
                  d: "LC Marketplace for promoting, selling, and getting customers.",
                },
                {
                  t: "People who stay",
                  d: "Intros, collabs, opportunities, and friendships that stick.",
                },
              ].map((item) => (
                <div
                  key={item.t}
                  className="rounded-2xl border border-white/15 bg-black/20 px-4 py-5 backdrop-blur-sm"
                >
                  <p className="font-display text-lg">{item.t}</p>
                  <p className="mt-2 text-sm text-foam/65">{item.d}</p>
                </div>
              ))}
            </div>

            <div className="relative mt-10 max-w-2xl border-t border-white/15 pt-8">
              <p className="text-base text-foam/75 sm:text-lg">
                If you&apos;re around the corridor and you&apos;re ready to stop
                watching from the outside. Tap in, intro yourself on Sunday, and
                become part of what we&apos;re building.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={SITE.whatsappInvite}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-full bg-sunset px-6 py-3.5 text-sm font-semibold transition hover:bg-sunset-deep"
                >
                  Join the Circle on WhatsApp
                </a>
                <Link
                  href="/about"
                  className="inline-flex rounded-full border border-white/30 bg-white/5 px-6 py-3.5 text-sm font-semibold backdrop-blur transition hover:bg-white/10"
                >
                  Learn more about us
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
