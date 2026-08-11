-- Event registrations (Paystack picnic / paid signups)
-- Run in Supabase SQL Editor after earlier migrations

create table if not exists public.event_registrations (
  id text primary key,
  event_id text not null references public.events (id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text not null,
  residence text not null default '',
  whatsapp text,
  bring_item text not null,
  amount_kobo integer not null default 500000,
  currency text not null default 'NGN',
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'abandoned')),
  paystack_reference text not null unique,
  participant_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists event_registrations_event_id_idx
  on public.event_registrations (event_id);

create index if not exists event_registrations_status_idx
  on public.event_registrations (event_id, status);

create index if not exists event_registrations_reference_idx
  on public.event_registrations (paystack_reference);

drop trigger if exists event_registrations_set_updated_at on public.event_registrations;
create trigger event_registrations_set_updated_at
  before update on public.event_registrations
  for each row
  execute function public.set_updated_at();

alter table public.event_registrations enable row level security;

comment on table public.event_registrations is 'Public event signups; paid via Paystack';
