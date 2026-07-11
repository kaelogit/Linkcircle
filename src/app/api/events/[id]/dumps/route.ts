import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { addDump, removeDump } from "@/lib/events";

type Ctx = { params: Promise<{ id: string }> };

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

function mediaKind(file: File): "image" | "video" | null {
  const ext = path.extname(file.name).toLowerCase();
  if (file.type.startsWith("video/") || VIDEO_EXT.has(ext)) return "video";
  if (file.type.startsWith("image/") || IMAGE_EXT.has(ext)) return "image";
  return null;
}

export async function POST(request: Request, context: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const form = await request.formData();
  const caption = String(form.get("caption") ?? "");

  const files = form
    .getAll("file")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) {
    return NextResponse.json(
      { error: "At least one photo or video is required" },
      { status: 400 },
    );
  }

  const dir = path.join(process.cwd(), "public", "uploads", "dumps");
  await fs.mkdir(dir, { recursive: true });

  const uploaded = [];
  let event = null;

  for (const file of files) {
    const kind = mediaKind(file);
    if (!kind) {
      return NextResponse.json(
        {
          error: `Unsupported file: ${file.name}. Use images (jpg/png/webp) or videos (mp4/webm/mov).`,
        },
        { status: 400 },
      );
    }

    const ext = path.extname(file.name) || (kind === "video" ? ".mp4" : ".jpg");
    const filename = `${Date.now()}_${randomBytes(4).toString("hex")}${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(dir, filename), bytes);

    const result = await addDump(id, {
      url: `/uploads/dumps/${filename}`,
      caption: files.length === 1 ? caption : caption || file.name,
      type: kind,
    });

    if (!result) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    uploaded.push(result.dump);
    event = result.event;
  }

  return NextResponse.json({ event, dumps: uploaded }, { status: 201 });
}

export async function DELETE(request: Request, context: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const dumpId = searchParams.get("dumpId");
  if (!dumpId) {
    return NextResponse.json({ error: "dumpId required" }, { status: 400 });
  }
  const event = await removeDump(id, dumpId);
  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(event);
}
