"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { EventItem, EventStatus } from "@/lib/site";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [status, setStatus] = useState<EventStatus>("upcoming");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/events");
    setEvents(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function createEvent(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const end = new Date(endsAt);
      const resolvedStatus: EventStatus =
        status === "upcoming" && end.getTime() < Date.now() ? "ended" : status;

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          tagline,
          description,
          startsAt: new Date(startsAt).toISOString(),
          endsAt: end.toISOString(),
          status: resolvedStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setTitle("");
      setTagline("");
      setDescription("");
      setStartsAt("");
      setEndsAt("");
      setStatus("upcoming");
      setMessage(
        `Created “${data.title}” (${data.status}). Open it to upload photo/video dumps.`,
      );
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Events</h1>
        <p className="mt-2 text-white/50">
          Add upcoming hangouts or past ones, then upload photo &amp; video
          dumps.
        </p>
      </div>

      <form
        onSubmit={createEvent}
        className="grid gap-4 rounded-2xl border border-white/10 bg-[#12181c] p-5 md:grid-cols-2"
      >
        <h2 className="font-display text-xl md:col-span-2">New event</h2>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (e.g. Last Hangout)"
          className="rounded-xl border border-white/15 bg-black/20 px-3 py-3"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as EventStatus)}
          className="rounded-xl border border-white/15 bg-black/20 px-3 py-3"
        >
          <option value="upcoming">Upcoming</option>
          <option value="ended">Past hangout (ended)</option>
          <option value="live">Live now</option>
          <option value="draft">Draft (hidden-ish)</option>
        </select>
        <input
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="Tagline"
          className="rounded-xl border border-white/15 bg-black/20 px-3 py-3 md:col-span-2"
        />
        <div>
          <label className="mb-1 block text-xs text-white/40">Starts</label>
          <input
            required
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-3"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/40">Ends</label>
          <input
            required
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-3"
          />
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What happened / what to expect"
          rows={3}
          className="rounded-xl border border-white/15 bg-black/20 px-3 py-3 md:col-span-2"
        />
        <p className="text-xs text-white/40 md:col-span-2">
          Tip: for a past hangout, set status to{" "}
          <strong className="text-white/70">Past hangout</strong> and use the
          real dates. Then open the event to upload pictures &amp; videos.
        </p>
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-[#790720] px-5 py-3 text-sm font-semibold md:col-span-2 md:w-fit"
        >
          {busy ? "Creating…" : "Create event"}
        </button>
        {message && (
          <p className="text-sm text-white/60 md:col-span-2">{message}</p>
        )}
      </form>

      <div className="space-y-3">
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/admin/events/${event.id}`}
            className="block rounded-2xl border border-white/10 bg-[#12181c] p-5 hover:border-white/25"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-xl">{event.title}</p>
                <p className="mt-1 text-sm text-white/45">
                  {new Date(event.startsAt).toLocaleString()} · {event.status} ·{" "}
                  {event.dumps.length} media
                </p>
              </div>
              <span className="text-sm text-[#d9c4a4]">Manage dumps →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
