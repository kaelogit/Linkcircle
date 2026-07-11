"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { SharePassButton } from "@/components/admin/SharePassButton";
import type { EventItem, Participant } from "@/lib/site";

function ParticipantsInner() {
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventId, setEventId] = useState("");
  const [list, setList] = useState<Participant[]>([]);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [passUrl, setPassUrl] = useState<string | null>(null);
  const [lastCreated, setLastCreated] = useState<Participant | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data: EventItem[]) => {
        setEvents(data);
        const fromQuery = searchParams.get("eventId");
        const initial =
          fromQuery ||
          data.find((e) => e.status === "upcoming" || e.status === "live")
            ?.id ||
          data[0]?.id ||
          "";
        setEventId(initial);
      });
  }, [searchParams]);

  useEffect(() => {
    if (!eventId) return;
    fetch(`/api/participants?eventId=${eventId}`)
      .then((r) => r.json())
      .then(setList);
  }, [eventId, passUrl]);

  const event = useMemo(
    () => events.find((e) => e.id === eventId),
    [events, eventId],
  );

  async function addPaid(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    setPassUrl(null);
    setLastCreated(null);
    try {
      const res = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          fullName,
          phone,
          whatsapp: whatsapp || phone,
          paymentStatus: "paid",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setPassUrl(data.passUrl);
      setLastCreated(data.participant);
      setFullName("");
      setPhone("");
      setWhatsapp("");
      setMessage(`Pass created for ${data.participant.fullName}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function revoke(id: string) {
    await fetch("/api/participants", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "revoke", id }),
    });
    const res = await fetch(`/api/participants?eventId=${eventId}`);
    setList(await res.json());
  }

  const checkedIn = list.filter((p) => p.checkedInAt).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Participants</h1>
          <p className="mt-2 text-white/50">
            Add people who paid in WhatsApp. Share their pass link + QR.
          </p>
        </div>
        <Link
          href="/admin/scan"
          className="rounded-full bg-[#790720] px-5 py-2.5 text-sm font-semibold"
        >
          Open door scan
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <form
          onSubmit={addPaid}
          className="rounded-2xl border border-white/10 bg-[#12181c] p-5"
        >
          <label className="text-sm text-white/45">Event</label>
          <select
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-3"
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>

          <label className="mt-4 block text-sm text-white/45">Full name</label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-3"
          />

          <label className="mt-4 block text-sm text-white/45">Phone</label>
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-3"
          />

          <label className="mt-4 block text-sm text-white/45">WhatsApp</label>
          <input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-3"
            placeholder="Optional"
          />

          <button
            type="submit"
            disabled={busy || !eventId}
            className="mt-6 w-full rounded-full bg-white py-3 text-sm font-semibold text-[#0f1417]"
          >
            {busy ? "Creating…" : "Create pass"}
          </button>

          {message && <p className="mt-4 text-sm text-white/55">{message}</p>}
          {passUrl && (
            <div className="mt-4 rounded-xl bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-white/40">
                Share this pass
              </p>
              <a
                href={passUrl}
                className="mt-2 block break-all text-sm text-[#3a9a9e] underline"
              >
                {passUrl}
              </a>
              <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(passUrl)}
                >
                  Copy link
                </button>
                {lastCreated && (
                  <SharePassButton participant={lastCreated} event={event} />
                )}
              </div>
            </div>
          )}
        </form>

        <div className="rounded-2xl border border-white/10 bg-[#12181c] p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl">Inventory</h2>
            <p className="text-sm text-white/45">
              {checkedIn}/{list.length} in
              {event ? ` · ${event.title}` : ""}
            </p>
          </div>
          <div className="mt-5 max-h-[32rem] space-y-3 overflow-auto">
            {list.length === 0 && (
              <p className="text-sm text-white/40">No participants yet.</p>
            )}
            {list.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-white/10 px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{p.fullName}</p>
                    <p className="text-sm text-white/45">{p.phone}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs ${
                      p.revokedAt
                        ? "bg-red-500/20 text-red-200"
                        : p.checkedInAt
                          ? "bg-emerald-500/20 text-emerald-200"
                          : "bg-white/10 text-white/60"
                    }`}
                  >
                    {p.revokedAt
                      ? "Revoked"
                      : p.checkedInAt
                        ? "Checked in"
                        : "Ready"}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs">
                  <a
                    href={`/pass/${p.passToken}`}
                    className="text-[#3a9a9e] underline"
                  >
                    Open pass
                  </a>
                  {!p.revokedAt && (
                    <>
                      <SharePassButton participant={p} event={event} />
                      <button
                        type="button"
                        onClick={() => revoke(p.id)}
                        className="text-red-300"
                      >
                        Revoke
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminParticipantsPage() {
  return (
    <Suspense fallback={<p className="text-white/50">Loading…</p>}>
      <ParticipantsInner />
    </Suspense>
  );
}
