-- Point Networking Picnic at the new banner artwork

update public.events
set
  cover_image = '/events/networking-picnic-aug-29.png',
  updated_at = now()
where id = 'evt_networking_picnic_0829';
