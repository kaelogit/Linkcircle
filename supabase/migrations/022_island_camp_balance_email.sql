-- Track last balance reminder email per registration

alter table public.event_registrations
  add column if not exists balance_reminder_sent_at timestamptz;
