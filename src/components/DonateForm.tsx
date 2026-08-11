"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DONATE_PRESETS_NAIRA } from "@/lib/donate";

const ERROR_COPY: Record<string, string> = {
  missing_ref: "Payment reference missing. Please try again.",
  payment_failed: "Payment did not go through. You can try again.",
  verify: "We could not verify payment. If you were charged, message an admin.",
};

export function DonateForm() {
  const searchParams = useSearchParams();
  const [preset, setPreset] = useState<number | "custom">(5_000);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    () => {
      const e = searchParams.get("error");
      return e && ERROR_COPY[e] ? ERROR_COPY[e] : null;
    },
  );

  const amountNaira = useMemo(() => {
    if (preset === "custom") {
      const n = Number(custom.replace(/,/g, ""));
      return Number.isFinite(n) ? n : 0;
    }
    return preset;
  }, [preset, custom]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          amountNaira,
          note: note || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start donation");
      window.location.href = data.authorizationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[1.75rem] border border-ink/10 bg-white p-6 shadow-sm sm:p-8"
    >
      <h2 className="font-display text-2xl">Choose an amount</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Every naira helps us host better hangouts, tools, and community ops.
      </p>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {DONATE_PRESETS_NAIRA.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setPreset(n)}
            className={`rounded-2xl border px-3 py-4 text-sm font-semibold transition ${
              preset === n
                ? "border-sunset bg-sunset text-white"
                : "border-ink/10 bg-mist/50 text-ink hover:border-ink/25"
            }`}
          >
            ₦{n.toLocaleString("en-NG")}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPreset("custom")}
          className={`rounded-2xl border px-3 py-4 text-sm font-semibold transition sm:col-span-3 ${
            preset === "custom"
              ? "border-sunset bg-sunset text-white"
              : "border-ink/10 bg-mist/50 text-ink hover:border-ink/25"
          }`}
        >
          Custom amount
        </button>
      </div>

      {preset === "custom" && (
        <label className="mt-4 block text-sm text-ink/50">
          Amount (₦)
          <input
            required
            inputMode="numeric"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="mt-1 w-full rounded-xl border border-ink/15 bg-mist/40 px-4 py-3 text-ink outline-none focus:border-sunset"
            placeholder="e.g. 7500"
          />
        </label>
      )}

      <label className="mt-4 block text-sm text-ink/50">
        Your name
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-xl border border-ink/15 bg-mist/40 px-4 py-3 text-ink outline-none focus:border-sunset"
        />
      </label>

      <label className="mt-4 block text-sm text-ink/50">
        Email
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-xl border border-ink/15 bg-mist/40 px-4 py-3 text-ink outline-none focus:border-sunset"
          placeholder="For your Paystack receipt"
        />
      </label>

      <label className="mt-4 block text-sm text-ink/50">
        Note (optional)
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-xl border border-ink/15 bg-mist/40 px-4 py-3 text-ink outline-none focus:border-sunset"
          placeholder="A word for the circle…"
        />
      </label>

      <button
        type="submit"
        disabled={busy || amountNaira < 500}
        className="mt-6 w-full rounded-full bg-sunset py-4 text-sm font-semibold text-white transition hover:bg-sunset-deep disabled:opacity-60"
      >
        {busy
          ? "Redirecting to Paystack…"
          : `Donate ₦${Math.max(0, amountNaira).toLocaleString("en-NG")}`}
      </button>

      <p className="mt-3 text-center text-xs text-ink/40">
        Secure payment via Paystack. Minimum ₦500.
      </p>
    </form>
  );
}
