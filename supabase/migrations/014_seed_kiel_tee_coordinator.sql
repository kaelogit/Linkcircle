-- Add Kiel Tee as Link Circle admin / coordinator
insert into public.coordinators (id, name, role, bio, quote, alias, is_founder, initials, accent, photo, sort_order)
values
  ('admin-kiel', 'Kiel Tee', 'Admin',
   'Link Circle admin helping members feel welcome, stay connected, and show up for community hangouts and programs along the Ajah → Eleko corridor.',
   'Community works when people show up for each other. Link Circle is that space — belonging, connection, and real-life support.',
   null, false, 'KT', '#2f5d50', null, 50)
on conflict (id) do update set
  name = excluded.name,
  role = excluded.role,
  bio = excluded.bio,
  quote = excluded.quote,
  alias = excluded.alias,
  is_founder = excluded.is_founder,
  initials = excluded.initials,
  accent = excluded.accent,
  photo = excluded.photo,
  sort_order = excluded.sort_order,
  updated_at = now();
