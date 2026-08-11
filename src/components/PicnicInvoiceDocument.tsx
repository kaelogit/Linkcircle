import { SITE } from "@/lib/site";
import {
  PICNIC_AMOUNT_NAIRA,
  PICNIC_EVENT_SLUG,
} from "@/lib/picnic";
import type { EventRegistration } from "@/lib/registrations";

export function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export function invoiceNumberFromRef(reference: string) {
  const tail = reference.replace(/^lc_picnic_/, "").slice(-8).toUpperCase();
  return `LC-PIC-${tail}`;
}

export function PicnicInvoiceDocument({
  registration,
  paidAt,
}: {
  registration: EventRegistration;
  paidAt?: string;
}) {
  const date = new Date(paidAt || registration.updatedAt || registration.createdAt);
  const amountNaira = Math.round(registration.amountKobo / 100) || PICNIC_AMOUNT_NAIRA;

  return (
    <div className="invoice-sheet mx-auto max-w-[720px] bg-white text-[#0f1417]">
      <div className="flex items-start justify-between gap-6 border-b border-black/10 pb-6">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={SITE.logo}
            alt=""
            className="h-12 w-12 rounded-full object-cover"
          />
          <div>
            <p className="font-display text-2xl">{SITE.name}</p>
            <p className="text-sm text-black/50">{SITE.corridor}</p>
          </div>
        </div>
        <div className="text-right text-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-black/45">
            Invoice
          </p>
          <p className="mt-1 font-semibold">
            {invoiceNumberFromRef(registration.paystackReference)}
          </p>
          <p className="mt-2 text-black/55">
            {date.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-black/45">
            Billed to
          </p>
          <p className="mt-2 font-medium">{registration.fullName}</p>
          <p className="mt-1 text-sm text-black/60">{registration.email}</p>
          <p className="text-sm text-black/60">{registration.phone}</p>
          {registration.residence ? (
            <p className="text-sm text-black/60">{registration.residence}</p>
          ) : null}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-black/45">
            Payment
          </p>
          <p className="mt-2 font-medium text-emerald-700">PAID</p>
          <p className="mt-1 break-all text-sm text-black/55">
            Ref: {registration.paystackReference}
          </p>
          <p className="mt-1 text-sm text-black/55">via Paystack · NGN</p>
        </div>
      </div>

      <div className="mt-10 overflow-hidden rounded-xl border border-black/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/[0.03] text-xs uppercase tracking-[0.14em] text-black/45">
            <tr>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-black/10">
              <td className="px-4 py-4">
                <p className="font-medium">Networking Picnic contribution</p>
                <p className="mt-1 text-black/55">
                  Saturday 29 August 2026 · Event seat (1 of 30)
                </p>
                <p className="mt-1 text-black/55">
                  Picnic share: {registration.bringItem}
                </p>
              </td>
              <td className="px-4 py-4 text-right font-medium">
                {formatNaira(amountNaira)}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="border-t border-black/10 bg-black/[0.02]">
              <td className="px-4 py-4 font-semibold">Total paid</td>
              <td className="px-4 py-4 text-right font-display text-xl">
                {formatNaira(amountNaira)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="mt-8 text-sm text-black/50">
        Thank you for supporting {SITE.name}. Keep this invoice for your records.
        Door check-in uses your QR pass at{" "}
        <span className="text-black/70">
          {SITE.url}/events/{PICNIC_EVENT_SLUG}
        </span>
        .
      </p>
      <p className="mt-2 text-xs text-black/35">
        {SITE.url} · {SITE.contactEmail}
      </p>
    </div>
  );
}
