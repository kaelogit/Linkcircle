-- Refresh LC Island Camp description (no em dashes, improved copy)

update public.events
set
  description = $desc$We're leaving the mainland for one night.

On Saturday 3 October into Sunday 4 October, Link Circle camps at Tarkwa Bay. It is a sheltered island beach in Lagos, and the only way in is by boat. No traffic. No city noise. Just calm water, open sky, and the circle together.

One cabana for the whole community. Tents for two. Drinks on ice. A bonfire to dance around. Games, conversations, beach time, and memories you will want to capture.

Everyone said the Networking Picnic was our best event yet. LC Island Camp is the next level.

₦23,000 per slot covers your tent, cabana space, drinks (soft drinks, water, juice, alcohol and red wine), and the bonfire. Bring your own food. Arrange your own transport to the jetty.

30 slots total: 15 male, 15 female. Link Circle community members only. Registration closes 24 September or when we sell out.

Meet at the jetty by 1:00pm. Camp starts 2:00pm. Last boat crossing to the island is around 5:00pm. Jetty details go out in WhatsApp after you pay.$desc$,
  updated_at = now()
where id = 'evt_island_camp_1003';
