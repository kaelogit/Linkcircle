-- Picnic payment copy: registration fee (not contribution)

update public.events
set
  price_label = '₦5,000 registration fee',
  description = replace(
    description,
    'Contribution: ₦5,000 per person.',
    'Registration fee: ₦5,000 per person.'
  ),
  whats_included = '[
    "Networking picnic with Link Circle members",
    "Guest speaker: Mrs. Adetoun Irukera on Emotional Intelligence (EQ)",
    "Interactive Q&A session",
    "Games, conversations, scenery & photo moments",
    "Bring something to share with the circle",
    "Unique QR access pass after payment",
    "Only 30 slots · ₦5,000 per person"
  ]'::jsonb,
  updated_at = now()
where id = 'evt_networking_picnic_0829';
