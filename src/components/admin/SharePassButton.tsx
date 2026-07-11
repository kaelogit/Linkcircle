"use client";

import QRCode from "qrcode";
import type { EventItem, Participant } from "@/lib/site";

function passUrlFor(token: string) {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/pass/${token}`;
}

function buildMessage(
  participant: Participant,
  event: EventItem | undefined,
  passUrl: string
) {
  const eventLine = event?.title ? `*${event.title}*` : "the Link Circle event";
  return [
    "⭕️ *Link Circle Access Pass*",
    "",
    `Hey ${participant.fullName}!`,
    "",
    `You're confirmed for ${eventLine}.`,
    "",
    "Show this pass at the door (QR code on the link below). Single use only. Once scanned, it can't be used again.",
    "",
    `Your pass link:`,
    passUrl,
    "",
    "See you there!",
    "Link Circle",
  ].join("\n");
}

async function qrFile(passUrl: string, name: string) {
  const dataUrl = await QRCode.toDataURL(passUrl, {
    width: 640,
    margin: 2,
    color: { dark: "#0e1518", light: "#ffffff" },
  });
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const safe = name.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "guest";
  return new File([blob], `link-circle-pass-${safe}.png`, {
    type: "image/png",
  });
}

function downloadQr(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(url);
}

function whatsappShareUrl(message: string, phone?: string) {
  const text = encodeURIComponent(message);
  const digits = (phone || "").replace(/\D/g, "");
  // Nigeria local 0XXXXXXXXXX → 234XXXXXXXXXX when 11 digits starting with 0
  let intl = digits;
  if (digits.length === 11 && digits.startsWith("0")) {
    intl = `234${digits.slice(1)}`;
  }
  if (intl.length >= 10 && intl.length <= 15) {
    return `https://wa.me/${intl}?text=${text}`;
  }
  return `https://wa.me/?text=${text}`;
}

export async function sharePassToWhatsApp(
  participant: Participant,
  event?: EventItem
) {
  const passUrl = passUrlFor(participant.passToken);
  const message = buildMessage(participant, event, passUrl);
  const file = await qrFile(passUrl, participant.fullName);

  // Mobile browsers that support file share can send QR + text together
  const nav = navigator as Navigator & {
    canShare?: (data: ShareData) => boolean;
  };
  if (typeof navigator.share === "function") {
    const data: ShareData = { text: message, title: "Link Circle Pass", files: [file] };
    try {
      if (!nav.canShare || nav.canShare(data)) {
        await navigator.share(data);
        return;
      }
    } catch {
      // fall through if user cancels or share fails
    }
    try {
      await navigator.share({ text: message, title: "Link Circle Pass" });
      downloadQr(file);
      return;
    } catch {
      // fall through
    }
  }

  // Desktop / fallback: download QR + open WhatsApp with write-up + link
  downloadQr(file);
  window.open(
    whatsappShareUrl(message, participant.whatsapp || participant.phone),
    "_blank",
    "noopener,noreferrer"
  );
}

export function SharePassButton({
  participant,
  event,
  className = "",
}: {
  participant: Participant;
  event?: EventItem;
  className?: string;
}) {
  return (
    <button
      type="button"
      title="Share pass on WhatsApp"
      className={`inline-flex items-center gap-1.5 text-[#25D366] hover:opacity-80 ${className}`}
      onClick={() => {
        void sharePassToWhatsApp(participant, event);
      }}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="h-3.5 w-3.5 fill-current"
      >
        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
      </svg>
      Share
    </button>
  );
}
