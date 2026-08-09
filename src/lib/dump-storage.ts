import path from "path";
import { randomBytes } from "crypto";
import { isSupabaseConfigured, getSupabaseAdmin } from "./supabase";

export const DUMP_BUCKET = "event-dumps";
export const MAX_DUMP_BYTES = 100 * 1024 * 1024; // 100 MB

const IMAGE_EXT = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".avif",
  ".heic",
]);
const VIDEO_EXT = new Set([".mp4", ".webm", ".mov", ".m4v", ".ogg"]);

export function mediaKindFromName(
  filename: string,
  mime = "",
): "image" | "video" | null {
  const ext = path.extname(filename).toLowerCase();
  if (mime.startsWith("video/") || VIDEO_EXT.has(ext)) return "video";
  if (mime.startsWith("image/") || IMAGE_EXT.has(ext)) return "image";
  return null;
}

export function dumpObjectPath(eventId: string, filename: string) {
  const ext = path.extname(filename) || ".bin";
  const safeExt = ext.toLowerCase().slice(0, 8);
  return `${eventId}/${Date.now()}_${randomBytes(4).toString("hex")}${safeExt}`;
}

export async function createDumpUploadUrl(eventId: string, file: {
  filename: string;
  contentType: string;
  size?: number;
}) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase Storage is required for dump uploads on this host.");
  }
  if (file.size != null && file.size > MAX_DUMP_BYTES) {
    throw new Error("File is too large. Max size is 100 MB — compress videos first.");
  }

  const kind = mediaKindFromName(file.filename, file.contentType);
  if (!kind) {
    throw new Error(
      "Unsupported file. Use images (jpg/png/webp) or videos (mp4/webm/mov).",
    );
  }

  const objectPath = dumpObjectPath(eventId, file.filename);
  const sb = getSupabaseAdmin();
  const { data, error } = await sb.storage
    .from(DUMP_BUCKET)
    .createSignedUploadUrl(objectPath);

  if (error || !data) {
    throw new Error(error?.message || "Could not create upload URL");
  }

  const { data: pub } = sb.storage.from(DUMP_BUCKET).getPublicUrl(objectPath);

  return {
    signedUrl: data.signedUrl,
    token: data.token,
    path: objectPath,
    publicUrl: pub.publicUrl,
    type: kind as "image" | "video",
  };
}

export async function uploadDumpBytes(
  eventId: string,
  file: { name: string; type: string; bytes: Buffer },
) {
  if (!isSupabaseConfigured()) return null;

  const kind = mediaKindFromName(file.name, file.type);
  if (!kind) return null;

  const objectPath = dumpObjectPath(eventId, file.name);
  const sb = getSupabaseAdmin();
  const { error } = await sb.storage.from(DUMP_BUCKET).upload(objectPath, file.bytes, {
    contentType: file.type || (kind === "video" ? "video/mp4" : "image/jpeg"),
    upsert: true,
  });
  if (error) throw new Error(`Dump upload failed: ${error.message}`);

  const { data } = sb.storage.from(DUMP_BUCKET).getPublicUrl(objectPath);
  return { publicUrl: data.publicUrl, type: kind as "image" | "video" };
}
