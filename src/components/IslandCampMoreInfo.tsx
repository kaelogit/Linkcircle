import {
  ISLAND_CAMP_TENT_INTRO,
  ISLAND_CAMP_TENT_RULES,
  ISLAND_CAMP_SCHEDULE,
  ISLAND_CAMP_LOGISTICS,
  ISLAND_CAMP_PAYMENT,
} from "@/lib/island-camp-copy";

type Props = {
  showTents?: boolean;
};

/** Compact blocks for the register page sidebar */
export function IslandCampMoreInfo({ showTents = true }: Props) {
  return (
    <div className="space-y-6">
      <div className="rounded-[1.5rem] border border-ink/10 bg-mist/50 p-6 sm:p-8">
        <p className="text-sm uppercase tracking-[0.22em] text-lagoon">
          Schedule
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {ISLAND_CAMP_SCHEDULE.map((item) => (
            <div key={item.label} className="rounded-xl bg-white px-3 py-3">
              <p className="font-display text-lg text-lagoon">{item.time}</p>
              <p className="text-xs text-ink-soft">{item.label}</p>
            </div>
          ))}
        </div>
        <ul className="mt-4 space-y-2 text-sm text-ink-soft">
          {[...ISLAND_CAMP_LOGISTICS, ...ISLAND_CAMP_PAYMENT.slice(0, 2)].map(
            (item) => (
              <li key={item} className="flex gap-2">
                <span className="text-lagoon">·</span>
                {item}
              </li>
            ),
          )}
        </ul>
      </div>

      {showTents && (
        <div className="rounded-[1.5rem] border border-ink/10 bg-white p-6 sm:p-8">
          <p className="text-sm uppercase tracking-[0.22em] text-lagoon">
            Tent arrangements
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            {ISLAND_CAMP_TENT_INTRO}
          </p>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            {ISLAND_CAMP_TENT_RULES.map((rule) => (
              <li key={rule} className="flex gap-2">
                <span className="text-lagoon">·</span>
                {rule}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
