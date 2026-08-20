"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { EventRegistration } from "@/lib/registrations";

type CompResult = {
  fullName: string;
  phone: string;
  status: "created" | "skipped" | "error";
  reason?: string;
};

export default function AdminPicnicRegistrationsPage() {
  const [list, setList] = useState<EventRegistration[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [compMessage, setCompMessage] = useState<string | null>(null);
  const [compResults, setCompResults] = useState<CompResult[] | null>(null);

  const [oneName, setOneName] = useState("");
  const [oneEmail, setOneEmail] = useState("");
  const [onePhone, setOnePhone] = useState("");

  const load = useCallback(() => {
    return fetch("/api/register/picnic")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Failed");
        setList(data);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load"),
      );
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Idempotent: create any missing complimentary admin seats, then refresh list
      try {
        const r = await fetch("/api/register/picnic/complimentary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "admins" }),
        });
        const data = await r.json().catch(() => ({}));
        if (!cancelled && r.ok && Array.isArray(data.results)) {
          const created = (data.results as CompResult[]).filter(
            (x) => x.status === "created",
          ).length;
          if (created > 0) {
            setCompResults(data.results as CompResult[]);
            setCompMessage(
              `Added ${created} complimentary admin seat(s). They count toward the 30.`,
            );
          }
        }
      } catch {
        /* list load still runs */
      }
      if (!cancelled) await load();
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const paid = list.filter((r) => r.status === "paid");
  const pending = list.filter((r) => r.status === "pending");
  const complimentary = paid.filter((r) =>
    r.paystackReference.startsWith("lc_picnic_comp_"),
  );

  async function registerAdminsComplimentary() {
    setBusy(true);
    setCompMessage(null);
    setCompResults(null);
    setError(null);
    try {
      const r = await fetch("/api/register/picnic/complimentary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "admins" }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed");
      setCompResults(data.results as CompResult[]);
      const created = (data.results as CompResult[]).filter(
        (x) => x.status === "created",
      ).length;
      setCompMessage(
        created
          ? `Added ${created} complimentary admin seat(s). They count toward the 30.`
          : "No new complimentary seats added (already registered or missing phone).",
      );
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function registerOneComplimentary(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setCompMessage(null);
    setError(null);
    try {
      const r = await fetch("/api/register/picnic/complimentary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "one",
          fullName: oneName,
          email: oneEmail,
          phone: onePhone,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed");
      setCompMessage(
        data.created
          ? `Complimentary seat added for ${oneName}.`
          : `${oneName} already has a paid picnic seat — skipped.`,
      );
      setOneName("");
      setOneEmail("");
      setOnePhone("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Picnic registrations</h1>
        <p className="mt-2 text-white/50">
          Networking Picnic · paid seats, complimentary admin seats, bring-along
          list.
        </p>
        <Link
          href="/events/networking-picnic-aug-29/register"
          className="mt-3 inline-flex text-sm text-[#3a9a9e] underline"
        >
          Open public register page →
        </Link>
      </div>

      {error && <p className="text-sm text-red-300">{error}</p>}
      {compMessage && <p className="text-sm text-emerald-200">{compMessage}</p>}

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#12181c] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">
            Seats taken
          </p>
          <p className="mt-2 font-display text-3xl">{paid.length} / 30</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#12181c] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">
            Complimentary
          </p>
          <p className="mt-2 font-display text-3xl">{complimentary.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#12181c] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">
            Pending checkout
          </p>
          <p className="mt-2 font-display text-3xl">{pending.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#12181c] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">
            Remaining
          </p>
          <p className="mt-2 font-display text-3xl">
            {Math.max(0, 30 - paid.length)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#12181c] p-5">
        <h2 className="font-display text-xl">Complimentary admin seats</h2>
        <p className="mt-2 text-sm text-white/45">
          Free seats still count down the 30. Founder (you) is skipped if already
          paid. Kiel Tee is on the auto list with 09133263052 — add other admin
          phones with the form below.
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={registerAdminsComplimentary}
          className="mt-4 rounded-full bg-[#3a9a9e] px-5 py-2.5 text-sm font-medium text-[#0b1214] disabled:opacity-50"
        >
          {busy ? "Working…" : "Register LC admins (free)"}
        </button>
        {compResults && (
          <ul className="mt-4 space-y-1 text-sm text-white/55">
            {compResults.map((r) => (
              <li key={`${r.fullName}-${r.phone}`}>
                {r.fullName}: {r.status}
                {r.reason ? ` — ${r.reason}` : ""}
              </li>
            ))}
          </ul>
        )}

        <form
          onSubmit={registerOneComplimentary}
          className="mt-6 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-4"
        >
          <input
            required
            value={oneName}
            onChange={(e) => setOneName(e.target.value)}
            placeholder="Full name"
            className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm"
          />
          <input
            required
            type="email"
            value={oneEmail}
            onChange={(e) => setOneEmail(e.target.value)}
            placeholder="Email"
            className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm"
          />
          <input
            required
            value={onePhone}
            onChange={(e) => setOnePhone(e.target.value)}
            placeholder="Phone"
            className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-full border border-white/20 px-4 py-2 text-sm disabled:opacity-50"
          >
            Add free seat
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#12181c] p-5">
        <h2 className="font-display text-xl">All signups</h2>
        <div className="mt-5 max-h-[40rem] space-y-3 overflow-auto">
          {list.length === 0 && (
            <p className="text-sm text-white/40">No registrations yet.</p>
          )}
          {list.map((r) => {
            const isComp = r.paystackReference.startsWith("lc_picnic_comp_");
            return (
              <div
                key={r.id}
                className="rounded-xl border border-white/10 px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{r.fullName}</p>
                    <p className="text-sm text-white/45">
                      {r.phone}
                      {r.whatsapp ? ` · WA ${r.whatsapp}` : ""}
                    </p>
                    <p className="text-sm text-white/35">{r.email}</p>
                    <p className="mt-1 text-sm text-white/50">
                      Lives: {r.residence}
                    </p>
                    <p className="mt-1 text-sm text-[#d9c4a4]">
                      Bringing: {r.bringItem}
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    <span
                      className={`rounded-full px-2 py-1 ${
                        r.status === "paid"
                          ? isComp
                            ? "bg-sky-500/20 text-sky-100"
                            : "bg-emerald-500/20 text-emerald-200"
                          : r.status === "pending"
                            ? "bg-amber-500/20 text-amber-100"
                            : "bg-white/10 text-white/50"
                      }`}
                    >
                      {r.status === "paid" && isComp
                        ? "complimentary"
                        : r.status}
                    </span>
                    <p className="mt-2 max-w-[12rem] break-all text-white/30">
                      {r.paystackReference}
                    </p>
                    {r.amountKobo === 0 && r.status === "paid" && (
                      <p className="mt-1 text-white/35">₦0</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
