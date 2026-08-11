import type { Metadata } from "next";
import Link from "next/link";
import { getRegistrationByReference } from "@/lib/registrations";
import { getParticipantsByEvent } from "@/lib/participants";

export const metadata: Metadata = {
  title: "Registration confirmed",
};

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ ref?: string; pass?: string }> };

export default async function PicnicSuccessPage({ searchParams }: Props) {
  const { ref, pass } = await searchParams;
  let passToken = pass;
  let name = "";
  let bringItem = "";

  if (ref) {
    const reg = await getRegistrationByReference(ref);
    if (reg) {
      name = reg.fullName;
      bringItem = reg.bringItem;
      if (!passToken && reg.participantId) {
        const parts = await getParticipantsByEvent(reg.eventId);
        passToken = parts.find((p) => p.id === reg.participantId)?.passToken;
      }
    }
  }

  return (
    <div className="pt-8 sm:pt-12">
      <section className="section-pad mx-auto max-w-2xl pb-24 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15">
          <svg
            viewBox="0 0 24 24"
            className="h-10 w-10 text-emerald-600"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <p className="mt-8 text-sm uppercase tracking-[0.22em] text-lagoon">
          You&apos;re in
        </p>
        <h1 className="font-display mt-4 text-4xl sm:text-5xl">
          {name ? `See you, ${name.split(" ")[0]}!` : "Registration confirmed"}
        </h1>
        <p className="mt-4 text-lg text-ink-soft">
          Your ₦5,000 contribution is confirmed for the Networking Picnic.
          {bringItem ? ` You're bringing: ${bringItem}.` : ""}
        </p>
        <p className="mt-3 text-ink-soft">
          Save your QR pass for door check-in. Venue details drop via admins
          after registration.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {passToken ? (
            <Link
              href={`/pass/${passToken}`}
              className="rounded-full bg-sunset px-8 py-3.5 text-sm font-semibold text-white"
            >
              Open your QR pass
            </Link>
          ) : null}
          <Link
            href="/events/networking-picnic-aug-29"
            className="rounded-full border border-ink/15 px-8 py-3.5 text-sm font-semibold"
          >
            Back to event
          </Link>
        </div>
      </section>
    </div>
  );
}
