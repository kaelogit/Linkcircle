"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import type { EventItem } from "@/lib/site";

type ScanState =
  | { kind: "idle" }
  | { kind: "success"; name: string; message: string }
  | { kind: "error"; message: string };

function extractToken(raw: string) {
  try {
    const url = new URL(raw);
    const parts = url.pathname.split("/").filter(Boolean);
    const passIndex = parts.indexOf("pass");
    if (passIndex >= 0 && parts[passIndex + 1]) return parts[passIndex + 1];
  } catch {
    // raw token
  }
  return raw.trim();
}

export default function AdminScanPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventId, setEventId] = useState("");
  const [state, setState] = useState<ScanState>({ kind: "idle" });
  const [manual, setManual] = useState("");
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lockRef = useRef(false);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data: EventItem[]) => {
        setEvents(data);
        setEventId(
          data.find((e) => e.status === "upcoming" || e.status === "live")
            ?.id ||
            data[0]?.id ||
            "",
        );
      });
  }, []);

  useEffect(() => {
    return () => {
      scannerRef.current?.stop().catch(() => undefined);
    };
  }, []);

  const processToken = useCallback(
    async (raw: string) => {
      if (lockRef.current) return;
      lockRef.current = true;
      const token = extractToken(raw);
      try {
        const res = await fetch(`/api/pass/${token}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId: eventId || undefined }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setState({
            kind: "error",
            message: data.message || "Access denied",
          });
        } else {
          setState({
            kind: "success",
            name: data.participant.fullName,
            message: data.message,
          });
        }
      } catch {
        setState({ kind: "error", message: "Network error. Try again." });
      } finally {
        setTimeout(() => {
          lockRef.current = false;
        }, 1800);
      }
    },
    [eventId],
  );

  async function startScan() {
    setState({ kind: "idle" });
    const scanner = new Html5Qrcode("lc-admin-qr-reader");
    scannerRef.current = scanner;
    setScanning(true);
    await scanner.start(
      { facingMode: "environment" },
      { fps: 8, qrbox: { width: 260, height: 260 } },
      (decoded) => {
        processToken(decoded);
      },
      () => undefined,
    );
  }

  async function stopScan() {
    await scannerRef.current?.stop().catch(() => undefined);
    scannerRef.current = null;
    setScanning(false);
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-display text-3xl">Door scan</h1>
        <p className="mt-2 text-white/50">
          Scan the participant QR (or paste their pass link). Each pass works
          once.
        </p>
      </div>

      <div>
        <label className="text-sm text-white/45">Event gate</label>
        <select
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/15 bg-[#12181c] px-3 py-3"
        >
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/15 bg-black/40">
        <div id="lc-admin-qr-reader" className="min-h-[280px] w-full" />
      </div>

      <div className="flex gap-3">
        {!scanning ? (
          <button
            type="button"
            onClick={startScan}
            className="flex-1 rounded-full bg-[#790720] py-3 text-sm font-semibold"
          >
            Start camera
          </button>
        ) : (
          <button
            type="button"
            onClick={stopScan}
            className="flex-1 rounded-full border border-white/25 py-3 text-sm font-semibold"
          >
            Stop camera
          </button>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (manual.trim()) processToken(manual.trim());
        }}
      >
        <label className="text-sm text-white/45">Manual pass URL / token</label>
        <input
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          className="mt-2 w-full rounded-xl border border-white/15 bg-[#12181c] px-4 py-3"
          placeholder="Paste pass link"
        />
        <button
          type="submit"
          className="mt-3 w-full rounded-full bg-white py-3 text-sm font-semibold text-[#0f1417]"
        >
          Check in
        </button>
      </form>

      {state.kind === "success" && (
        <div className="animate-rise rounded-2xl bg-emerald-500/20 px-6 py-8 text-center ring-1 ring-emerald-400/40">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">
            Access granted
          </p>
          <p className="mt-3 font-display text-3xl">{state.name}</p>
          <p className="mt-3 text-lg text-emerald-50">{state.message}</p>
        </div>
      )}

      {state.kind === "error" && (
        <div className="animate-rise rounded-2xl bg-red-500/20 px-6 py-8 text-center ring-1 ring-red-400/40">
          <p className="text-sm uppercase tracking-[0.2em] text-red-200">
            Access denied
          </p>
          <p className="mt-3 text-lg">{state.message}</p>
        </div>
      )}
    </div>
  );
}
