import Link from "next/link";
import type { EventItem } from "@/lib/site";
import { formatEventRange } from "@/lib/site";
import {
  ISLAND_CAMP_EVENT_SLUG,
  ISLAND_CAMP_AMOUNT_NAIRA,
  ISLAND_CAMP_AMOUNT_KOBO,
} from "@/lib/island-camp";
import { getIslandCampSlotStatus } from "@/lib/island-camp-registrations";
import {
  ISLAND_CAMP_ABOUT,
  ISLAND_CAMP_CLOSING,
  ISLAND_CAMP_HERO,
  ISLAND_CAMP_LOGISTICS,
  ISLAND_CAMP_PAYMENT,
  ISLAND_CAMP_SCHEDULE,
  ISLAND_CAMP_TENT_INTRO,
  ISLAND_CAMP_TENT_RULES,
  ISLAND_CAMP_WALK_INTO,
} from "@/lib/island-camp-copy";
import { paystackFeeFromNet, paystackGrossFromNet } from "@/lib/paystack";

type Props = {
  event: EventItem;
  isUpcoming: boolean;
};

export async function IslandCampLanding({ event, isUpcoming }: Props) {
  const slots = isUpcoming ? await getIslandCampSlotStatus() : null;
  const feeNaira = Math.ceil(paystackFeeFromNet(ISLAND_CAMP_AMOUNT_KOBO) / 100);
  const totalNaira = Math.ceil(
    paystackGrossFromNet(ISLAND_CAMP_AMOUNT_KOBO) / 100,
  );

  return (
    <div className="pb-24">
      {/* Hero */}
      <section
        className="relative overflow-hidden text-foam"
        style={{ background: event.coverGradient }}
      >
        <div className="pointer-events-none absolute inset-0 grain opacity-50" />
        <div
          className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(212,162,74,0.5), transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute -left-20 bottom-0 h-80 w-80 rounded-full opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(13,77,74,0.9), transparent 70%)",
          }}
        />
        <div className="section-pad relative mx-auto max-w-6xl py-16 sm:py-24">
          <p className="text-sm uppercase tracking-[0.32em] text-sand/90">
            {ISLAND_CAMP_HERO.eyebrow}
          </p>
          <h1 className="font-display mt-6 max-w-4xl text-[clamp(2.5rem,8vw,5.5rem)] leading-[0.95]">
            {ISLAND_CAMP_HERO.headline}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-foam/80 sm:text-xl">
            {ISLAND_CAMP_HERO.subline}
          </p>
          <p className="mt-4 text-sm uppercase tracking-[0.2em] text-foam/50">
            {formatEventRange(event.startsAt, event.endsAt)} ·{" "}
            {event.locationPublic}
          </p>
          {isUpcoming && slots && !slots.closed && (
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href={`/events/${ISLAND_CAMP_EVENT_SLUG}/register`}
                className="rounded-full bg-foam px-8 py-4 text-sm font-semibold text-ink transition hover:bg-white"
              >
                Register · ₦{ISLAND_CAMP_AMOUNT_NAIRA.toLocaleString("en-NG")}
              </Link>
              <div className="flex items-center gap-6 rounded-full border border-white/20 bg-black/20 px-6 py-3 text-sm backdrop-blur-sm">
                <span>
                  <strong className="text-foam">{slots.male.remaining}</strong>
                  <span className="text-foam/50"> male left</span>
                </span>
                <span className="h-4 w-px bg-white/20" />
                <span>
                  <strong className="text-foam">{slots.female.remaining}</strong>
                  <span className="text-foam/50"> female left</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="section-pad mx-auto max-w-6xl pt-16 sm:pt-24">
        <div className="grid gap-14 lg:grid-cols-[1fr_320px] lg:gap-16">
          <div className="min-w-0 space-y-14">
            {/* About */}
            <section className="pt-2">
              <p className="text-sm uppercase tracking-[0.22em] text-lagoon">
                About the event
              </p>
              <div className="mt-5 space-y-4 text-base leading-relaxed text-ink-soft sm:text-lg">
                {ISLAND_CAMP_ABOUT.map((p) => (
                  <p key={p.slice(0, 40)}>{p}</p>
                ))}
              </div>
            </section>

            {/* Price card */}
            <section className="rounded-[1.75rem] border border-ink/10 bg-gradient-to-br from-mist/80 to-white p-8 sm:p-10">
              <p className="font-display text-4xl text-ink sm:text-5xl">
                ₦{ISLAND_CAMP_AMOUNT_NAIRA.toLocaleString("en-NG")}
                <span className="ml-2 text-lg font-normal text-ink/45">
                  per slot
                </span>
              </p>
              <p className="mt-2 text-sm text-ink/50">
                + ~₦{feeNaira.toLocaleString("en-NG")} Paystack fee at checkout
                (₦{totalNaira.toLocaleString("en-NG")} total)
              </p>
              <p className="mt-6 text-sm font-medium text-ink">
                30 slots · 15 male / 15 female · Link Circle community only
              </p>
            </section>

            {/* What you walk into */}
            <section>
              <p className="text-sm uppercase tracking-[0.22em] text-lagoon">
                What you walk into
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {ISLAND_CAMP_WALK_INTO.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-ink/10 bg-white p-5"
                  >
                    <span className="text-2xl" aria-hidden>
                      {item.icon}
                    </span>
                    <p className="mt-3 font-medium text-ink">{item.label}</p>
                    <p className="mt-1 text-sm text-ink-soft">{item.detail}</p>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm text-ink/50">
                Food and transport are not included in your slot. Plenty to buy
                on the island if you do not bring your own.
              </p>
            </section>

            {/* Schedule & logistics */}
            <section className="rounded-[1.75rem] border border-ink/10 bg-mist/40 p-8 sm:p-10">
              <p className="text-sm uppercase tracking-[0.22em] text-lagoon">
                Important information
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {ISLAND_CAMP_SCHEDULE.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl bg-white px-4 py-4 text-center sm:text-left"
                  >
                    <p className="font-display text-2xl text-lagoon">
                      {item.time}
                    </p>
                    <p className="mt-1 text-sm text-ink-soft">{item.label}</p>
                  </div>
                ))}
              </div>
              <ul className="mt-6 space-y-3 text-sm leading-relaxed text-ink-soft sm:text-base">
                {ISLAND_CAMP_LOGISTICS.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lagoon" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* Payment */}
            <section>
              <p className="text-sm uppercase tracking-[0.22em] text-lagoon">
                Payment &amp; registration
              </p>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-ink-soft sm:text-base">
                {ISLAND_CAMP_PAYMENT.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sunset" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* Tents */}
            <section className="rounded-[1.75rem] border border-ink/10 bg-white p-8 sm:p-10">
              <p className="text-sm uppercase tracking-[0.22em] text-lagoon">
                Tent arrangements
              </p>
              <p className="mt-4 text-base leading-relaxed text-ink-soft">
                {ISLAND_CAMP_TENT_INTRO}
              </p>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-ink-soft sm:text-base">
                {ISLAND_CAMP_TENT_RULES.map((rule) => (
                  <li key={rule} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lagoon" />
                    {rule}
                  </li>
                ))}
              </ul>
            </section>

            {/* Closing CTA */}
            {isUpcoming && (
              <section
                className="rounded-[1.75rem] p-10 text-center text-foam sm:p-14"
                style={{ background: event.coverGradient }}
              >
                <p className="text-sm uppercase tracking-[0.28em] text-sand/80">
                  Ready to leave the mainland?
                </p>
                <div className="font-display mt-8 space-y-1 text-2xl sm:text-3xl">
                  {ISLAND_CAMP_CLOSING.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
                <p className="mt-8 text-sm text-foam/60">
                  {ISLAND_CAMP_CLOSING.footnote}
                </p>
                {slots && !slots.closed && (
                  <Link
                    href={`/events/${ISLAND_CAMP_EVENT_SLUG}/register`}
                    className="mt-8 inline-flex rounded-full bg-foam px-10 py-4 text-sm font-semibold text-ink transition hover:bg-white"
                  >
                    Register now
                  </Link>
                )}
              </section>
            )}
          </div>

          {/* Sticky sidebar */}
          {isUpcoming && (
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-[1.5rem] border border-ink/10 bg-white p-6 shadow-sm sm:p-7">
                <p className="text-xs uppercase tracking-[0.18em] text-ink/45">
                  Book your slot
                </p>
                <p className="font-display mt-3 text-3xl text-ink">
                  ₦{ISLAND_CAMP_AMOUNT_NAIRA.toLocaleString("en-NG")}
                </p>
                <p className="mt-1 text-xs text-ink/45">
                  + Paystack fee · no refunds
                </p>
                {slots && (
                  <dl className="mt-5 space-y-2 border-t border-ink/10 pt-5 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-ink/45">Male left</dt>
                      <dd className="font-medium">{slots.male.remaining}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-ink/45">Female left</dt>
                      <dd className="font-medium">{slots.female.remaining}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-ink/45">Confirmed</dt>
                      <dd className="font-medium">
                        {slots.paid} / {slots.capacity}
                      </dd>
                    </div>
                  </dl>
                )}
                {slots && !slots.closed ? (
                  <Link
                    href={`/events/${ISLAND_CAMP_EVENT_SLUG}/register`}
                    className="mt-6 block rounded-full bg-lagoon py-3.5 text-center text-sm font-semibold text-white"
                  >
                    Register &amp; pay
                  </Link>
                ) : (
                  <p className="mt-6 text-center text-sm text-ink-soft">
                    Registration closed
                  </p>
                )}
                <p className="mt-4 text-center text-xs text-ink/40">
                  Closes 24 September
                </p>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
