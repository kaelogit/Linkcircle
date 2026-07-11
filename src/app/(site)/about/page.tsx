import type { Metadata } from "next";
import Link from "next/link";
import { SITE, WEEKLY } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
};

const PILLARS = [
  {
    title: "Connect",
    text: "Meet people around Ajah → Eleko who actually show up, online and in real life.",
  },
  {
    title: "Network",
    text: "Wednesdays are for brands, skills, collabs, and finding people in your lane.",
  },
  {
    title: "Grow",
    text: "Jobs, advice, resources, and conversations that move you forward every Thursday.",
  },
  {
    title: "Collaborate",
    text: "Support each other’s work, share opportunities, and build things together.",
  },
  {
    title: "Belong",
    text: "Sunday intros, calm check-ins, and a culture where new members don’t feel lost.",
  },
];

const SPACES = [
  {
    title: "WhatsApp Community",
    text: "The living hub. Structured days. Real conversations. Less spam, more purpose.",
    href: "/weekly",
    cta: "See the weekly rhythm",
  },
  {
    title: "LC Marketplace",
    text: "Buy, sell, and promote every day: business only, honesty first, community support.",
    href: "/marketplace",
    cta: "Explore marketplace",
  },
  {
    title: "LC Events",
    text: "Beach hangouts, house parties, meetups, and dumps, plus QR access for paid events.",
    href: "/events",
    cta: "View events",
  },
];

