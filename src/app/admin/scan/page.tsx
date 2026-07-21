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

  async function stopCamera() {
    try {
      await scannerRef.current?.stop();
    } catch {
      // already stopped
    }
    scannerRef.current = null;
    setScanning(false);
  }

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

        // Stop the camera immediately so the result is obvious
        await stopCamera();

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
        await stopCamera();
        setState({ kind: "error", message: "Network error. Try again." });
      } finally {
        lockRef.current = false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  function dismiss() {
    setState({ kind: "idle" });
  }

  // Fullscreen result overlay
  if (state.kind === "success" || state.kind === "error") {
    const isOk = state.kind === "success";
    return (
      <div
        className={`fixed inset-0 z-[999] flex flex-col items-center justify-center p-8 ${
          isOk ? "bg-emerald-900/95" : "bg-red-900/95"
        }`}
      >
        <div className="animate-rise text-center">
          <div
            className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full ${
              isOk ? "bg-emerald-500/30" : "bg-red-500/30"
            }`}
          >
            {isOk ? (
              <svg
                viewBox="0 0 24 24"
                className="h-14 w-14 text-emerald-300"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="h-14 w-14 text-red-300"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            )}
          </div>

          <p className="mt-6 text-sm uppercase tracking-[0.25em] text-white/70">
            {isOk ? "Access granted" : "Access denied"}
          </p>

          {state.kind === "success" && (
            <p className="mt-4 font-display text-4xl text-white sm:text-5xl">
              {state.name}
            </p>
          )}

          <p className="mt-4 text-xl text-white/80">{state.message}</p>

          <button
            type="button"
            onClick={dismiss}
            className={`mt-10 rounded-full px-10 py-4 text-lg font-semibold ${
              isOk
                ? "bg-emerald-500 text-emerald-950"
                : "bg-red-500 text-red-950"
            }`}
          >
            Scan next
          </button>
        </div>
      </div>
    );
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
            onClick={stopCamera}
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
    </div>
  );
}
