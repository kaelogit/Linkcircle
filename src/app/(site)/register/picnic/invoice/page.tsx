import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PicnicInvoiceDocument } from "@/components/PicnicInvoiceDocument";
import { PrintInvoiceButton } from "@/components/PrintInvoiceButton";
import { getRegistrationByReference } from "@/lib/registrations";

export const metadata: Metadata = {
  title: "Picnic invoice",
};

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ ref?: string }> };

export default async function PicnicInvoicePage({ searchParams }: Props) {
  const { ref } = await searchParams;
  if (!ref) notFound();

  const registration = await getRegistrationByReference(ref);
  if (!registration || registration.status !== "paid") notFound();

  return (
    <div className="min-h-screen bg-mist py-10 print:bg-white print:py-0">
      <div className="section-pad mx-auto max-w-[760px] print:max-w-none print:px-0">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href={`/register/picnic/success?ref=${encodeURIComponent(ref)}`}
            className="text-sm text-ink/50 hover:text-ink"
          >
            ← Back to confirmation
          </Link>
          <PrintInvoiceButton label="Download / print invoice" />
        </div>

        <div className="rounded-[1.25rem] border border-ink/10 bg-white p-6 shadow-sm sm:p-10 print:rounded-none print:border-0 print:p-0 print:shadow-none">
          <PicnicInvoiceDocument registration={registration} />
        </div>

        <p className="mt-4 text-center text-xs text-ink/40 print:hidden">
          Use your browser&apos;s print dialog → &quot;Save as PDF&quot; to
          download.
        </p>
      </div>
    </div>
  );
}
