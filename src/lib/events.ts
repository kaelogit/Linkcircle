import { randomBytes } from "crypto";
import type { EventDump, EventItem, EventStatus } from "./site";
import { slugify } from "./site";
import bundledEvents from "../../data/events.json";
import { readJsonFile, writeJsonFile } from "./json-store";
import { isSupabaseConfigured, getSupabaseAdmin } from "./supabase";
import {
  eventFromRow,
  eventToRow,
  type EventRow,
} from "./supabase-map";

const FILENAME = "events.json";

const SEED: EventItem[] = [
  {
    id: "evt_house_party_0725",
    slug: "house-party-july-25",
    title: "House Party",
    tagline: "One roof. Twenty-four hours. Zero boring moments.",
    description:
      "Link Circle’s flagship overnight: a full 24-hour house party for paid members only. Think music, late-night conversations, games, new faces turning into familiar ones, and the kind of energy you can’t get from a WhatsApp chat. Show up, plug in, and leave with stories.",
    startsAt: "2026-07-25T12:00:00+01:00",
    endsAt: "2026-07-26T12:00:00+01:00",
    locationPublic:
      "Ajah → Eleko (exact address shared with paid participants)",
    priceLabel: "Paid access only",
    capacity: 30,
    coverGradient:
      "linear-gradient(145deg, #0b1418 0%, #1a0a10 35%, #790720 78%, #a87a2a 100%)",
    status: "upcoming",
    whatsIncluded: [
      "Full 24-hour house party access",
      "Unique QR access pass + shareable link",
      "Door check-in welcome by name",
      "Music, games & real face-to-face vibes",
      "Private location drop after payment",
    ],
    dumps: [],
    createdAt: "2026-07-11T00:00:00.000Z",
    updatedAt: "2026-07-11T00:00:00.000Z",
  },
];

function fallbackEvents(): EventItem[] {
  const bundled = bundledEvents as EventItem[];
  if (Array.isArray(bundled) && bundled.length > 0) return bundled;
  return SEED;
}

async function readEventsLocal(): Promise<EventItem[]> {
  const fromDisk = await readJsonFile<EventItem[]>(FILENAME, fallbackEvents());
  return Array.isArray(fromDisk) && fromDisk.length > 0
    ? fromDisk
    : fallbackEvents();
}

async function writeEventsLocal(list: EventItem[]) {
  await writeJsonFile(FILENAME, list);
}

async function readEventsDb(): Promise<EventItem[]> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("events")
    .select("*")
    .order("starts_at", { ascending: false });
  if (error) throw new Error(`Failed to load events: ${error.message}`);
  return (data as EventRow[]).map(eventFromRow);
}

export async function readEvents(): Promise<EventItem[]> {
  if (isSupabaseConfigured()) return readEventsDb();
  return readEventsLocal();
}

export async function getEventById(id: string) {
  if (isSupabaseConfigured()) {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("events")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(`Failed to load event: ${error.message}`);
    return data ? eventFromRow(data as EventRow) : null;
  }
  const list = await readEventsLocal();
  return list.find((e) => e.id === id) ?? null;
}

export async function getEventBySlug(slug: string) {
  if (isSupabaseConfigured()) {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("events")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw new Error(`Failed to load event: ${error.message}`);
    return data ? eventFromRow(data as EventRow) : null;
  }
  const list = await readEventsLocal();
  return list.find((e) => e.slug === slug) ?? null;
}

export async function getUpcomingEvents() {
  const list = await readEvents();
  return list
    .filter((e) => e.status === "upcoming" || e.status === "live")
    .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));
}

export async function getPastEvents() {
  const list = await readEvents();
  return list
    .filter((e) => e.status === "ended" || e.dumps.length > 0)
    .sort((a, b) => +new Date(b.startsAt) - +new Date(a.startsAt));
}

