-- Link Circle: core tables for durable events + participants on Supabase
-- Run in Supabase SQL Editor (Dashboard → SQL → New query)

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id text primary key,
  slug text not null unique,
  title text not null,
  tagline text not null default '',
  description text not null default '',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location_public text not null default '',
  location_private text,
  price_label text not null default 'Paid access only',
  capacity integer not null default 30,
  cover_gradient text not null default '',
  cover_image text,
  status text not null default 'upcoming'
    check (status in ('draft', 'upcoming', 'live', 'ended')),
  whats_included jsonb not null default '[]'::jsonb,
  gallery_note text,
  dumps jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_status_idx on public.events (status);
create index if not exists events_starts_at_idx on public.events (starts_at);

-- ---------------------------------------------------------------------------
-- participants
-- ---------------------------------------------------------------------------
create table if not exists public.participants (
  id text primary key,
  event_id text not null references public.events (id) on delete cascade,
  full_name text not null,
  phone text not null,
  whatsapp text,
  payment_status text not null default 'paid'
    check (payment_status in ('unpaid', 'paid', 'refunded', 'complimentary')),
  pass_token text not null unique,
  checked_in_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists participants_event_id_idx
  on public.participants (event_id);
create index if not exists participants_pass_token_idx
  on public.participants (pass_token);

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
  before update on public.events
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS: service role bypasses RLS; lock down anon/authenticated by default
-- ---------------------------------------------------------------------------
alter table public.events enable row level security;
alter table public.participants enable row level security;

-- No public policies: all access goes through Next.js with service role key.
-- (Marketing site reads events server-side via service role.)

comment on table public.events is 'Link Circle events + dump gallery metadata';
comment on table public.participants is 'Paid participants and single-use pass tokens';
