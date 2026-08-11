"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { EventRegistration } from "@/lib/registrations";

export default function AdminPicnicRegistrationsPage() {
  const [list, setList] = useState<EventRegistration[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/register/picnic")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Failed");
        setList(data);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load"),
      );
  }, []);

  const paid = list.filter((r) => r.status === "paid");
  const pending = list.filter((r) => r.status === "pending");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Picnic registrations</h1>
        <p className="mt-2 text-white/50">
          Networking Picnic · paid seats, bring-along list, Paystack refs.
        </p>
        <Link
          href="/events/networking-picnic-aug-29/register"
          className="mt-3 inline-flex text-sm text-[#3a9a9e] underline"
        >
          Open public register page →
        </Link>
      </div>

      {error && <p className="text-sm text-red-300">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#12181c] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">
            Paid
          </p>
          <p className="mt-2 font-display text-3xl">{paid.length} / 30</p>
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
        <h2 className="font-display text-xl">All signups</h2>
        <div className="mt-5 max-h-[40rem] space-y-3 overflow-auto">
          {list.length === 0 && (
            <p className="text-sm text-white/40">No registrations yet.</p>
          )}
          {list.map((r) => (
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
                        ? "bg-emerald-500/20 text-emerald-200"
                        : r.status === "pending"
                          ? "bg-amber-500/20 text-amber-100"
                          : "bg-white/10 text-white/50"
                    }`}
                  >
                    {r.status}
                  </span>
                  <p className="mt-2 max-w-[12rem] break-all text-white/30">
                    {r.paystackReference}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
