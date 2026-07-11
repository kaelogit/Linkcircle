import type { EventDump } from "@/lib/site";

const VIDEO_EXT = [".mp4", ".webm", ".mov", ".m4v", ".ogg"];

export function resolveDumpType(
  dump: Pick<EventDump, "url" | "type">,
): "image" | "video" {
  if (dump.type === "video" || dump.type === "image") return dump.type;
  const lower = dump.url.toLowerCase();
  return VIDEO_EXT.some((ext) => lower.endsWith(ext)) ? "video" : "image";
}

export function DumpMedia({
  dump,
  alt,
  className = "",
  fit = "cover",
  controls = true,
}: {
  dump: Pick<EventDump, "url" | "type" | "caption">;
  alt: string;
  className?: string;
  fit?: "cover" | "contain";
  controls?: boolean;
}) {
  const kind = resolveDumpType(dump);
  const objectClass = fit === "cover" ? "object-cover" : "object-contain";

  if (kind === "video") {
    return (
      <video
        src={dump.url}
        controls={controls}
        playsInline
        muted={!controls}
        preload="metadata"
        className={`h-full w-full bg-ink ${objectClass} ${className}`}
        aria-label={alt}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dump.url}
      alt={alt}
      className={`h-full w-full ${objectClass} ${className}`}
    />
  );
}
