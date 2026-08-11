"use client";

export function PrintInvoiceButton({
  label = "Download invoice",
}: {
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full bg-ink px-8 py-3.5 text-sm font-semibold text-foam print:hidden"
    >
      {label}
    </button>
  );
}
