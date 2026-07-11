"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { EventItem, Participant } from "@/lib/site";

export default function AdminDashboard() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/events").then((r) => r.json()),
      fetch("/api/participants").then((r) => r.json()),
    ]).then(([e, p]) => {
      setEvents(e);
      setParticipants(p);
    });
  }, []);

  const upcoming = events.filter(
    (e) => e.status === "upcoming" || e.status === "live",
  ).length;
  const checkedIn = participants.filter((p) => p.checkedInAt).length;
  const dumps = events.reduce((n, e) => n + e.dumps.length, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl">Dashboard</h1>
        <p className="mt-2 text-white/50">
          Manage events, paid passes, dumps, and door check-in.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Events", value: events.length },
          { label: "Upcoming", value: upcoming },
          { label: "Passes", value: participants.length },
          { label: "Checked in", value: `${checkedIn}` },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-white/10 bg-[#12181c] p-5"
          >
            <p className="text-xs uppercase tracking-[0.16em] text-white/40">
              {card.label}
            </p>
            <p className="mt-3 font-display text-3xl">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/admin/events"
          className="rounded-2xl border border-white/10 bg-[#12181c] p-5 hover:border-[#790720]/50"
        >
          <p className="font-display text-xl">Events</p>
          <p className="mt-2 text-sm text-white/50">
            Create future or past events, upload photo/video dumps ({dumps}).
          </p>
        </Link>
        <Link
          href="/admin/participants"
          className="rounded-2xl border border-white/10 bg-[#12181c] p-5 hover:border-[#790720]/50"
        >
          <p className="font-display text-xl">Participants</p>
          <p className="mt-2 text-sm text-white/50">
            Add people who paid in group chat and share pass links.
          </p>
        </Link>
        <Link
          href="/admin/scan"
          className="rounded-2xl border border-white/10 bg-[#790720] p-5 text-white"
        >
          <p className="font-display text-xl">Door scan</p>
          <p className="mt-2 text-sm text-white/85">
            Scan QR passes at the door. One scan = one entry.
          </p>
        </Link>
      </div>
    </div>
  );
}
