-- LC Island Camp: 50% deposit + balance before registration close

alter table public.event_registrations
  drop constraint if exists event_registrations_status_check;

alter table public.event_registrations
  add constraint event_registrations_status_check
  check (status in ('pending', 'paid', 'failed', 'abandoned', 'deposit_paid'));

alter table public.event_registrations
  add column if not exists payment_plan text not null default 'full'
    check (payment_plan in ('full', 'deposit')),
  add column if not exists amount_paid_kobo integer not null default 0,
  add column if not exists balance_due_kobo integer not null default 0,
  add column if not exists balance_reference text;

create index if not exists event_registrations_balance_reference_idx
  on public.event_registrations (balance_reference)
  where balance_reference is not null;
