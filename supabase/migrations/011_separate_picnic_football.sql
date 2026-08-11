-- Keep picnic and football as separate events (no weekend pairing copy)

update public.events
set
  gallery_note = 'Register online · ₦5,000 · only 30 seats.',
  updated_at = now()
where id = 'evt_networking_picnic_0829';

update public.events
set
  description = $football$Sunday, 30th August is pure Link Circle energy on the grass. Mixed Football Games — males and females mixed in teams — built for competition, connection, banter, and good vibes.

All skill levels welcome. Whether you came to score, assist, or just enjoy the chaos, show up ready to play. Teamwork. Respect. Fun. Come prove yourself, laugh hard, and leave knowing the circle a little better.

Boots on, hearts open, rivalries friendly. Network. Grow. Belong.$football$,
  gallery_note = 'A standalone Link Circle sports day — all skill levels welcome.',
  updated_at = now()
where id = 'evt_mixed_football_0830';
