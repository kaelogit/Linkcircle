export type EventStatus = "draft" | "upcoming" | "live" | "ended";

export type PaymentStatus = "unpaid" | "paid" | "refunded" | "complimentary";

export type EventDump = {
  id: string;
  url: string;
  caption: string;
  createdAt: string;
  /** Defaults to image for older dumps without this field */
  type?: "image" | "video";
};

export type EventItem = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  startsAt: string;
  endsAt: string;
  locationPublic: string;
  locationPrivate?: string;
  priceLabel: string;
  capacity: number;
  coverGradient: string;
  coverImage?: string;
  status: EventStatus;
  whatsIncluded: string[];
  galleryNote?: string;
  dumps: EventDump[];
  createdAt: string;
  updatedAt: string;
};

export type Participant = {
  id: string;
  eventId: string;
  fullName: string;
  phone: string;
  whatsapp?: string;
  paymentStatus: PaymentStatus;
  passToken: string;
  checkedInAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

export type Coordinator = {
  id: string;
  name: string;
  role: string;
  bio: string;
  quote?: string;
  alias?: string;
  isFounder: boolean;
  initials: string;
  accent: string;
  photo?: string;
};

export const SITE = {
  name: "Link Circle",
  shortName: "LC",
  corridor: "Ajah → Eleko",
  tagline: "More than a community. A movement.",
  mission:
    "Welcome to Link Circle. More than just a community, it's a movement. Our mission is to help people connect, network, grow, collaborate, support businesses, and build meaningful relationships. Through discussions, opportunities, events, and real-life connections, we're creating a place where everyone belongs.",
  whatsappInvite: "https://chat.whatsapp.com/GYr4iuZTO5H2uJOQjLIkWR",
  marketplaceInvite: "https://chat.whatsapp.com/GYr4iuZTO5H2uJOQjLIkWR",
  contactEmail: "ksqkareem@gmail.com",
  logo: "/brand/logo-circle.png",
  logoMark: "/brand/logo.png",
};

export const WEEKLY = [
  {
    day: "Monday",
    title: "Reset / Quiet Day",
    vibe: "Calm reset",
    points: [
      "Very low activity",
      "No unnecessary messages",
      "Focus on work, school, business & personal life",
      "A calm day for everybody to reset mentally",
    ],
  },
  {
    day: "Tuesday",
    title: "Cruise & Daily Life Day",
    vibe: "Casual vibes",
    points: [
      "Random gist",
      "Funny moments / memes",
      "“How’s your day going?” posts",
      "Videos / pictures of your day",
      "Casual conversations",
    ],
  },
  {
    day: "Wednesday",
    title: "Networking Day",
    vibe: "Connections",
    points: [
      "Businesses & brands",
      "Skills / services",
      "Sharing profiles for likes, comments, follows & support",
      "Collaborations & opportunities",
      "Meeting people in similar fields",
    ],
  },
  {
    day: "Thursday",
    title: "Growth & Opportunities Day",
    vibe: "Level up",
    points: [
      "Job opportunities",
      "Business / tech discussions",
      "Helpful information & advice",
      "Enlightening conversations",
      "Useful updates / resources",
    ],
  },
  {
    day: "Friday",
    title: "Good Vibes Day",
    vibe: "Weekend warm-up",
    points: [
      "Music",
      "Food spots",
      "Weekend plans",
      "Recommendations around Ajah → Eleko",
      "Chill discussions before the weekend",
    ],
  },
  {
    day: "Saturday",
    title: "Hangout / Meetup Day",
    vibe: "Real life",
    points: [
      "Hangouts & meetups",
      "Beach / chill spots",
      "Group outings",
      "Sports / fun activities",
      "Real-life connections",
    ],
  },
  {
    day: "Sunday",
    title: "Chill & Reflection Day",
    vibe: "Soft close",
    points: [
      "Accepting new members & introductions",
      "Very light activity",
      "Check-ins (“How was your week?”)",
      "Motivation, encouragement & prayers",
      "Rest from structured activities",
    ],
  },
] as const;

export const MARKETPLACE_RULES = [
  "Business-related posts only.",
  "No random chats, unrelated discussions, or spam.",
  "Be honest and transparent in your dealings.",
  "Involve admins in major transactions where necessary for a safer marketplace.",
  "Treat fellow members with respect and professionalism.",
];

export const COORDINATORS: Coordinator[] = [
  {
    id: "founder",
    name: "Abdulkareem Abdulkareem",
    role: "Founder",
    bio: "Founder of Link Circle and StoreLink (storelink.ng). I build products and communities that help people connect, trade, and grow. Along the Ajah → Eleko corridor, I saw talent everywhere but too few spaces that felt organized, useful, and human. So I started Link Circle: a movement with clear weekly rhythm, a marketplace for real support, and hangouts that turn chats into relationships.",
    quote:
      "I created Link Circle because people here deserve more than a noisy group chat. They deserve a circle where you can introduce yourself, find opportunities, push your business, make friends, and show up in real life. If StoreLink is about helping businesses grow online, Link Circle is about helping people grow together offline and online. Belong. Connect. Build.",
    isFounder: true,
    initials: "AA",
    accent: "#6b1f2a",
    photo: "/team/abdulkareem-abdulkareem.png",
  },
  {
    id: "admin-ebuka",
    name: "Chukwuebuka Elvis",
    alias: "Cruiz_Kvng",
    role: "Community Manager",
    bio: "Passionate about building meaningful relationships, fostering engagement, and creating a thriving community. As the Community Manager of Link Circle, I am committed to ensuring every member feels welcomed, valued, and connected while driving conversations, collaboration, and opportunities that help our community grow.",
    quote:
      "I believe Link Circle is more than just a community. It's a family united by shared values, genuine connections, and a commitment to growth. It's a place where people can network, learn, support one another, and unlock opportunities that positively impact both their personal and professional lives. Together, we are building a community where everyone has a chance to belong, contribute, and thrive.",
    isFounder: false,
    initials: "EE",
    accent: "#1f6f73",
    photo: "/team/ebuka-elvis.png",
  },
  {
    id: "admin-aaliyah",
    name: "Mohammed Aalliyah Kaaka",
    role: "Legal Adviser & Chief Whip",
    bio: "Passionate about leadership, justice, and community building. I serve as the Legal Adviser and Chief Whip of Link Circle, where I work to uphold our values, promote accountability, and foster unity among members.",
    quote:
      "I believe Link Circle is more than just a community, it is a family built on unity, growth, accountability, and meaningful connections. It is a space where individuals are encouraged to learn, lead, support one another, and become the best versions of themselves.",
    isFounder: false,
    initials: "AL",
    accent: "#d4a24a",
    photo: "/team/aaliyah-the-law.png",
  },
  {
    id: "admin-fehintade",
    name: "Fehintade Habibat Omolara",
    role: "Public Relations Officer",
    bio: "I am committed to helping members connect, grow, and thrive. I believe every connection creates an opportunity, and together we can build a supportive community that inspires learning, success, and positive impact.",
    quote:
      "To me, Link Circle is a community where people come together to connect, learn, support one another, and grow. It encourages collaboration, creates opportunities, and inspires members to become better personally, socially and professionally. I'm proud to serve as a PRO helping members feel welcomed, informed, and empowered to make the most of everything Link Circle has to offer.",
    isFounder: false,
    initials: "FH",
    accent: "#3a9a9e",
    photo: "/team/fehintade-habibat.png",
  },
  {
    id: "admin-barakat",
    name: "Aremu Barakat Ejide",
    alias: "Arbar / Hume",
    role: "Welfare Director",
    bio: "As the Welfare Director, I lead with care and support for the people of this community. I act as a bridge ensuring the activities and programs are meeting the needs of the members. I also look after the physical and emotional wellbeing of members, safeguarding, organizing support during personal milestones or crises, and promoting a friendly, inclusive, and safe environment for everyone in the group.",
    quote:
      "This is a community built on love and trust which enables us to be a proud family. The vision and mission of the group is a transparent one which gives room for group and individual growth, so therefore, it is “LINKED”.",
    isFounder: false,
    initials: "AB",
    accent: "#e85d4c",
    photo: "/team/aremu-barakat.png",
  },
];

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatEventRange(startsAt: string, endsAt: string) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  return `${start.toLocaleDateString("en-GB", opts)} – ${end.toLocaleDateString("en-GB", opts)}`;
}

export function isUpcomingStatus(status: EventStatus) {
  return status === "upcoming" || status === "live";
}

export function isPastStatus(status: EventStatus) {
  return status === "ended";
}
