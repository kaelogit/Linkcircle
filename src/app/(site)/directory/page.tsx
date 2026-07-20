import type { Metadata } from "next";
import { readMembers } from "@/lib/members";

export const metadata: Metadata = {
  title: "Directory",
};

export const dynamic = "force-dynamic";

export default async function DirectoryPage() {
  const members = await readMembers();

  return (
    <div className="pt-8 sm:pt-12">
      <section className="section-pad mx-auto max-w-6xl pb-10 sm:pb-12">
        <p className="text-sm uppercase tracking-[0.22em] text-lagoon">
          Directory
        </p>
        <h1 className="font-display mt-4 max-w-3xl text-4xl leading-[1.05] sm:text-6xl">
          Faces of the circle.
        </h1>
        <p className="mt-5 max-w-2xl text-base text-ink-soft sm:text-lg">
          Everyone who belongs to Link Circle. {members.length} member
          {members.length === 1 ? "" : "s"} and counting.
        </p>
      </section>

      <section className="section-pad mx-auto max-w-6xl pb-20 sm:pb-24">
        {members.length === 0 ? (
          <p className="text-ink-soft">
            The directory is just getting started. Check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {members.map((m) => (
              <article key={m.id} className="group">
                <div className="aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-mist sm:rounded-[1.5rem]">
                  {m.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.photoUrl}
                      alt={m.fullName}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="grid h-full place-items-center bg-gradient-to-br from-[#1a2c30] to-[#790720] font-display text-3xl text-foam/80 sm:text-4xl">
                      {m.fullName
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((p) => p[0]?.toUpperCase() ?? "")
                        .join("")}
                    </div>
                  )}
                </div>
                <h2 className="font-display mt-3 text-base leading-snug sm:text-lg">
                  {m.fullName}
                </h2>
                {m.bio ? (
                  <p className="mt-1 line-clamp-3 text-sm text-ink-soft">
                    {m.bio}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
