"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BRING_OPTIONS,
  PICNIC_AMOUNT_NAIRA,
  PICNIC_CAPACITY,
} from "@/lib/picnic";

type SlotStatus = {
  capacity: number;
  paid: number;
  remaining: number;
  closed: boolean;
};

const ERROR_COPY: Record<string, string> = {
  missing_ref: "Payment reference missing. Please try again.",
  payment_failed: "Payment did not go through. You can try again.",
  amount: "Payment amount did not match. Contact an admin.",
  verify: "We could not verify payment. If you were charged, message an admin.",
};

export function PicnicRegisterForm() {
  const searchParams = useSearchParams();
  const [slots, setSlots] = useState<SlotStatus | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [residence, setResidence] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [bringPreset, setBringPreset] = useState("");
  const [bringOther, setBringOther] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const urlError = searchParams.get("error");

  async function loadSlots() {
    const res = await fetch("/api/register/picnic/status", { cache: "no-store" });
    const data = await res.json();
    if (res.ok) setSlots(data);
  }

  useEffect(() => {
    void loadSlots();
    const id = setInterval(() => void loadSlots(), 15000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (urlError && ERROR_COPY[urlError]) setError(ERROR_COPY[urlError]);
  }, [urlError]);

  const closed = slots?.closed ?? false;
  const remaining = slots?.remaining ?? PICNIC_CAPACITY;
  const paid = slots?.paid ?? 0;

  const progress = useMemo(() => {
    const taken = PICNIC_CAPACITY - remaining;
    return Math.min(100, Math.round((taken / PICNIC_CAPACITY) * 100));
  }, [remaining]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (closed) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/register/picnic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          residence,
          whatsapp,
          bringPreset,
          bringOther,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start payment");
      window.location.href = data.authorizationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
      void loadSlots();
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-6">
        <div className="rounded-[1.75rem] border border-ink/10 bg-white/80 p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink/45">
                Slots remaining
              </p>
              <p className="font-display mt-2 text-5xl tabular-nums text-ink">
                {slots ? remaining : "—"}
                <span className="ml-2 text-2xl text-ink/40">
                  / {PICNIC_CAPACITY}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/45">
                Registration fee
              </p>
              <p className="font-display mt-2 text-3xl text-sunset">
                ₦{PICNIC_AMOUNT_NAIRA.toLocaleString("en-NG")}
              </p>
            </div>
          </div>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-mist">
            <div
              className="h-full rounded-full bg-sunset transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-ink-soft">
            {closed
              ? "Registration closed — all 30 paid seats are taken."
              : `${paid} confirmed · first come, first served.`}
          </p>
        </div>

        <div className="rounded-[1.75rem] atmosphere grain p-6 text-foam sm:p-8">
          <p className="text-sm uppercase tracking-[0.22em] text-sand">
            Picnic challenge · Mandatory
          </p>
          <h2 className="font-display mt-3 text-2xl sm:text-3xl">
            Everyone brings something to share.
          </h2>
          <p className="mt-4 text-foam/75">
            It doesn&apos;t have to be expensive — bring whatever you genuinely
            can. Food, drinks, snacks. What you bring becomes something the
            whole circle enjoys together.
          </p>
          <p className="mt-4 text-sm text-foam/55">
            Plus: EQ session with Mrs. Adetoun Irukera, Q&amp;A, games, and
            networking under the open sky.
          </p>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-ink/10 bg-white p-6 shadow-sm sm:p-8">
        {closed ? (
          <div className="py-10 text-center">
            <p className="font-display text-3xl">Sold out</p>
            <p className="mt-3 text-ink-soft">
              All 30 picnic slots are filled. Join the WhatsApp community for
              the next drop.
            </p>
            <Link
              href="/join"
              className="mt-8 inline-flex rounded-full bg-ink px-6 py-3 text-sm font-semibold text-foam"
            >
              Join Link Circle
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <h2 className="font-display text-2xl">Reserve your seat</h2>
              <p className="mt-1 text-sm text-ink-soft">
                Pay securely with Paystack. You&apos;ll get a QR pass after
                payment.
              </p>
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <label className="block text-sm text-ink/50">
              Full name
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-ink/15 bg-mist/40 px-4 py-3 text-ink outline-none focus:border-sunset"
              />
            </label>

            <label className="block text-sm text-ink/50">
              Email
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-ink/15 bg-mist/40 px-4 py-3 text-ink outline-none focus:border-sunset"
                placeholder="For Paystack receipt"
              />
            </label>

            <label className="block text-sm text-ink/50">
              Phone number
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-ink/15 bg-mist/40 px-4 py-3 text-ink outline-none focus:border-sunset"
                placeholder="080…"
              />
            </label>

            <label className="block text-sm text-ink/50">
              Where you reside
              <input
                required
                value={residence}
                onChange={(e) => setResidence(e.target.value)}
                className="mt-1 w-full rounded-xl border border-ink/15 bg-mist/40 px-4 py-3 text-ink outline-none focus:border-sunset"
                placeholder="e.g. Ajah, Sangotedo, Eleko…"
              />
            </label>

            <label className="block text-sm text-ink/50">
              WhatsApp username
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="mt-1 w-full rounded-xl border border-ink/15 bg-mist/40 px-4 py-3 text-ink outline-none focus:border-sunset"
                placeholder="Optional · @name"
              />
            </label>

            <label className="block text-sm text-ink/50">
              What will you bring to share?{" "}
              <span className="font-semibold text-sunset">Mandatory</span>
              <select
                required
                value={bringPreset}
                onChange={(e) => setBringPreset(e.target.value)}
                className="mt-1 w-full rounded-xl border border-ink/15 bg-mist/40 px-4 py-3 text-ink outline-none focus:border-sunset"
              >
                <option value="">Select an item…</option>
                {BRING_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
            <p className="-mt-2 text-xs text-ink/45">
              Everyone must bring something to share. It does not have to be
              expensive — just come with something.
            </p>

            {bringPreset === "Other" && (
              <label className="block text-sm text-ink/50">
                Tell us what you&apos;ll bring
                <input
                  required
                  value={bringOther}
                  onChange={(e) => setBringOther(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-ink/15 bg-mist/40 px-4 py-3 text-ink outline-none focus:border-sunset"
                  placeholder="What you'll bring to share"
                />
              </label>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-2 w-full rounded-full bg-sunset py-4 text-sm font-semibold text-white transition hover:bg-sunset-deep disabled:opacity-60"
            >
              {busy
                ? "Redirecting to Paystack…"
                : `Pay ₦${PICNIC_AMOUNT_NAIRA.toLocaleString("en-NG")} & reserve seat`}
            </button>

            <p className="text-center text-xs text-ink/40">
              By paying you agree that bringing something to share is mandatory,
              and you will show your QR pass at check-in.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
