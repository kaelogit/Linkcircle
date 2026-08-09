-- Link Circle weekend events (29–30 Aug 2026)
-- Run in Supabase SQL Editor. Safe to re-run (upsert).

insert into public.events (
  id, slug, title, tagline, description,
  starts_at, ends_at, location_public, location_private,
  price_label, capacity, cover_gradient, cover_image, status,
  whats_included, gallery_note, dumps, created_at, updated_at
) values
(
  'evt_networking_picnic_0829',
  'networking-picnic-aug-29',
  'Networking Picnic',
  'Conversations under the open sky. EQ that changes how you connect.',
  $picnic$Saturday, 29th August is for the people who want more than small talk. Link Circle is hosting a Networking Picnic — an outdoor afternoon built for meaningful conversations, new faces, and real relationships along the Ajah → Eleko corridor.

At the heart of the day: a guest session with Adetoun Irukera (Mrs) on Emotional Intelligence (EQ): A Key Ingredient to Successful Relationships. Expect practical insights you can use immediately — how you listen, how you show up, and how you build trust with people who matter.

Come ready to meet new people, exchange ideas, and grow together. Soft energy. Strong connections. One amazing community.$picnic$,
  '2026-08-29T10:00:00+01:00',
  '2026-08-29T17:00:00+01:00',
  'Ajah → Eleko (exact picnic spot shared by admins)',
  null,
  'Details & registration via admins',
  40,
  'linear-gradient(145deg, #1a2e24 0%, #2d4a3a 28%, #790720 72%, #d4a24a 100%)',
  '/events/weekend-aug-2026.png',
  'upcoming',
  '["Outdoor networking picnic with Link Circle members","Guest speaker session with Adetoun Irukera (Mrs)","Theme deep-dive: Emotional Intelligence (EQ) for stronger relationships","Space to meet new people, exchange ideas & grow together","Registration & venue details shared by admins"]'::jsonb,
  'Two days. Two experiences. One community — then Sunday’s Mixed Football Games.',
  '[]'::jsonb,
  now(),
  now()
),
(
  'evt_mixed_football_0830',
  'mixed-football-aug-30',
  'Mixed Football Games',
  'Males & females. One pitch. Who sabi play ball pass?',
  $football$Sunday, 30th August is pure Link Circle energy on the grass. Mixed Football Games — males and females mixed in teams — built for competition, connection, banter, and good vibes.

All skill levels welcome. Whether you came to score, assist, or just enjoy the chaos, show up ready to play. Teamwork. Respect. Fun. Come prove yourself, laugh hard, and leave knowing the circle a little better.

This is Day Two of the weekend: after Saturday’s Networking Picnic, we close it out with boots on, hearts open, and rivalries friendly. Network. Grow. Belong — then go again on Sunday.$football$,
  '2026-08-30T15:00:00+01:00',
  '2026-08-30T19:00:00+01:00',
  'Ajah → Eleko (pitch details from admins)',
  null,
  'Details & registration via admins',
  40,
  'linear-gradient(145deg, #0b1418 0%, #0e2a1a 35%, #1a4d2e 65%, #790720 100%)',
  null,
  'upcoming',
  '["Mixed teams — males & females together","Competitive games with room for every skill level","Banter, good vibes & real-life connection","Teamwork, respect, and pure Sunday football energy","Pitch & kickoff details shared by admins"]'::jsonb,
  'Part of the Link Circle weekend — Saturday picnic, Sunday football.',
  '[]'::jsonb,
  now(),
  now()
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
  updated_at = now();
