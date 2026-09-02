"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { EventRegistration } from "@/lib/registrations";
import {
  ISLAND_CAMP_CAPACITY,
  ISLAND_CAMP_CAPACITY_PER_GENDER,
  ISLAND_CAMP_REGISTRATION_CLOSES_AT,
} from "@/lib/island-camp";
import {
  islandCampBalanceReminderMessage,
  islandCampBalanceUrl,
  whatsappShareUrl,
} from "@/lib/island-camp-balance";
import { matchLcAdminByPhone } from "@/lib/lc-admins";

function AdminBadge({ phone }: { phone: string }) {
  const admin = matchLcAdminByPhone(phone);
  if (!admin) return null;
  return (
    <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-200">
      LC {admin.role}
    </span>
  );
}

function statusBadge(status: EventRegistration["status"]) {
  if (status === "paid") return "bg-emerald-500/20 text-emerald-200";
  if (status === "deposit_paid") return "bg-amber-500/20 text-amber-100";
  if (status === "pending") return "bg-sky-500/20 text-sky-100";
  return "bg-white/10 text-white/50";
}

function statusLabel(status: EventRegistration["status"]) {
  if (status === "deposit_paid") return "deposit paid";
  return status;
}

export default function AdminIslandCampPage() {
  const [list, setList] = useState<EventRegistration[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [emailBusy, setEmailBusy] = useState<string | null>(null);
  const [emailNotice, setEmailNotice] = useState<string | null>(null);

  const load = useCallback(() => {
    return fetch("/api/register/island-camp")
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
    void load();
  }, [load]);

  const paid = list.filter((r) => r.status === "paid");
  const depositPaid = list.filter((r) => r.status === "deposit_paid");
  const forfeited = list.filter((r) => r.status === "abandoned");
  const pending = list.filter((r) => r.status === "pending");
  const maleTaken = list.filter(
    (r) =>
      r.gender === "male" &&
      (r.status === "paid" || r.status === "deposit_paid"),
  ).length;
  const femaleTaken = list.filter(
    (r) =>
      r.gender === "female" &&
      (r.status === "paid" || r.status === "deposit_paid"),
  ).length;

  const balanceDeadline = new Date(
    ISLAND_CAMP_REGISTRATION_CLOSES_AT,
  ).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  async function copyText(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setCopiedId(null);
    }
  }

  async function sendEmailReminder(registrationId?: string) {
    const key = registrationId ?? "all";
    setEmailBusy(key);
    setEmailNotice(null);
    try {
      const res = await fetch("/api/admin/island-camp/remind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          registrationId ? { registrationId } : { all: true },
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Email failed");
      setEmailNotice(
        registrationId
          ? `Reminder email sent to ${data.results?.[0]?.email ?? "member"}.`
          : `Sent ${data.sent} of ${data.total} reminder emails.`,
      );
      await load();
    } catch (err) {
      setEmailNotice(
        err instanceof Error ? err.message : "Could not send email",
      );
    } finally {
      setEmailBusy(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">LC Island Camp</h1>
        <p className="mt-2 text-white/50">
          Tarkwa Bay · 3–4 Oct 2026 · paid bookings by gender, community verify.
        </p>
        <Link
          href="/events/lc-island-camp-oct-3/register"
          className="mt-3 inline-flex text-sm text-[#3a9a9e] underline"
        >
          Open public register page →
        </Link>
      </div>

      {error && <p className="text-sm text-red-300">{error}</p>}
      {emailNotice && (
        <p className="text-sm text-emerald-300">{emailNotice}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="rounded-2xl border border-white/10 bg-[#12181c] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">
            Fully paid
          </p>
          <p className="mt-2 font-display text-3xl">
            {paid.length} / {ISLAND_CAMP_CAPACITY}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-[#12181c] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-amber-200/60">
            Balance due
          </p>
          <p className="mt-2 font-display text-3xl text-amber-100">
            {depositPaid.length}
          </p>
          <p className="mt-1 text-xs text-white/35">Before {balanceDeadline}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#12181c] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">
            Male slots
          </p>
          <p className="mt-2 font-display text-3xl">
            {maleTaken} / {ISLAND_CAMP_CAPACITY_PER_GENDER}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#12181c] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">
            Female slots
          </p>
          <p className="mt-2 font-display text-3xl">
            {femaleTaken} / {ISLAND_CAMP_CAPACITY_PER_GENDER}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#12181c] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">
            Forfeited (no balance)
          </p>
          <p className="mt-2 font-display text-3xl">{forfeited.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#12181c] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40">
            Pending checkout
          </p>
          <p className="mt-2 font-display text-3xl">{pending.length}</p>
        </div>
      </div>

      {depositPaid.length > 0 && (
        <div className="rounded-2xl border border-amber-500/25 bg-[#12181c] p-5">
          <h2 className="font-display text-xl text-amber-100">
            Balance outstanding ({depositPaid.length})
          </h2>
          <p className="mt-2 text-sm text-white/45">
            These members paid 50% deposit. Send them the balance link, an
            email reminder, or a WhatsApp message before {balanceDeadline}.
          </p>
          <button
            type="button"
            disabled={emailBusy === "all"}
            onClick={() => void sendEmailReminder()}
            className="mt-4 rounded-lg border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm text-sky-100 hover:bg-sky-500/20 disabled:opacity-60"
          >
            {emailBusy === "all"
              ? "Sending emails…"
              : `Email all ${depositPaid.length} balance reminders`}
          </button>
          <div className="mt-5 space-y-3">
            {depositPaid.map((r) => {
              const balanceUrl = r.balanceReference
                ? islandCampBalanceUrl(r.balanceReference)
                : "";
              const message = islandCampBalanceReminderMessage(r);
              const waUrl = whatsappShareUrl(message, r.phone);
              const balanceNaira = Math.ceil((r.balanceDueKobo ?? 0) / 100);

              return (
                <div
                  key={r.id}
                  className="rounded-xl border border-amber-500/15 bg-[#0e1215] px-4 py-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{r.fullName}</p>
                        <AdminBadge phone={r.phone} />
                      </div>
                      <p className="text-sm text-white/45">
                        {r.phone} · {r.gender ?? "n/a"}
                      </p>
                      <p className="text-sm text-white/35">{r.email}</p>
                      <p className="mt-1 text-sm text-[#d9c4a4]">
                        WhatsApp: {r.communityIdentity ?? "n/a"}
                      </p>
                      <p className="mt-2 text-sm text-amber-100/90">
                        Balance: ₦{balanceNaira.toLocaleString("en-NG")}
                      </p>
                      {r.balanceReminderSentAt && (
                        <p className="mt-1 text-xs text-white/30">
                          Last email:{" "}
                          {new Date(r.balanceReminderSentAt).toLocaleDateString(
                            "en-GB",
                          )}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 sm:items-end">
                      {balanceUrl && (
                        <button
                          type="button"
                          onClick={() => void copyText(balanceUrl, `link-${r.id}`)}
                          className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white/80 hover:bg-white/5"
                        >
                          {copiedId === `link-${r.id}`
                            ? "Link copied"
                            : "Copy balance link"}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => void copyText(message, `msg-${r.id}`)}
                        className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white/80 hover:bg-white/5"
                      >
                        {copiedId === `msg-${r.id}`
                          ? "Message copied"
                          : "Copy reminder text"}
                      </button>
                      <button
                        type="button"
                        disabled={emailBusy === r.id}
                        onClick={() => void sendEmailReminder(r.id)}
                        className="rounded-lg border border-sky-400/25 bg-sky-500/10 px-3 py-2 text-xs text-sky-100 hover:bg-sky-500/20 disabled:opacity-60"
                      >
                        {emailBusy === r.id
                          ? "Sending…"
                          : "Send email reminder"}
                      </button>
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-[#25D366]/20 px-3 py-2 text-center text-xs font-medium text-[#7dffb0] hover:bg-[#25D366]/30"
                      >
                        Send WhatsApp reminder
                      </a>
                    </div>
                  </div>
                  {balanceUrl && (
                    <p className="mt-3 break-all text-xs text-white/25">
                      {balanceUrl}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-[#12181c] p-5">
        <h2 className="font-display text-xl">All bookings</h2>
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
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{r.fullName}</p>
                    <AdminBadge phone={r.phone} />
                  </div>
                  <p className="text-sm text-white/45">
                    {r.phone} · {r.gender ?? "n/a"}
                  </p>
                  <p className="text-sm text-white/35">{r.email}</p>
                  <p className="mt-1 text-sm text-[#d9c4a4]">
                    WhatsApp: {r.communityIdentity ?? "n/a"}
                  </p>
                  {r.paymentPlan === "deposit" && (
                    <p className="mt-1 text-xs text-white/30">
                      Plan: 50% deposit
                      {r.status === "deposit_paid" && r.balanceDueKobo
                        ? ` · ₦${Math.ceil(r.balanceDueKobo / 100).toLocaleString("en-NG")} balance due`
                        : ""}
                    </p>
                  )}
                </div>
                <div className="text-right text-xs">
                  <span
                    className={`rounded-full px-2 py-1 ${statusBadge(r.status)}`}
                  >
                    {statusLabel(r.status)}
                  </span>
                  <p className="mt-2 text-white/35">
                    {r.status === "deposit_paid"
                      ? `Paid ₦${Math.ceil((r.amountPaidKobo ?? 0) / 100).toLocaleString("en-NG")}`
                      : `₦${Math.round(r.amountKobo / 100).toLocaleString("en-NG")}`}
                  </p>
                  <p className="mt-1 max-w-[12rem] break-all text-white/25">
                    {r.paystackReference}
                  </p>
                  {r.balanceReference && (
                    <p className="mt-1 max-w-[12rem] break-all text-white/20">
                      bal: {r.balanceReference}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
