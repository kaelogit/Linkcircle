"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import type { EventItem, Participant } from "@/lib/site";
import { formatEventRange } from "@/lib/site";

export function PassView({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [event, setEvent] = useState<EventItem | null>(null);
  const [qr, setQr] = useState<string>("");

  const passUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/pass/${token}`;
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/pass/${token}`);
        if (!res.ok) throw new Error("Pass not found");
        const data = await res.json();
        if (cancelled) return;
        setParticipant(data.participant);
        setEvent(data.event);
        const dataUrl = await QRCode.toDataURL(
          `${window.location.origin}/pass/${token}`,
          {
            width: 420,
            margin: 1,
            color: { dark: "#0e1518", light: "#ffffff" },
          },
        );
        setQr(dataUrl);
      } catch {
        if (!cancelled) setError("This pass link is invalid or expired.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loading) {
    return (
      <div className="grid min-h-[70vh] place-items-center pt-16 text-ink-soft">
        Loading your pass…
      </div>
    );
  }

  if (error || !participant) {
    return (
      <div className="section-pad mx-auto max-w-lg pt-16 pb-24 text-center">
        <h1 className="font-display text-3xl">Pass not found</h1>
        <p className="mt-3 text-ink-soft">{error}</p>
      </div>
    );
  }

  const used = Boolean(participant.checkedInAt);
  const revoked = Boolean(participant.revokedAt);

  return (
    <div className="section-pad mx-auto max-w-lg pt-12 pb-24">
      <div className="overflow-hidden rounded-[2rem] border border-ink/10 bg-white shadow-[0_30px_80px_rgba(14,21,24,0.08)]">
        <div className="atmosphere px-6 py-8 text-foam">
          <p className="text-xs uppercase tracking-[0.22em] text-sand">
            Link Circle Access Pass
          </p>
          <h1 className="font-display mt-3 text-3xl">{participant.fullName}</h1>
          <p className="mt-2 text-foam/75">{event?.title ?? "Event pass"}</p>
          {event && (
            <p className="mt-1 text-sm text-foam/55">
              {formatEventRange(event.startsAt, event.endsAt)}
            </p>
          )}
        </div>

        <div className="px-6 py-8 text-center">
          {qr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qr}
              alt="Access QR code"
              className="mx-auto h-56 w-56 rounded-2xl border border-ink/10"
            />
          ) : null}
          <p className="mt-5 text-sm text-ink-soft">
            Show this QR at the door or open this link if you lose the image.
          </p>
          <p className="mt-3 break-all rounded-xl bg-mist px-3 py-2 text-xs text-ink/70">
            {passUrl}
          </p>

          {revoked && (
            <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              This pass has been revoked. Contact an admin.
            </p>
          )}
          {!revoked && used && (
            <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Already checked in at{" "}
              {new Date(participant.checkedInAt!).toLocaleString()}.
            </p>
          )}
          {!revoked && !used && (
            <p className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Ready for check-in. Single use only.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
