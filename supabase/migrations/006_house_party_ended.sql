-- Mark House Party hangout as past (run in Supabase SQL Editor if already seeded)

update public.events
set
  status = 'ended',
  updated_at = now()
where id = 'evt_house_party_0725';
