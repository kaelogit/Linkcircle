"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ISLAND_CAMP_EVENT_SLUG,
  ISLAND_CAMP_REGISTRATION_CLOSES_AT,
} from "@/lib/island-camp";

const ERROR_COPY: Record<string, string> = {
  payment_failed: "Payment did not go through. You can try again.",
  amount: "Payment amount did not match. Contact an admin.",
  verify: "We could not verify payment. If you were charged, message an admin.",
};

export function IslandCampBalanceForm() {
  const searchParams = useSearchParams();
  const refFromUrl = searchParams.get("ref")?.trim() ?? "";
  const urlError = searchParams.get("error");

  const [fullName, setFullName] = useState<string | null>(null);
  const [balanceDue, setBalanceDue] = useState<number | null>(null);
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(refFromUrl));

  const deadline = new Date(ISLAND_CAMP_REGISTRATION_CLOSES_AT).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "long", year: "numeric" },
  );

  useEffect(() => {
    if (urlError && ERROR_COPY[urlError]) {
      setError(ERROR_COPY[urlError]);
    }
  }, [urlError]);

  useEffect(() => {
    if (!refFromUrl) {
      setLoading(false);
      return;
    }
    void (async () => {
      try {
        const res = await fetch(
          `/api/register/island-camp/balance?ref=${encodeURIComponent(refFromUrl)}`,
          { cache: "no-store" },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not load balance");
        setFullName(data.fullName);
        setBalanceDue(data.balanceDueNaira);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load balance");
      } finally {
        setLoading(false);
      }
    })();
  }, [refFromUrl]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/register/island-camp/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ref: refFromUrl || undefined,
          phone: phone || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start payment");
      window.location.href = data.authorizationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-[1.5rem] border border-ink/10 bg-white p-5 shadow-sm sm:rounded-[1.75rem] sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-lagoon">
          LC Island Camp
        </p>
        <h1 className="font-display mt-3 text-3xl">Pay your balance</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          Complete the remaining 50% before {deadline} to keep your slot. The
          deposit is non-refundable.
        </p>

        {loading ? (
          <p className="mt-8 text-sm text-ink/50">Loading your balance…</p>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            {fullName && balanceDue != null && (
              <div className="rounded-xl border border-lagoon/20 bg-lagoon/5 px-4 py-4 text-sm">
                <p className="font-medium text-ink">{fullName}</p>
                <p className="mt-1 text-ink-soft">
                  Balance due:{" "}
                  <span className="font-semibold text-lagoon">
                    ₦{balanceDue.toLocaleString("en-NG")}
                  </span>{" "}
                  (includes Paystack fee)
                </p>
              </div>
            )}

            {!refFromUrl && (
              <label className="block text-sm text-ink/50">
                Phone number used at registration
                <input
                  required
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-ink/15 bg-mist/40 px-4 py-3 text-base text-ink outline-none focus:border-lagoon"
                  placeholder="080…"
                />
              </label>
            )}

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy || (loading && Boolean(refFromUrl))}
              className="w-full rounded-full bg-lagoon py-4 text-sm font-semibold text-white transition hover:bg-lagoon/90 disabled:opacity-60"
            >
              {busy
                ? "Redirecting to Paystack…"
                : balanceDue
                  ? `Pay ₦${balanceDue.toLocaleString("en-NG")} balance`
                  : "Continue to Paystack"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-ink-soft">
          <Link
            href={`/events/${ISLAND_CAMP_EVENT_SLUG}`}
            className="font-semibold text-lagoon underline-offset-4 hover:underline"
          >
            Back to event page
          </Link>
        </p>
      </div>
    </div>
  );
}
