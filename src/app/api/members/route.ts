import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  createMember,
  deleteMember,
  readMembers,
  updateMember,
} from "@/lib/members";

export async function GET() {
  try {
    return NextResponse.json(await readMembers());
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load members";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const fullName = String(body.fullName ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const whatsapp = body.whatsapp ? String(body.whatsapp).trim() : undefined;
    const bio = body.bio ? String(body.bio).trim() : undefined;
    if (!fullName || !phone) {
      return NextResponse.json(
        { error: "fullName and phone are required" },
        { status: 400 },
      );
    }
    const member = await createMember({
      fullName,
      phone,
      whatsapp,
      bio,
      source: "manual",
    });
    return NextResponse.json(member, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create member";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || !body.id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 },
      );
    }
    const member = await updateMember(String(body.id), {
      fullName: body.fullName,
      phone: body.phone,
      whatsapp: body.whatsapp,
      bio: body.bio,
      photoUrl: body.photoUrl,
    });
    if (!member) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(member);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to update member";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    const ok = await deleteMember(id);
    if (!ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to delete member";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
