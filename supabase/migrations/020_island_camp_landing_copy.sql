-- LC Island Camp premium landing copy refresh

update public.events
set
  tagline = 'One Night. One Island. One Circle.',
  description = $desc$We're leaving the mainland for one night. Link Circle camps at Tarkwa Bay on 3 to 4 October 2026. Boat access only. 30 slots. ₦23,000 per slot. Community members only.$desc$,
  whats_included = '["Overnight camp at Tarkwa Bay Beach Camp","Tent space (2 per tent)","Shared cabana for activities & hangout","Drinks: soft drinks, water, juice, alcohol & red wine","Bonfire & night vibes","Games, beach time & connections"]'::jsonb,
  gallery_note = 'Register online · Closes 24 September · Link Circle community only',
  updated_at = now()
where id = 'evt_island_camp_1003';
