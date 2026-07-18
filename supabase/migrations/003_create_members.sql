-- Link Circle members directory
-- Run after 001 + 002 in Supabase SQL Editor

create table if not exists public.members (
  id text primary key,
  full_name text not null,
  phone text not null,
  phone_key text not null unique,
  whatsapp text,
  photo_url text,
  bio text not null default '',
  source text not null default 'manual'
    check (source in ('manual', 'event')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists members_full_name_idx
  on public.members (full_name);
create index if not exists members_phone_key_idx
  on public.members (phone_key);

drop trigger if exists members_set_updated_at on public.members;
create trigger members_set_updated_at
  before update on public.members
  for each row
  execute function public.set_updated_at();

alter table public.members enable row level security;

comment on table public.members is 'LC directory of all community members';
comment on column public.members.phone_key is 'Digits-only phone used for dedupe';
comment on column public.members.whatsapp is 'WhatsApp username, not phone';

-- ---------------------------------------------------------------------------
-- Storage bucket for member photos (public read)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'member-photos',
  'member-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read member photos" on storage.objects;
create policy "Public read member photos"
  on storage.objects
  for select
  to public
  using (bucket_id = 'member-photos');
