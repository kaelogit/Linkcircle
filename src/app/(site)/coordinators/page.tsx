import type { Metadata } from "next";
import { COORDINATORS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Founder & Admins",
};

export default function CoordinatorsPage() {
  const founder = COORDINATORS.find((c) => c.isFounder);
  const admins = COORDINATORS.filter((c) => !c.isFounder);

  return (
    <div className="pt-8 sm:pt-12">
      <section className="section-pad mx-auto max-w-6xl pb-12">
        <p className="text-sm uppercase tracking-[0.22em] text-lagoon">
          People
        </p>
        <h1 className="font-display mt-4 max-w-3xl text-4xl leading-[1.05] sm:text-6xl">
          The faces behind the movement.
        </h1>
        <p className="mt-5 max-w-2xl text-base text-ink-soft sm:text-lg">
          One founder. Four admins. The crew keeping Link Circle organized,
          active, and human.
        </p>
      </section>

      {founder && (
        <section className="section-pad mx-auto max-w-6xl pb-16">
          <div className="relative overflow-hidden rounded-[2rem] atmosphere grain px-6 py-12 text-foam sm:px-10 sm:py-16">
            <p className="text-sm uppercase tracking-[0.28em] text-sand">
              Founder
            </p>
            <div className="mt-10 grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="relative mx-auto w-full max-w-sm">
                <div className="aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/5">
                  {founder.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={founder.photo}
                      alt={founder.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className="grid h-full place-items-center font-display text-6xl"
                      style={{
                        background: `linear-gradient(145deg, ${founder.accent}, #0e1518)`,
                      }}
                    >
                      {founder.initials}
                    </div>
                  )}
                </div>
                {!founder.photo && (
                  <p className="mt-3 text-center text-xs text-foam/40">
                    Awaiting founder photo
                  </p>
                )}
              </div>
              <div>
                <h2 className="font-display text-4xl sm:text-5xl">
                  {founder.name}
                </h2>
                <p className="mt-2 text-sm uppercase tracking-[0.18em] text-sand">
                  {founder.role}
                </p>
                <p className="mt-6 max-w-xl text-lg text-foam/80">
                  {founder.bio}
                </p>
                {founder.quote ? (
                  <blockquote className="mt-8 border-l-2 border-sand/50 pl-5 text-foam/70 italic">
                    “{founder.quote}”
                  </blockquote>
                ) : (
                  <p className="mt-8 text-sm text-foam/40">
                    Founder quote coming soon.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="section-pad mx-auto max-w-6xl pb-24">
        <h2 className="font-display text-3xl">LC Admins</h2>
        <p className="mt-3 max-w-xl text-ink-soft">
          The crew keeping members welcomed, conversations alive, and hangouts
          moving.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {admins.map((person) => (
            <article
              key={person.id}
              className="rounded-[1.5rem] border border-ink/10 bg-white/80 p-5"
            >
              <div className="aspect-square overflow-hidden rounded-2xl bg-mist">
                {person.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={person.photo}
                    alt={person.name}
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div
                    className="grid h-full place-items-center font-display text-2xl text-white"
                    style={{ background: person.accent }}
                  >
                    {person.initials}
                  </div>
                )}
              </div>
              <h3 className="font-display mt-5 text-xl">{person.name}</h3>
              {person.alias && (
                <p className="mt-1 text-xs text-ink/40">@{person.alias}</p>
              )}
              <p className="mt-1 text-sm text-lagoon">{person.role}</p>
              <p className="mt-3 text-sm text-ink-soft">{person.bio}</p>
              {person.quote && (
                <p className="mt-3 text-sm italic text-ink/55">
                  “{person.quote}”
                </p>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
