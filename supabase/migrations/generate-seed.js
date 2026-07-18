const fs = require("fs");
const path = require("path");

const events = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../../data/events.json"), "utf8"),
);

function esc(s) {
  return String(s ?? "").replace(/'/g, "''");
}

function lit(v) {
  if (v === null || v === undefined) return "null";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "object") {
    return `'${esc(JSON.stringify(v))}'::jsonb`;
  }
  return `'${esc(v)}'`;
}

let out =
  "-- Seed events from data/events.json\n-- Safe to re-run (upsert by id)\n\n";

for (const e of events) {
  out += `insert into public.events (
  id, slug, title, tagline, description,
  starts_at, ends_at, location_public, location_private,
  price_label, capacity, cover_gradient, cover_image, status,
  whats_included, gallery_note, dumps, created_at, updated_at
) values (
  ${lit(e.id)},
  ${lit(e.slug)},
  ${lit(e.title)},
  ${lit(e.tagline)},
  ${lit(e.description)},
  ${lit(e.startsAt)},
  ${lit(e.endsAt)},
  ${lit(e.locationPublic)},
  ${lit(e.locationPrivate ?? null)},
  ${lit(e.priceLabel)},
  ${lit(e.capacity)},
  ${lit(e.coverGradient)},
  ${lit(e.coverImage ?? null)},
  ${lit(e.status)},
  ${lit(e.whatsIncluded ?? [])},
  ${lit(e.galleryNote ?? null)},
  ${lit(e.dumps ?? [])},
  ${lit(e.createdAt)},
  ${lit(e.updatedAt)}
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  tagline = excluded.tagline,
  description = excluded.description,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  location_public = excluded.location_public,
  location_private = excluded.location_private,
  price_label = excluded.price_label,
  capacity = excluded.capacity,
  cover_gradient = excluded.cover_gradient,
  cover_image = excluded.cover_image,
  status = excluded.status,
  whats_included = excluded.whats_included,
  gallery_note = excluded.gallery_note,
  dumps = excluded.dumps,
  updated_at = excluded.updated_at;

`;
}

const outPath = path.join(__dirname, "002_seed_events.sql");
fs.writeFileSync(outPath, out);
console.log(`wrote ${outPath} (${events.length} events)`);