export async function getAllDumps() {
  const list = await readEvents();
  return list
    .flatMap((event) =>
      event.dumps.map((dump) => ({
        ...dump,
        eventId: event.id,
        eventTitle: event.title,
        eventSlug: event.slug,
      })),
    )
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export type EventInput = {
  title: string;
  tagline?: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  locationPublic?: string;
  locationPrivate?: string;
  priceLabel?: string;
  capacity?: number;
  coverGradient?: string;
  status?: EventStatus;
  whatsIncluded?: string[];
  galleryNote?: string;
};

function uniqueSlug(base: string, existing: EventItem[], ignoreId?: string) {
  let slug = slugify(base) || `event-${Date.now()}`;
  let i = 2;
  while (existing.some((e) => e.slug === slug && e.id !== ignoreId)) {
    slug = `${slugify(base)}-${i}`;
    i += 1;
  }
  return slug;
}

export async function createEvent(input: EventInput) {
  const list = await readEvents();
  const now = new Date().toISOString();
  const status = input.status ?? "upcoming";
  const isPast = status === "ended";

  const event: EventItem = {
    id: `evt_${randomBytes(6).toString("hex")}`,
    slug: uniqueSlug(input.title, list),
    title: input.title.trim(),
    tagline: (input.tagline ?? "").trim(),
    description: (input.description ?? "").trim(),
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    locationPublic:
      input.locationPublic?.trim() ||
      (isPast
        ? "Ajah → Eleko"
        : "Ajah → Eleko (details shared with paid participants)"),
    locationPrivate: input.locationPrivate?.trim(),
    priceLabel:
      input.priceLabel?.trim() || (isPast ? "Past event" : "Paid access only"),
    capacity: input.capacity ?? (isPast ? 0 : 30),
    coverGradient:
      input.coverGradient ||
      "linear-gradient(135deg, #1a2c30 0%, #790720 48%, #d4a24a 100%)",
    status,
    whatsIncluded:
      input.whatsIncluded ??
      (isPast
        ? []
        : [
            "Event access",
            "Unique digital access pass (QR + link)",
            "Door check-in welcome",
          ]),
    galleryNote: input.galleryNote,
    dumps: [],
    createdAt: now,
    updatedAt: now,
  };

  if (isSupabaseConfigured()) {
    const sb = getSupabaseAdmin();
    const { error } = await sb.from("events").insert(eventToRow(event));
    if (error) throw new Error(`Failed to create event: ${error.message}`);
    return event;
  }

  list.unshift(event);
  await writeEventsLocal(list);
  return event;
}

export async function updateEvent(id: string, patch: Partial<EventInput>) {
  const current = await getEventById(id);
  if (!current) return null;
  const list = await readEvents();
  const nextTitle = patch.title?.trim() || current.title;
  const updated: EventItem = {
    ...current,
    title: nextTitle,
    tagline:
      patch.tagline !== undefined ? patch.tagline.trim() : current.tagline,
    description:
      patch.description !== undefined
        ? patch.description.trim()
        : current.description,
    startsAt: patch.startsAt ?? current.startsAt,
    endsAt: patch.endsAt ?? current.endsAt,
    locationPublic:
      patch.locationPublic !== undefined
        ? patch.locationPublic.trim()
        : current.locationPublic,
    locationPrivate:
      patch.locationPrivate !== undefined
        ? patch.locationPrivate.trim()
        : current.locationPrivate,
    priceLabel:
      patch.priceLabel !== undefined
        ? patch.priceLabel.trim()
        : current.priceLabel,
    capacity: patch.capacity ?? current.capacity,
    coverGradient: patch.coverGradient ?? current.coverGradient,
    status: patch.status ?? current.status,
    whatsIncluded: patch.whatsIncluded ?? current.whatsIncluded,
    galleryNote:
      patch.galleryNote !== undefined ? patch.galleryNote : current.galleryNote,
    slug:
      patch.title !== undefined
        ? uniqueSlug(nextTitle, list, id)
        : current.slug,
    updatedAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    const sb = getSupabaseAdmin();
    const row = eventToRow(updated);
    const { error } = await sb.from("events").update(row).eq("id", id);
    if (error) throw new Error(`Failed to update event: ${error.message}`);
    return updated;
  }

  const index = list.findIndex((e) => e.id === id);
  if (index === -1) return null;
  list[index] = updated;
  await writeEventsLocal(list);
  return updated;
}

export async function deleteEvent(id: string) {
  if (isSupabaseConfigured()) {
    const existing = await getEventById(id);
    if (!existing) return false;
    const sb = getSupabaseAdmin();
    const { error } = await sb.from("events").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete event: ${error.message}`);
    return true;
  }

  const list = await readEventsLocal();
  const next = list.filter((e) => e.id !== id);
  if (next.length === list.length) return false;
  await writeEventsLocal(next);
  return true;
}

export async function addDump(
  eventId: string,
  dump: Omit<EventDump, "id" | "createdAt"> & {
    id?: string;
    createdAt?: string;
  },
) {
  const current = await getEventById(eventId);
  if (!current) return null;
  const item: EventDump = {
    id: dump.id ?? `dump_${randomBytes(6).toString("hex")}`,
    url: dump.url,
    caption: dump.caption || "",
    type: dump.type ?? "image",
    createdAt: dump.createdAt ?? new Date().toISOString(),
  };
  const nextDumps = [item, ...current.dumps];
  const updatedAt = new Date().toISOString();

  if (isSupabaseConfigured()) {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("events")
      .update({ dumps: nextDumps, updated_at: updatedAt })
      .eq("id", eventId)
      .select("*")
      .single();
    if (error) throw new Error(`Failed to add dump: ${error.message}`);
    return { event: eventFromRow(data as EventRow), dump: item };
  }

  const list = await readEventsLocal();
  const index = list.findIndex((e) => e.id === eventId);
  if (index === -1) return null;
  list[index].dumps = nextDumps;
  list[index].updatedAt = updatedAt;
  await writeEventsLocal(list);
  return { event: list[index], dump: item };
}

export async function removeDump(eventId: string, dumpId: string) {
  const current = await getEventById(eventId);
  if (!current) return null;
  const nextDumps = current.dumps.filter((d) => d.id !== dumpId);
  const updatedAt = new Date().toISOString();

  if (isSupabaseConfigured()) {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("events")
      .update({ dumps: nextDumps, updated_at: updatedAt })
      .eq("id", eventId)
      .select("*")
      .single();
    if (error) throw new Error(`Failed to remove dump: ${error.message}`);
    return eventFromRow(data as EventRow);
  }

  const list = await readEventsLocal();
  const index = list.findIndex((e) => e.id === eventId);
  if (index === -1) return null;
  list[index].dumps = nextDumps;
  list[index].updatedAt = updatedAt;
  await writeEventsLocal(list);
  return list[index];
}