export default function AboutPage() {
  return (
    <div className="pt-8 sm:pt-12">
      <section className="section-pad mx-auto max-w-6xl pb-12 sm:pb-16">
        <p className="text-sm uppercase tracking-[0.22em] text-lagoon">About</p>
        <h1 className="font-display mt-4 max-w-4xl text-4xl leading-[1.05] sm:text-6xl">
          More than a community. A movement.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-ink-soft sm:text-xl">
          Link Circle is for people along the {SITE.corridor} corridor who want
          real connections, shared growth, and hangouts that feel like home.
        </p>
      </section>

      <section className="section-pad mx-auto max-w-6xl pb-16 sm:pb-20">
        <div className="overflow-hidden rounded-[2rem] atmosphere grain px-6 py-12 text-foam sm:px-10 sm:py-16">
          <p className="text-sm uppercase tracking-[0.22em] text-sand">
            Our mission
          </p>
          <p className="font-display mt-5 max-w-4xl text-2xl leading-snug sm:text-4xl">
            {SITE.mission}
          </p>
        </div>
      </section>

      <section className="section-pad mx-auto max-w-6xl pb-16 sm:pb-24">
        <p className="text-sm uppercase tracking-[0.22em] text-sunset">
          Why we exist
        </p>
        <h2 className="font-display mt-3 max-w-3xl text-3xl sm:text-5xl">
          Because the corridor deserves a circle that works.
        </h2>
        <div className="mt-8 grid gap-6 text-base leading-relaxed text-ink-soft sm:text-lg lg:grid-cols-2">
          <p>
            Too many groups turn into noise: random broadcasts, spam, and people
            you never actually meet. Link Circle was built differently. Every
            day has a purpose. Conversations have lanes. Businesses have a home.
            And hangouts turn chats into friendships.
          </p>
          <p>
            We’re growing every day because people want somewhere they can
            introduce themselves, find opportunities, promote what they do, and
            still have fun. Online structure. Offline memories. One movement.
          </p>
        </div>
      </section>

      <section className="border-y border-ink/10 bg-mist">
        <div className="section-pad mx-auto max-w-6xl py-16 sm:py-24">
          <p className="text-sm uppercase tracking-[0.22em] text-lagoon">
            Who it’s for
          </p>
          <h2 className="font-display mt-3 text-3xl sm:text-4xl">
            Students. Creators. Founders. Neighbours. Builders.
          </h2>
          <p className="mt-4 max-w-2xl text-ink-soft">
            If you’re around Ajah, Abraham Adesanya, Sangotedo, Awoyaya, Eleko
            and the stretch in between, and you want people, progress, and
            presence. This is your circle.
          </p>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "People new to the area who want real friends",
              "Entrepreneurs who need visibility & support",
              "Job seekers looking for openings & advice",
              "Creatives ready to collab and get discovered",
              "Anyone tired of empty group chats",
              "Members who show up for hangouts & vibes",
            ].map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-2xl bg-white/70 px-4 py-4 text-ink-soft"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sunset" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-pad mx-auto max-w-6xl py-16 sm:py-24">
        <p className="text-sm uppercase tracking-[0.22em] text-sunset">
          What we stand on
        </p>
        <h2 className="font-display mt-3 text-3xl sm:text-5xl">
          Five promises of the circle.
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="border-t border-ink/15 pt-5">
              <h3 className="font-display text-2xl">{pillar.title}</h3>
              <p className="mt-3 text-ink-soft">{pillar.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-ink/10 bg-ink text-foam">
        <div className="section-pad mx-auto max-w-6xl py-16 sm:py-24">
          <p className="text-sm uppercase tracking-[0.22em] text-sand">
            How Link Circle works
          </p>
          <h2 className="font-display mt-3 max-w-3xl text-3xl sm:text-5xl">
            Structured online. Alive offline.
          </h2>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {SPACES.map((space) => (
              <div key={space.title}>
                <h3 className="font-display text-2xl">{space.title}</h3>
                <p className="mt-3 text-foam/70">{space.text}</p>
                <Link
                  href={space.href}
                  className="mt-5 inline-flex text-sm font-semibold text-sand underline-offset-4 hover:underline"
                >
                  {space.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad mx-auto max-w-6xl py-16 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-lagoon">
              Weekly rhythm
            </p>
            <h2 className="font-display mt-3 text-3xl sm:text-4xl">
              Every day has a job.
            </h2>
            <p className="mt-3 max-w-xl text-ink-soft">
              That’s how we stay valuable, and stop the group from turning into
              noise.
            </p>
          </div>
          <Link
            href="/weekly"
            className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-foam"
          >
            Full weekly structure
          </Link>
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {WEEKLY.map((day) => (
            <div
              key={day.day}
              className="rounded-2xl border border-ink/10 bg-mist px-4 py-4"
            >
              <p className="text-xs uppercase tracking-[0.16em] text-ink/45">
                {day.day}
              </p>
              <p className="font-display mt-2 text-base leading-snug">
                {day.title}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-ink/10 bg-mist">
        <div className="section-pad mx-auto grid max-w-6xl gap-10 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-sunset">
              Real life
            </p>
            <h2 className="font-display mt-3 text-3xl sm:text-5xl">
              The chat is the start. The hangout is the proof.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">
              From beach days to overnight house parties, LC Events turn
              usernames into faces. Past dumps live on the site. Upcoming events
              get clear details, and paid hangouts use unique QR passes so only
              confirmed members get in.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/events"
                className="rounded-full bg-sunset px-5 py-3 text-sm font-semibold text-white"
              >
                Explore LC Events
              </Link>
              <Link
                href="/coordinators"
                className="rounded-full border border-ink/15 bg-white px-5 py-3 text-sm font-semibold"
              >
                Meet the people
              </Link>
            </div>
          </div>
          <aside className="rounded-[1.75rem] bg-ink px-6 py-8 text-foam sm:px-8">
            <p className="text-sm uppercase tracking-[0.18em] text-sand">
              Corridor
            </p>
            <p className="font-display mt-3 text-3xl sm:text-4xl">
              {SITE.corridor}
            </p>
            <ul className="mt-8 space-y-3 text-foam/75">
              <li>WhatsApp community hub</li>
              <li>LC Marketplace for daily business</li>
              <li>LC Events + photo/video dumps</li>
              <li>Founder & admin crew</li>
              <li>QR access for paid hangouts</li>
            </ul>
            <p className="mt-8 text-sm text-foam/45">
              Built for belonging, not broadcasting.
            </p>
          </aside>
        </div>
      </section>

      <section className="section-pad mx-auto max-w-6xl py-16 sm:py-24">
        <div className="overflow-hidden rounded-[2rem] atmosphere grain px-6 py-14 text-foam sm:px-12 sm:py-16">
          <h2 className="font-display max-w-3xl text-3xl sm:text-5xl">
            Ready to stop lurking and start belonging?
          </h2>
          <p className="mt-5 max-w-xl text-lg text-foam/75">
            Join Link Circle, intro yourself on Sunday, follow the rhythm, and
            show up for the next hangout.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/join"
              className="rounded-full bg-sunset px-6 py-3.5 text-sm font-semibold"
            >
              Join the Circle
            </Link>
            <a
              href={`mailto:${SITE.contactEmail}`}
              className="rounded-full border border-white/30 px-6 py-3.5 text-sm font-semibold"
            >
              Email the admins
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
