import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { addDump, removeDump } from "@/lib/events";
import {
  createDumpUploadUrl,
  mediaKindFromName,
  MAX_DUMP_BYTES,
  uploadDumpBytes,
} from "@/lib/dump-storage";
import { isSupabaseConfigured } from "@/lib/supabase";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const contentType = request.headers.get("content-type") || "";

  // JSON: register a dump after client uploaded via signed URL
  if (contentType.includes("application/json")) {
    try {
      const body = await request.json();
      const url = String(body.url ?? "").trim();
      const type =
        body.type === "video" || body.type === "image" ? body.type : undefined;
      const caption = String(body.caption ?? "");
      if (!url) {
        return NextResponse.json({ error: "url is required" }, { status: 400 });
      }
      const kind =
        type ??
        mediaKindFromName(url, "") ??
        ("image" as const);
      const result = await addDump(id, {
        url,
        caption,
        type: kind,
      });
      if (!result) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }
      return NextResponse.json(
        { event: result.event, dumps: [result.dump] },
        { status: 201 },
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // Multipart: upload file(s) server-side (Supabase Storage, or local disk)
  try {
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

    for (const file of files) {
      if (file.size > MAX_DUMP_BYTES) {
        return NextResponse.json(
          {
            error: `${file.name} is too large (max 100 MB). Compress videos first.`,
          },
          { status: 400 },
        );
      }
    }

    const uploaded = [];
    let event = null;

    for (const file of files) {
      const kind = mediaKindFromName(file.name, file.type);
      if (!kind) {
        return NextResponse.json(
          {
            error: `Unsupported file: ${file.name}. Use images (jpg/png/webp) or videos (mp4/webm/mov).`,
          },
          { status: 400 },
        );
      }

      let url: string;

      if (isSupabaseConfigured()) {
        const bytes = Buffer.from(await file.arrayBuffer());
        const stored = await uploadDumpBytes(id, {
          name: file.name,
          type: file.type,
          bytes,
        });
        if (!stored) {
          return NextResponse.json(
            { error: "Upload to storage failed" },
            { status: 500 },
          );
        }
        url = stored.publicUrl;
      } else {
        const dir = path.join(process.cwd(), "public", "uploads", "dumps");
        await fs.mkdir(dir, { recursive: true });
        const ext =
          path.extname(file.name) || (kind === "video" ? ".mp4" : ".jpg");
        const filename = `${Date.now()}_${randomBytes(4).toString("hex")}${ext}`;
        const bytes = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(path.join(dir, filename), bytes);
        url = `/uploads/dumps/${filename}`;
      }

      const result = await addDump(id, {
        url,
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
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
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
