"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ISLAND_CAMP_AMOUNT_NAIRA,
  ISLAND_CAMP_CAPACITY,
  ISLAND_CAMP_CAPACITY_PER_GENDER,
} from "@/lib/island-camp";

type SlotStatus = {
  capacity: number;
  capacityPerGender: number;
  paid: number;
  male: { paid: number; remaining: number; full: boolean };
  female: { paid: number; remaining: number; full: boolean };
  closed: boolean;
  registrationOpen: boolean;
  registrationClosesAt: string;
  baseAmountNaira: number;
  paystackFeeNaira: number;
  totalAmountNaira: number;
};

const ERROR_COPY: Record<string, string> = {
  missing_ref: "Payment reference missing. Please try again.",
  payment_failed: "Payment did not go through. You can try again.",
  amount: "Payment amount did not match. Contact an admin.",
  verify: "We could not verify payment. If you were charged, message an admin.",
};

export function IslandCampRegisterForm() {
  const searchParams = useSearchParams();
  const [slots, setSlots] = useState<SlotStatus | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [communityIdentity, setCommunityIdentity] = useState("");
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const urlError = searchParams.get("error");

  async function loadSlots() {
    const res = await fetch("/api/register/island-camp/status", {
      cache: "no-store",
    });
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
  const genderFull =
    gender === "male"
      ? slots?.male.full
      : gender === "female"
        ? slots?.female.full
        : false;
  const canSubmit = !closed && !genderFull && waiverAccepted;

  const progress = useMemo(() => {
    if (!slots) return 0;
    return Math.min(
      100,
      Math.round((slots.paid / ISLAND_CAMP_CAPACITY) * 100),
    );
  }, [slots]);

  const closesLabel = slots
    ? new Date(slots.registrationClosesAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "24 September 2026";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !gender) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/register/island-camp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          gender,
          communityIdentity,
          waiverAccepted,
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

  const totalPay =
    slots?.totalAmountNaira ??
    ISLAND_CAMP_AMOUNT_NAIRA + Math.ceil(452);
  const feePay = slots?.paystackFeeNaira ?? 452;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-6">
        <div className="rounded-[1.75rem] border border-ink/10 bg-white/80 p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink/45">
                Slots confirmed
              </p>
              <p className="font-display mt-2 text-5xl tabular-nums text-ink">
                {slots ? slots.paid : "—"}
                <span className="ml-2 text-2xl text-ink/40">
                  / {ISLAND_CAMP_CAPACITY}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/45">
                Camp fee
              </p>
              <p className="font-display mt-2 text-3xl text-lagoon">
                ₦{ISLAND_CAMP_AMOUNT_NAIRA.toLocaleString("en-NG")}
              </p>
              <p className="mt-1 text-xs text-ink/45">
                + ~₦{feePay.toLocaleString("en-NG")} Paystack fee at checkout
              </p>
            </div>
          </div>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-mist">
            <div
              className="h-full rounded-full bg-lagoon transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-mist/60 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-ink/40">
                Male slots left
              </p>
              <p className="font-display mt-1 text-2xl tabular-nums">
                {slots?.male.remaining ?? "—"}
                <span className="text-base text-ink/35">
                  {" "}
                  / {ISLAND_CAMP_CAPACITY_PER_GENDER}
                </span>
              </p>
            </div>
            <div className="rounded-xl bg-mist/60 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-ink/40">
                Female slots left
              </p>
              <p className="font-display mt-1 text-2xl tabular-nums">
                {slots?.female.remaining ?? "—"}
                <span className="text-base text-ink/35">
                  {" "}
                  / {ISLAND_CAMP_CAPACITY_PER_GENDER}
                </span>
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm text-ink-soft">
            {closed
              ? "Registration is closed."
              : `Closes ${closesLabel} or when all slots fill.`}
          </p>
        </div>

        <div
          className="rounded-[1.75rem] p-6 text-foam sm:p-8"
          style={{
            background:
              "linear-gradient(145deg, #0a1628 0%, #1a3a5c 40%, #0d4d4a 70%, #790720 100%)",
          }}
        >
          <p className="text-sm uppercase tracking-[0.22em] text-sand/80">
            Important information
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-foam/80">
            <li>
              <strong className="text-foam">Community only.</strong> Link Circle
              members — we verify your WhatsApp display name or group number.
            </li>
            <li>
              Meet at the jetty by <strong className="text-foam">1:00pm</strong>.
              Camp starts <strong className="text-foam">2:00pm</strong>. Last
              boat crossing to Tarkwa Bay is around{" "}
              <strong className="text-foam">5:00pm</strong>.
            </li>
            <li>
              ₦23,000 covers tent, cabana, drinks (soft drinks, water, juice,
              alcohol &amp; red wine), and bonfire. Food and transport are{" "}
              <strong className="text-foam">not</strong> included.
            </li>
            <li>
              Jetty details shared in WhatsApp after payment. Transport is
              roughly ₦2,500 each way — you pay at the terminal.
            </li>
            <li>No refunds. Payment confirms your slot.</li>
          </ul>
        </div>

        <div className="rounded-[1.75rem] border border-ink/10 bg-mist/50 p-6 sm:p-8">
          <p className="text-sm uppercase tracking-[0.22em] text-lagoon">
            Tents (2 per tent)
          </p>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink-soft">
            <p>
              Everyone registers on their own. Tents sleep{" "}
              <strong className="text-ink">two people</strong>. Arrange your
              tent-mate before or after you pay — we don&apos;t assign partners
              on the form.
            </p>
            <ul className="list-inside list-disc space-y-2 pl-1">
              <li>Same-gender members can share a tent.</li>
              <li>
                Couples who are both in Link Circle can share a tent.
              </li>
              <li>
                Your tent-mate must also be registered and paid for this camp.
              </li>
            </ul>
            <p className="text-ink/55">
              Pairing is between members. Sort plans with your tent-mate
              directly.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-ink/10 bg-white p-6 shadow-sm sm:p-8">
        {closed ? (
          <div className="py-10 text-center">
            <p className="font-display text-3xl">Registration closed</p>
            <p className="mt-3 text-ink-soft">
              LC Island Camp is full or past the registration deadline. Watch
              the community for the next drop.
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
              <h2 className="font-display text-2xl">Book your slot</h2>
              <p className="mt-1 text-sm text-ink-soft">
                Pay ₦{totalPay.toLocaleString("en-NG")} total via Paystack
                (includes processing fee). Your name goes on the camp list after
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
                className="mt-1 w-full rounded-xl border border-ink/15 bg-mist/40 px-4 py-3 text-ink outline-none focus:border-lagoon"
              />
            </label>

            <label className="block text-sm text-ink/50">
              Email
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-ink/15 bg-mist/40 px-4 py-3 text-ink outline-none focus:border-lagoon"
                placeholder="For Paystack receipt"
              />
            </label>

            <label className="block text-sm text-ink/50">
              Phone number
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-ink/15 bg-mist/40 px-4 py-3 text-ink outline-none focus:border-lagoon"
                placeholder="080…"
              />
            </label>

            <fieldset>
              <legend className="text-sm text-ink/50">Gender slot</legend>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {(["male", "female"] as const).map((g) => {
                  const full =
                    g === "male" ? slots?.male.full : slots?.female.full;
                  const remaining =
                    g === "male"
                      ? slots?.male.remaining
                      : slots?.female.remaining;
                  return (
                    <label
                      key={g}
                      className={`flex cursor-pointer flex-col rounded-xl border px-4 py-3 transition ${
                        gender === g
                          ? "border-lagoon bg-lagoon/10"
                          : "border-ink/15 bg-mist/40"
                      } ${full ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        disabled={full}
                        checked={gender === g}
                        onChange={() => setGender(g)}
                        className="sr-only"
                      />
                      <span className="font-medium capitalize text-ink">
                        {g}
                      </span>
                      <span className="text-xs text-ink/45">
                        {full
                          ? "Full"
                          : `${remaining ?? "—"} left`}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <label className="block text-sm text-ink/50">
              WhatsApp display name or group number
              <input
                required
                value={communityIdentity}
                onChange={(e) => setCommunityIdentity(e.target.value)}
                className="mt-1 w-full rounded-xl border border-ink/15 bg-mist/40 px-4 py-3 text-ink outline-none focus:border-lagoon"
                placeholder="@YourName or 080…"
              />
              <span className="mt-1 block text-xs text-ink/40">
                Must match how we know you in the Link Circle WhatsApp
                community.
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink/10 bg-mist/30 px-4 py-3 text-sm text-ink-soft">
              <input
                type="checkbox"
                required
                checked={waiverAccepted}
                onChange={(e) => setWaiverAccepted(e.target.checked)}
                className="mt-1"
              />
              <span>
                I accept the risks of outdoor beach and camping activities
                (swimming, uneven terrain, boats, fire pit, shared tents). I
                understand there are no refunds.
              </span>
            </label>

            <button
              type="submit"
              disabled={busy || !canSubmit || !gender}
              className="mt-2 w-full rounded-full bg-lagoon py-4 text-sm font-semibold text-white transition hover:bg-lagoon/90 disabled:opacity-60"
            >
              {busy
                ? "Redirecting to Paystack…"
                : `Pay ₦${totalPay.toLocaleString("en-NG")} & book slot`}
            </button>

            {genderFull && gender && (
              <p className="text-center text-xs text-amber-700">
                All {gender} slots are taken. Try the other gender if
                available, or check back before {closesLabel}.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
