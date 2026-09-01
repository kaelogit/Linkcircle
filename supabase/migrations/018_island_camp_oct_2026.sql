-- LC Island Camp (Tarkwa Bay, 3–4 Oct 2026) + registration fields for gender / community verify

alter table public.event_registrations
  add column if not exists gender text check (gender in ('male', 'female')),
  add column if not exists community_identity text,
  add column if not exists waiver_accepted boolean not null default false;

alter table public.event_registrations
  alter column bring_item drop not null;

insert into public.events (
  id, slug, title, tagline, description,
  starts_at, ends_at, location_public, price_label, capacity,
  cover_gradient, cover_image, status, whats_included, gallery_note
) values (
  'evt_island_camp_1003',
  'lc-island-camp-oct-3',
  'LC Island Camp',
  'Boat in. Camp out. Bonfire under the stars at Tarkwa Bay.',
  $desc$Link Circle is taking the circle offshore.

Saturday 3 October into Sunday 4 October, we camp at Tarkwa Bay — a sheltered island beach in Lagos you reach only by boat. No city noise. Calm water. One big cabana for the whole circle. Tents for two. Drinks flowing. Bonfire dancing into the night.

This is LC Island Camp: overnight energy, real connection, and content you will want to post. Our Networking Picnic set the bar — this one goes higher.

₦23,000 per slot covers your tent space, cabana access, drinks (soft drinks, water, juice, alcohol and red wine), and the bonfire. Food and transport are on you. Only 30 slots — 15 male, 15 female. Link Circle community members only. Registration closes 24 September or when we fill up.

Meet at the jetty by 1:00pm. Camp starts 2:00pm. Last boat crossing around 5:00pm. Jetty details shared in WhatsApp after you pay.$desc$,
  '2026-10-03T14:00:00+01:00',
  '2026-10-04T11:00:00+01:00',
  'Tarkwa Bay Beach Camp (boat access only)',
  '₦23,000 per slot',
  30,
  'linear-gradient(145deg, #0a1628 0%, #1a3a5c 28%, #0d4d4a 55%, #790720 82%, #d4a24a 100%)',
  null,
  'upcoming',
  '["Overnight camp at Tarkwa Bay Beach Camp","Tent space (2 per tent)","Shared cabana for activities & hangout","Drinks: soft drinks, water, juice, alcohol & red wine","Bonfire & night vibes","30 slots · 15 male / 15 female · community only","₦23,000 · food & transport not included"]'::jsonb,
  'Register online · closes 24 September · Link Circle community only.'
)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  tagline = excluded.tagline,
  description = excluded.description,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  location_public = excluded.location_public,
  price_label = excluded.price_label,
  capacity = excluded.capacity,
  cover_gradient = excluded.cover_gradient,
  cover_image = excluded.cover_image,
  status = excluded.status,
  whats_included = excluded.whats_included,
  gallery_note = excluded.gallery_note,
  updated_at = now();
