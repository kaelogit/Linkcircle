import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { createDumpUploadUrl } from "@/lib/dump-storage";
import { getEventById } from "@/lib/events";

type Ctx = { params: Promise<{ id: string }> };

/** Create a signed upload URL so the browser can PUT large videos directly to Storage. */
export async function POST(request: Request, context: Ctx) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const event = await getEventById(id);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const filename = String(body.filename ?? "").trim();
    const contentType = String(body.contentType ?? "").trim();
    const size =
      typeof body.size === "number" ? body.size : Number(body.size) || undefined;

    if (!filename) {
      return NextResponse.json(
        { error: "filename is required" },
        { status: 400 },
      );
    }

    const upload = await createDumpUploadUrl(id, {
      filename,
      contentType,
      size,
    });

    return NextResponse.json(upload);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not prepare upload";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
