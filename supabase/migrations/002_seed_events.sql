-- Seed events from data/events.json
-- Safe to re-run (upsert by id)

insert into public.events (
  id, slug, title, tagline, description,
  starts_at, ends_at, location_public, location_private,
  price_label, capacity, cover_gradient, cover_image, status,
  whats_included, gallery_note, dumps, created_at, updated_at
) values (
  'evt_93f9fc9cf212',
  'beach-hangout',
  'Beach Hangout',
  'Sun, sand, and chaos in the best way. Link Circle took over the beach.',
  'Our Beach Hangout was pure Link Circle energy from start to finish. We danced like the tide couldn’t catch us, played enough games to fill a whole season, laughed until our cheeks hurt, and turned strangers into friends before sunset. Music, competition, group vibes, random wholesome madness, the corridor showed up and the beach felt it. If you missed it, you missed a whole moment. If you were there… you already know.',
  '2026-06-28T14:00:00.000Z',
  '2026-06-28T20:00:00.000Z',
  'Ajah → Eleko',
  null,
  'Past event',
  16,
  'linear-gradient(135deg, #1a2c30 0%, #790720 48%, #d4a24a 100%)',
  null,
  'ended',
  '[]'::jsonb,
  null,
  '[{"id":"dump_da8d47e38712","url":"/uploads/dumps/1783806994847_837094f1.jpeg","caption":"WhatsApp Image 2026-07-11 at 10.04.22 PM.jpeg","type":"image","createdAt":"2026-07-11T21:56:34.870Z"},{"id":"dump_f32a3dcceb89","url":"/uploads/dumps/1783806994810_28972cdd.jpeg","caption":"WhatsApp Image 2026-07-11 at 10.04.22 PM (1).jpeg","type":"image","createdAt":"2026-07-11T21:56:34.838Z"},{"id":"dump_d6e947e659c7","url":"/uploads/dumps/1783806994772_5e07c5ed.jpeg","caption":"WhatsApp Image 2026-07-11 at 10.04.21 PM.jpeg","type":"image","createdAt":"2026-07-11T21:56:34.796Z"},{"id":"dump_ad3e2c0565ca","url":"/uploads/dumps/1783806994744_a71f5e5b.jpeg","caption":"WhatsApp Image 2026-07-11 at 10.04.21 PM (1).jpeg","type":"image","createdAt":"2026-07-11T21:56:34.762Z"},{"id":"dump_cd889538ec4f","url":"/uploads/dumps/1783806994708_d7dd6491.jpeg","caption":"WhatsApp Image 2026-07-11 at 10.04.21 PM (2).jpeg","type":"image","createdAt":"2026-07-11T21:56:34.736Z"},{"id":"dump_77bafeea3697","url":"/uploads/dumps/1783806994632_02883318.jpeg","caption":"WhatsApp Image 2026-07-11 at 10.04.20 PM.jpeg","type":"image","createdAt":"2026-07-11T21:56:34.691Z"},{"id":"dump_95ccc7169f84","url":"/uploads/dumps/1783806994551_49338396.jpeg","caption":"WhatsApp Image 2026-07-11 at 10.04.20 PM (1).jpeg","type":"image","createdAt":"2026-07-11T21:56:34.592Z"},{"id":"dump_b544a3c0525f","url":"/uploads/dumps/1783806994507_5a129555.jpeg","caption":"WhatsApp Image 2026-07-11 at 10.04.19 PM.jpeg","type":"image","createdAt":"2026-07-11T21:56:34.530Z"},{"id":"dump_c5b770d6db46","url":"/uploads/dumps/1783806994462_1ba73e9d.jpeg","caption":"WhatsApp Image 2026-07-11 at 10.04.19 PM (1).jpeg","type":"image","createdAt":"2026-07-11T21:56:34.492Z"},{"id":"dump_8a5c2a533cb4","url":"/uploads/dumps/1783806994413_0fddb927.jpeg","caption":"WhatsApp Image 2026-07-11 at 10.04.18 PM.jpeg","type":"image","createdAt":"2026-07-11T21:56:34.448Z"},{"id":"dump_8541e0af36df","url":"/uploads/dumps/1783806993939_6a674ce4.jpeg","caption":"WhatsApp Image 2026-07-11 at 10.04.18 PM (1).jpeg","type":"image","createdAt":"2026-07-11T21:56:33.955Z"},{"id":"dump_a18181a7aa82","url":"/uploads/dumps/1783806993905_139ef1dd.jpeg","caption":"WhatsApp Image 2026-07-11 at 10.04.17 PM.jpeg","type":"image","createdAt":"2026-07-11T21:56:33.929Z"},{"id":"dump_a766e27ef00e","url":"/uploads/dumps/1783806993878_6c12bd6c.jpeg","caption":"WhatsApp Image 2026-07-11 at 10.04.15 PM.jpeg","type":"image","createdAt":"2026-07-11T21:56:33.895Z"},{"id":"dump_964f85091f81","url":"/uploads/dumps/1783806993857_691b0057.jpeg","caption":"WhatsApp Image 2026-07-11 at 9.58.32 PM.jpeg","type":"image","createdAt":"2026-07-11T21:56:33.871Z"},{"id":"dump_448525f78462","url":"/uploads/dumps/1783806993841_cbd19fc5.jpeg","caption":"WhatsApp Image 2026-07-11 at 9.58.32 PM (1).jpeg","type":"image","createdAt":"2026-07-11T21:56:33.853Z"},{"id":"dump_067860809de1","url":"/uploads/dumps/1783806942215_2e6a1425.jpeg","caption":"","type":"image","createdAt":"2026-07-11T21:55:42.245Z"}]'::jsonb,
  '2026-07-11T18:37:45.469Z',
  '2026-07-11T21:57:45.492Z'
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

insert into public.events (
  id, slug, title, tagline, description,
  starts_at, ends_at, location_public, location_private,
  price_label, capacity, cover_gradient, cover_image, status,
  whats_included, gallery_note, dumps, created_at, updated_at
) values (
  'evt_house_party_0725',
  'house-party-july-25',
  'House Party',
  'One roof. Twenty-four hours. Zero boring moments.',
  'Link Circle’s flagship overnight: a full 24-hour house party for paid members only. Think music, late-night conversations, games, new faces turning into familiar ones, and the kind of energy you can’t get from a WhatsApp chat. Show up, plug in, and leave with stories.',
  '2026-07-25T12:00:00+01:00',
  '2026-07-26T12:00:00+01:00',
  'Ajah → Eleko (exact address shared with paid participants)',
  null,
  'Paid access only',
  30,
  'linear-gradient(145deg, #0b1418 0%, #1a0a10 35%, #790720 78%, #a87a2a 100%)',
  null,
  'upcoming',
  '["Full 24-hour house party access","Unique QR access pass + shareable link","Door check-in welcome by name","Music, games & real face-to-face vibes","Private location drop after payment"]'::jsonb,
  null,
  '[]'::jsonb,
  '2026-07-11T00:00:00.000Z',
  '2026-07-11T00:00:00.000Z'
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

