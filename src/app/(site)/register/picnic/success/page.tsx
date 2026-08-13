import type { Metadata } from "next";
import Link from "next/link";
import { getRegistrationByReference } from "@/lib/registrations";
import { getParticipantsByEvent } from "@/lib/participants";
import { formatNaira } from "@/components/PicnicInvoiceDocument";
import { PICNIC_AMOUNT_NAIRA } from "@/lib/picnic";

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
  let email = "";
  let amountNaira = PICNIC_AMOUNT_NAIRA;
  let paid = false;

  if (ref) {
    const reg = await getRegistrationByReference(ref);
    if (reg) {
      name = reg.fullName;
      bringItem = reg.bringItem;
      email = reg.email;
      amountNaira = Math.round(reg.amountKobo / 100) || PICNIC_AMOUNT_NAIRA;
      paid = reg.status === "paid";
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
          Your {formatNaira(amountNaira)} registration fee is confirmed for the
          Networking Picnic.
          {bringItem ? ` You're bringing: ${bringItem}.` : ""}
        </p>
        <p className="mt-3 text-ink-soft">
          Save your QR pass for door check-in. Download your invoice for your
          records. Venue details drop via admins after registration.
        </p>

        {(email || ref) && (
          <div className="mx-auto mt-8 max-w-md rounded-2xl border border-ink/10 bg-white px-5 py-4 text-left text-sm">
            <p className="text-xs uppercase tracking-[0.16em] text-ink/40">
              Receipt summary
            </p>
            <dl className="mt-3 space-y-2 text-ink-soft">
              {name ? (
                <div className="flex justify-between gap-4">
                  <dt>Name</dt>
                  <dd className="font-medium text-ink">{name}</dd>
                </div>
              ) : null}
              {email ? (
                <div className="flex justify-between gap-4">
                  <dt>Email</dt>
                  <dd className="font-medium text-ink">{email}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-4">
                <dt>Amount</dt>
                <dd className="font-medium text-ink">
                  {formatNaira(amountNaira)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Status</dt>
                <dd className="font-medium text-emerald-700">
                  {paid ? "Paid" : "Processing"}
                </dd>
              </div>
            </dl>
          </div>
        )}

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {passToken ? (
            <Link
              href={`/pass/${passToken}`}
              className="rounded-full bg-sunset px-8 py-3.5 text-sm font-semibold text-white"
            >
              Open your QR pass
            </Link>
          ) : null}
          {ref && paid ? (
            <Link
              href={`/register/picnic/invoice?ref=${encodeURIComponent(ref)}`}
              className="rounded-full bg-ink px-8 py-3.5 text-sm font-semibold text-foam"
            >
              Download invoice
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
