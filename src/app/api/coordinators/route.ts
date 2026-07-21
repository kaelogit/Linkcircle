import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  createCoordinator,
  deleteCoordinator,
  readCoordinators,
  updateCoordinator,
} from "@/lib/coordinators";

export async function GET() {
  try {
    return NextResponse.json(await readCoordinators());
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load coordinators";
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
    const name = String(body.name ?? "").trim();
    const role = String(body.role ?? "").trim();
    if (!name || !role) {
      return NextResponse.json(
        { error: "name and role are required" },
        { status: 400 },
      );
    }
    const coord = await createCoordinator({
      name,
      role,
      bio: body.bio ? String(body.bio).trim() : undefined,
      quote: body.quote ? String(body.quote).trim() : undefined,
      alias: body.alias ? String(body.alias).trim() : undefined,
      isFounder: body.isFounder === true,
      initials: body.initials ? String(body.initials) : undefined,
      accent: body.accent ? String(body.accent) : undefined,
      sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : undefined,
    });
    return NextResponse.json(coord, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create coordinator";
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
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    const coord = await updateCoordinator(String(body.id), {
      name: body.name !== undefined ? String(body.name) : undefined,
      role: body.role !== undefined ? String(body.role) : undefined,
      bio: body.bio !== undefined ? String(body.bio) : undefined,
      quote: body.quote !== undefined ? String(body.quote) : undefined,
      alias: body.alias !== undefined ? String(body.alias) : undefined,
      isFounder: body.isFounder !== undefined ? body.isFounder === true : undefined,
      initials: body.initials !== undefined ? String(body.initials) : undefined,
      accent: body.accent !== undefined ? String(body.accent) : undefined,
      photo: body.photo,
      sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : undefined,
    });
    if (!coord) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(coord);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to update coordinator";
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
    const ok = await deleteCoordinator(id);
    if (!ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to delete coordinator";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
