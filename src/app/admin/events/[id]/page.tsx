"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { EventItem, EventStatus } from "@/lib/site";

export default function AdminEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/events/${id}`);
    if (!res.ok) {
      setEvent(null);
      return;
    }
    setEvent(await res.json());
  }

  useEffect(() => {
    load();
  }, [id]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!event) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: event.title,
          tagline: event.tagline,
          description: event.description,
          startsAt: event.startsAt,
          endsAt: event.endsAt,
          locationPublic: event.locationPublic,
          priceLabel: event.priceLabel,
          capacity: event.capacity,
          status: event.status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setEvent(data);
      setMessage("Saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function uploadDump(e: React.FormEvent) {
    e.preventDefault();
    if (files.length === 0) return;
    setBusy(true);
    setMessage(null);
    try {
      const form = new FormData();
      files.forEach((f) => form.append("file", f));
      form.append("caption", caption);
      const res = await fetch(`/api/events/${id}/dumps`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setEvent(data.event);
      setFiles([]);
      setCaption("");
      setMessage(
        `${data.dumps?.length ?? 1} file(s) uploaded. Live on homepage & event page.`,
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function removeDump(dumpId: string) {
    const res = await fetch(`/api/events/${id}/dumps?dumpId=${dumpId}`, {
      method: "DELETE",
    });
    if (res.ok) setEvent(await res.json());
  }

  async function removeEvent() {
    if (!confirm("Delete this event?")) return;
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/admin/events");
  }

  if (!event) {
    return <p className="text-white/50">Loading event…</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/events" className="text-sm text-white/45">
            ← Events
          </Link>
          <h1 className="mt-2 font-display text-3xl">{event.title}</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/events/${event.slug}`}
            className="rounded-full border border-white/15 px-4 py-2 text-sm"
          >
            View public
          </Link>
          <Link
            href={`/admin/participants?eventId=${event.id}`}
            className="rounded-full bg-[#790720] px-4 py-2 text-sm font-semibold"
          >
            Participants
          </Link>
        </div>
      </div>

      <form
        onSubmit={save}
        className="grid gap-4 rounded-2xl border border-white/10 bg-[#12181c] p-5 md:grid-cols-2"
      >
        <h2 className="font-display text-xl md:col-span-2">Details</h2>
        <input
          value={event.title}
          onChange={(e) => setEvent({ ...event, title: e.target.value })}
          className="rounded-xl border border-white/15 bg-black/20 px-3 py-3"
        />
        <select
          value={event.status}
          onChange={(e) =>
            setEvent({ ...event, status: e.target.value as EventStatus })
          }
          className="rounded-xl border border-white/15 bg-black/20 px-3 py-3"
        >
          <option value="draft">draft</option>
          <option value="upcoming">upcoming</option>
          <option value="live">live</option>
          <option value="ended">ended</option>
        </select>
        <input
          value={event.tagline}
          onChange={(e) => setEvent({ ...event, tagline: e.target.value })}
          className="rounded-xl border border-white/15 bg-black/20 px-3 py-3 md:col-span-2"
          placeholder="Tagline"
        />
        <textarea
          value={event.description}
          onChange={(e) => setEvent({ ...event, description: e.target.value })}
          rows={4}
          className="rounded-xl border border-white/15 bg-black/20 px-3 py-3 md:col-span-2"
        />
        <input
          type="datetime-local"
          value={event.startsAt.slice(0, 16)}
          onChange={(e) =>
            setEvent({
              ...event,
              startsAt: new Date(e.target.value).toISOString(),
            })
          }
          className="rounded-xl border border-white/15 bg-black/20 px-3 py-3"
        />
        <input
          type="datetime-local"
          value={event.endsAt.slice(0, 16)}
          onChange={(e) =>
            setEvent({
              ...event,
              endsAt: new Date(e.target.value).toISOString(),
            })
          }
          className="rounded-xl border border-white/15 bg-black/20 px-3 py-3"
        />
        <input
          value={event.locationPublic}
          onChange={(e) =>
            setEvent({ ...event, locationPublic: e.target.value })
          }
          className="rounded-xl border border-white/15 bg-black/20 px-3 py-3 md:col-span-2"
          placeholder="Public location"
        />
        <input
          value={event.priceLabel}
          onChange={(e) => setEvent({ ...event, priceLabel: e.target.value })}
          className="rounded-xl border border-white/15 bg-black/20 px-3 py-3"
          placeholder="Price label"
        />
        <input
          type="number"
          value={event.capacity}
          onChange={(e) =>
            setEvent({ ...event, capacity: Number(e.target.value) })
          }
          className="rounded-xl border border-white/15 bg-black/20 px-3 py-3"
          placeholder="Capacity"
        />
        <div className="flex flex-wrap gap-3 md:col-span-2">
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#0f1417]"
          >
            Save changes
          </button>
          <button
            type="button"
            onClick={removeEvent}
            className="rounded-full border border-red-400/40 px-5 py-2.5 text-sm text-red-300"
          >
            Delete event
          </button>
        </div>
      </form>

      <section className="rounded-2xl border border-white/10 bg-[#12181c] p-5">
        <h2 className="font-display text-xl">Event dumps</h2>
        <p className="mt-2 text-sm text-white/45">
          Upload photos and videos from the hangout. Visitors see them on the
          homepage and this event&apos;s public page.
        </p>
        <form
          onSubmit={uploadDump}
          className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]"
        >
          <input
            type="file"
            accept="image/*,video/*,.mp4,.webm,.mov,.m4v"
            multiple
            onChange={(e) =>
              setFiles(e.target.files ? Array.from(e.target.files) : [])
            }
            className="rounded-xl border border-white/15 bg-black/20 px-3 py-3 text-sm"
          />
          <button
            type="submit"
            disabled={busy || files.length === 0}
            className="rounded-full bg-[#790720] px-5 py-3 text-sm font-semibold disabled:opacity-50"
          >
            {busy ? "Uploading…" : "Upload"}
          </button>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption (optional, applied when uploading one file)"
            className="rounded-xl border border-white/15 bg-black/20 px-3 py-3 md:col-span-2"
          />
          {files.length > 0 && (
            <p className="text-xs text-white/40 md:col-span-2">
              Selected: {files.map((f) => f.name).join(", ")}
            </p>
          )}
        </form>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {event.dumps.length === 0 && (
            <p className="text-sm text-white/40">No dumps yet.</p>
          )}
          {event.dumps.map((dump) => {
            const isVideo =
              dump.type === "video" ||
              /\.(mp4|webm|mov|m4v|ogg)$/i.test(dump.url);
            return (
              <div
                key={dump.id}
                className="overflow-hidden rounded-xl border border-white/10"
              >
                {isVideo ? (
                  <video
                    src={dump.url}
                    controls
                    playsInline
                    preload="metadata"
                    className="aspect-[4/3] w-full bg-black object-cover"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={dump.url}
                    alt={dump.caption || "Event dump"}
                    className="aspect-[4/3] w-full object-cover"
                  />
                )}
                <div className="flex items-center justify-between gap-2 p-3">
                  <p className="truncate text-xs text-white/55">
                    {isVideo ? "Video · " : "Photo · "}
                    {dump.caption || "Untitled"}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeDump(dump.id)}
                    className="text-xs text-red-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {message && <p className="text-sm text-white/55">{message}</p>}
    </div>
  );
}
