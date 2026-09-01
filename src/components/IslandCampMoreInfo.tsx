import {
  ISLAND_CAMP_IMPORTANT_INFO,
  ISLAND_CAMP_TENT_RULES,
  ISLAND_CAMP_TENT_RULES_INTRO,
} from "@/lib/island-camp-copy";

type Props = {
  variant?: "full" | "compact";
};

export function IslandCampMoreInfo({ variant = "full" }: Props) {
  return (
    <div className="space-y-8">
      <div className="rounded-[1.5rem] border border-ink/10 bg-mist/50 p-6 sm:p-8">
        <p className="text-sm uppercase tracking-[0.22em] text-lagoon">
          Important information
        </p>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink-soft sm:text-base">
          {ISLAND_CAMP_IMPORTANT_INFO.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lagoon" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {variant === "full" && (
        <div className="rounded-[1.5rem] border border-ink/10 bg-white p-6 sm:p-8">
          <p className="text-sm uppercase tracking-[0.22em] text-lagoon">
            Tents (2 per tent)
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft sm:text-base">
            {ISLAND_CAMP_TENT_RULES_INTRO}
          </p>
          <ul className="mt-4 list-inside list-disc space-y-2 pl-1 text-sm leading-relaxed text-ink-soft sm:text-base">
            {ISLAND_CAMP_TENT_RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
