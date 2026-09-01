/** LC Island Camp landing page copy (no em dashes). */

export const ISLAND_CAMP_HERO = {
  eyebrow: "LC Island Camp",
  headline: "One Night. One Island. One Circle.",
  subline:
    "Boat in to Tarkwa Bay. Camp under the stars. Bonfire, cabana vibes, and the circle together.",
};

export const ISLAND_CAMP_ABOUT = [
  "We're leaving the mainland for one night.",
  "On Saturday 3 October into Sunday 4 October, Link Circle camps at Tarkwa Bay, a sheltered island beach in Lagos where the only way in is by boat.",
  "No traffic. No city noise. Just calm water, open sky, and the circle together.",
  "One cabana for the whole community. Tents for two. Drinks on ice. A bonfire to dance around. Games, conversations, beach time, late-night vibes, and memories you will want to capture.",
  "Everyone said the Networking Picnic was our best event yet. LC Island Camp is the next level.",
];

export const ISLAND_CAMP_PRICE_NAIRA = 23_000;

export const ISLAND_CAMP_INCLUDES = [
  { icon: "⛺", label: "Tent space" },
  { icon: "🏝️", label: "Shared cabana space" },
  { icon: "🥤", label: "Soft drinks, water & juice" },
  { icon: "🍷", label: "Alcohol & red wine" },
  { icon: "🔥", label: "Bonfire" },
];

export const ISLAND_CAMP_WALK_INTO = [
  { icon: "⛺", label: "Tent space", detail: "2 people per tent" },
  { icon: "🏖️", label: "Shared cabana", detail: "Activities & hangout" },
  {
    icon: "🥤",
    label: "Drinks",
    detail: "Soft drinks, water, juice, alcohol & red wine",
  },
  { icon: "🔥", label: "Bonfire", detail: "Night vibes" },
  { icon: "🎮", label: "Games & activities", detail: "In the cabana" },
  { icon: "🌊", label: "Beach time", detail: "Calm island water" },
  {
    icon: "❤️",
    label: "Connections",
    detail: "Conversations & memories",
  },
];

export const ISLAND_CAMP_SCHEDULE = [
  { time: "1:00 PM", label: "Meet at the jetty" },
  { time: "2:00 PM", label: "Camp starts" },
  { time: "~5:00 PM", label: "Last boat crossing" },
];

export const ISLAND_CAMP_LOGISTICS = [
  "Please arrive at the jetty on time. Missing the final crossing may mean you cannot reach the camp.",
  "Jetty details will be shared in the Link Circle WhatsApp group after payment.",
  "Transport to the jetty is approximately ₦2,500 each way, paid separately at the terminal.",
  "Bring your own food. Whatever you bring is yours.",
];

export const ISLAND_CAMP_PAYMENT = [
  "Link Circle community members only.",
  "Your WhatsApp display name or group number is verified during registration.",
  "₦23,000 confirms your slot. Paystack processing fee applies at checkout.",
  "No refunds. Registration closes 24 September or when all 30 slots are filled.",
];

export const ISLAND_CAMP_TENT_INTRO =
  "Everyone registers individually. Each tent sleeps two people, so arrange your tent-mate before or after you pay. We do not assign partners on the registration form.";

export const ISLAND_CAMP_TENT_RULES = [
  "Same-gender members can share a tent.",
  "Couples who are both Link Circle members can share a tent.",
  "Your tent-mate must also be registered and fully paid for LC Island Camp.",
  "Bringing someone who is not registered is not allowed.",
  "If your plans change, sort it out directly with your tent-mate. Tent pairing is between members. Admins do not match people up.",
];

export const ISLAND_CAMP_CLOSING = {
  lines: [
    "30 slots.",
    "15 male.",
    "15 female.",
    "One island.",
    "One night.",
    "One Circle.",
  ],
  footnote:
    "Register online · Closes 24 September · Link Circle community only",
};

/** Short description for SEO / event list fallback */
export const ISLAND_CAMP_DESCRIPTION = ISLAND_CAMP_ABOUT.join("\n\n");
