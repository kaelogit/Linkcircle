import Link from "next/link";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/10 bg-ink text-foam">
      <div className="section-pad mx-auto grid max-w-6xl gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={SITE.logo}
              alt=""
              className="h-11 w-11 rounded-full object-cover ring-1 ring-white/20"
            />
            <p className="font-display text-3xl">{SITE.name}</p>
          </div>
          <p className="mt-3 max-w-sm text-foam/70">
            {SITE.tagline} Built for the {SITE.corridor} corridor. Connect,
            grow, belong.
          </p>
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-sand">
            Explore
          </p>
          <ul className="mt-4 space-y-2 text-foam/80">
            <li>
              <Link href="/weekly">Weekly structure</Link>
            </li>
            <li>
              <Link href="/marketplace">LC Marketplace</Link>
            </li>
            <li>
              <Link href="/events">Events</Link>
            </li>
            <li>
              <Link href="/coordinators">Founder & admins</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-sand">
            Connect
          </p>
          <ul className="mt-4 space-y-2 text-foam/80">
            <li>
              <a href={SITE.whatsappInvite} target="_blank" rel="noreferrer">
                Join WhatsApp community
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="section-pad border-t border-white/10 py-5 text-center text-sm text-foam/45">
        © {new Date().getFullYear()} {SITE.name}. {SITE.corridor}.
      </div>
    </footer>
  );
}
