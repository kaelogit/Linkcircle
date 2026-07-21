-- Link Circle coordinators (People page)
-- Run after 001-003 in Supabase SQL Editor

create table if not exists public.coordinators (
  id text primary key,
  name text not null,
  role text not null,
  bio text not null default '',
  quote text,
  alias text,
  is_founder boolean not null default false,
  initials text not null default '',
  accent text not null default '#790720',
  photo text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coordinators_sort_idx
  on public.coordinators (sort_order, name);

drop trigger if exists coordinators_set_updated_at on public.coordinators;
create trigger coordinators_set_updated_at
  before update on public.coordinators
  for each row
  execute function public.set_updated_at();

alter table public.coordinators enable row level security;

comment on table public.coordinators is 'Founder + admin team for the People page';
