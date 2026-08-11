-- Picnic registration details: ₦5,000, 30 slots, richer copy
-- Safe to re-run

update public.events
set
  capacity = 30,
  price_label = '₦5,000 per person',
  tagline = 'Conversations under the open sky. EQ that changes how you connect.',
  description = $picnic$Saturday, 29th August is for the people who want more than small talk. Link Circle is hosting a Networking Picnic — an outdoor afternoon built for meaningful conversations, new faces, laughter, games, and unforgettable memories along the Ajah → Eleko corridor.

At the heart of the day: a guest session with Mrs. Adetoun Irukera on Emotional Intelligence (EQ): A Key Ingredient to Successful Relationships. Expect practical insights, plus an interactive Q&A where everyone can ask questions and learn together.

The Picnic Challenge: everyone attending brings something to share. It does not have to be expensive — bring whatever you genuinely can. Food, drinks, snacks: whatever you bring becomes something the whole circle enjoys together.

Only 30 slots. First come, first served. Registration closes automatically when 30 people have paid. Contribution: ₦5,000 per person. Venue shared after registration.$picnic$,
  whats_included = '[
    "Networking picnic with Link Circle members",
    "Guest speaker: Mrs. Adetoun Irukera on Emotional Intelligence (EQ)",
    "Interactive Q&A session",
    "Games, conversations, scenery & photo moments",
    "Mandatory picnic contribution — bring something to share",
    "Unique QR access pass after payment",
    "Only 30 slots · ₦5,000 per person"
  ]'::jsonb,
  gallery_note = 'Register online · ₦5,000 · only 30 seats.',
  updated_at = now()
where id = 'evt_networking_picnic_0829';
