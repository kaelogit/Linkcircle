import type { Metadata } from "next";
import { WEEKLY } from "@/lib/site";

export const metadata: Metadata = {
  title: "Weekly Structure",
};

export default function WeeklyPage() {
  const todayIndex = (new Date().getDay() + 6) % 7;

  return (
    <div className="pt-8 sm:pt-12">
      <section className="section-pad mx-auto max-w-6xl pb-12">
        <p className="text-sm uppercase tracking-[0.22em] text-lagoon">
          Weekly structure
        </p>
        <h1 className="font-display mt-4 max-w-3xl text-5xl leading-[1.05] sm:text-6xl">
          Organized. Active. Valuable. Enjoyable.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-ink-soft">
          This rhythm prevents spam and noise, and gives every day in the group
          a clear purpose.
        </p>
      </section>

      <section className="section-pad mx-auto max-w-6xl pb-24">
        <div className="space-y-4">
          {WEEKLY.map((day, index) => {
            const isToday = index === todayIndex;
            return (
              <article
                key={day.day}
                className={`rounded-[1.75rem] border p-6 sm:p-8 ${
                  isToday
                    ? "border-sunset/40 bg-ink text-foam"
                    : "border-ink/10 bg-white/70"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p
                      className={`text-xs uppercase tracking-[0.2em] ${
                        isToday ? "text-sand" : "text-ink/45"
                      }`}
                    >
                      {day.day}
                      {isToday ? " · Today" : ""}
                    </p>
                    <h2 className="font-display mt-2 text-2xl sm:text-3xl">
                      {day.title}
                    </h2>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      isToday
                        ? "bg-white/10 text-sand"
                        : "bg-mist text-ink-soft"
                    }`}
                  >
                    {day.vibe}
                  </span>
                </div>
                <ul
                  className={`mt-5 grid gap-2 sm:grid-cols-2 ${
                    isToday ? "text-foam/80" : "text-ink-soft"
                  }`}
                >
                  {day.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sunset" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
