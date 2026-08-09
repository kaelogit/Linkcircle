-- Event dump media (photos + videos) — public bucket
-- Run in Supabase SQL Editor after earlier migrations

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'event-dumps',
  'event-dumps',
  true,
  104857600, -- 100 MB (compress long videos before upload)
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/avif',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-m4v',
    'video/ogg'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read event dumps" on storage.objects;
create policy "Public read event dumps"
  on storage.objects
  for select
  to public
  using (bucket_id = 'event-dumps');

-- Uploads go through Next.js with the service role key (bypasses RLS).
-- No public insert policy on purpose.
