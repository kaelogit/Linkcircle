import { readJsonFile, writeJsonFile } from "./json-store";
import { isSupabaseConfigured, getSupabaseAdmin } from "./supabase";
import type { Coordinator } from "./site";
import { COORDINATORS as SEED } from "./site";

const FILENAME = "coordinators.json";

export type CoordinatorRow = {
  id: string;
  name: string;
  role: string;
  bio: string;
  quote: string | null;
  alias: string | null;
  is_founder: boolean;
  initials: string;
  accent: string;
  photo: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

function fromRow(row: CoordinatorRow): Coordinator & { sortOrder: number } {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    bio: row.bio,
    quote: row.quote ?? undefined,
    alias: row.alias ?? undefined,
    isFounder: row.is_founder,
    initials: row.initials,
    accent: row.accent,
    photo: row.photo ?? undefined,
    sortOrder: row.sort_order,
  };
}

function toRow(c: Coordinator & { sortOrder?: number }): Omit<CoordinatorRow, "created_at" | "updated_at"> {
  return {
    id: c.id,
    name: c.name,
    role: c.role,
    bio: c.bio,
    quote: c.quote ?? null,
    alias: c.alias ?? null,
    is_founder: c.isFounder,
    initials: c.initials,
    accent: c.accent,
    photo: c.photo ?? null,
    sort_order: c.sortOrder ?? 100,
  };
}

async function readLocal(): Promise<Coordinator[]> {
  const list = await readJsonFile<Coordinator[] | null>(FILENAME, null as unknown as Coordinator[]);
  return list && list.length > 0 ? list : SEED;
}

async function writeLocal(list: Coordinator[]) {
  await writeJsonFile(FILENAME, list);
}

export async function readCoordinators(): Promise<Coordinator[]> {
  if (isSupabaseConfigured()) {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("coordinators")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(`Failed to load coordinators: ${error.message}`);
    return (data as CoordinatorRow[]).map(fromRow);
  }
  return readLocal();
}

export async function getCoordinatorById(id: string) {
  if (isSupabaseConfigured()) {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("coordinators")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? fromRow(data as CoordinatorRow) : null;
  }
  const list = await readLocal();
  return list.find((c) => c.id === id) ?? null;
}

export type CoordinatorInput = {
  name: string;
  role: string;
  bio?: string;
  quote?: string;
  alias?: string;
  isFounder?: boolean;
  initials?: string;
  accent?: string;
  photo?: string;
  sortOrder?: number;
};

export async function createCoordinator(input: CoordinatorInput) {
  const id = input.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const initials =
    input.initials ||
    input.name
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const coord: Coordinator & { sortOrder: number } = {
    id,
    name: input.name.trim(),
    role: input.role.trim(),
    bio: (input.bio ?? "").trim(),
    quote: input.quote?.trim() || undefined,
    alias: input.alias?.trim() || undefined,
    isFounder: input.isFounder ?? false,
    initials,
    accent: input.accent ?? "#790720",
    photo: input.photo,
    sortOrder: input.sortOrder ?? 100,
  };

  if (isSupabaseConfigured()) {
    const sb = getSupabaseAdmin();
    const { error } = await sb.from("coordinators").insert(toRow(coord));
    if (error) throw new Error(`Failed to create coordinator: ${error.message}`);
    return coord;
  }

  const list = await readLocal();
  list.push(coord);
  await writeLocal(list);
  return coord;
}

export async function updateCoordinator(
  id: string,
  patch: Partial<CoordinatorInput> & { photo?: string | null },
) {
  const current = await getCoordinatorById(id);
  if (!current) return null;

  const updated: Coordinator & { sortOrder: number } = {
    ...current,
    name: patch.name?.trim() ?? current.name,
    role: patch.role?.trim() ?? current.role,
    bio: patch.bio !== undefined ? patch.bio.trim() : current.bio,
    quote:
      patch.quote !== undefined
        ? patch.quote?.trim() || undefined
        : current.quote,
    alias:
      patch.alias !== undefined
        ? patch.alias?.trim() || undefined
        : current.alias,
    isFounder: patch.isFounder ?? current.isFounder,
    initials: patch.initials ?? current.initials,
    accent: patch.accent ?? current.accent,
    photo:
      patch.photo === null
        ? undefined
        : patch.photo !== undefined
          ? patch.photo
          : current.photo,
    sortOrder: patch.sortOrder ?? (current as any).sortOrder ?? 100,
  };

  if (isSupabaseConfigured()) {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("coordinators")
      .update(toRow(updated))
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(`Failed to update coordinator: ${error.message}`);
    return fromRow(data as CoordinatorRow);
  }

  const list = await readLocal();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  list[idx] = updated;
  await writeLocal(list);
  return updated;
}

export async function deleteCoordinator(id: string) {
  if (isSupabaseConfigured()) {
    const existing = await getCoordinatorById(id);
    if (!existing) return false;
    const sb = getSupabaseAdmin();
    const { error } = await sb.from("coordinators").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete coordinator: ${error.message}`);
    return true;
  }
  const list = await readLocal();
  const next = list.filter((c) => c.id !== id);
  if (next.length === list.length) return false;
  await writeLocal(next);
  return true;
}

export async function uploadCoordinatorPhoto(coordId: string, file: File) {
  const coord = await getCoordinatorById(coordId);
  if (!coord) throw new Error("Coordinator not found");

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `${coordId}_${Date.now()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  if (isSupabaseConfigured()) {
    const sb = getSupabaseAdmin();
    const objectPath = `coordinators/${filename}`;
    const { error } = await sb.storage
      .from("member-photos")
      .upload(objectPath, bytes, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });
    if (error) throw new Error(`Photo upload failed: ${error.message}`);
    const { data } = sb.storage.from("member-photos").getPublicUrl(objectPath);
    return updateCoordinator(coordId, { photo: data.publicUrl });
  }

  throw new Error("Photo uploads require Supabase Storage.");
}
