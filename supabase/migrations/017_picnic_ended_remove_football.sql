-- Networking Picnic is over; remove Mixed Football from the site entirely.

update public.events
set
  status = 'ended',
  updated_at = now()
where id = 'evt_networking_picnic_0829';

delete from public.events
where id = 'evt_mixed_football_0830';
