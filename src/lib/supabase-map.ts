import type {
  EventDump,
  EventItem,
  EventStatus,
  Participant,
  PaymentStatus,
} from "./site";

export type EventRow = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  starts_at: string;
  ends_at: string;
  location_public: string;
  location_private: string | null;
  price_label: string;
  capacity: number;
  cover_gradient: string;
  cover_image: string | null;
  status: EventStatus;
  whats_included: string[] | null;
  gallery_note: string | null;
  dumps: EventDump[] | null;
  created_at: string;
  updated_at: string;
};

export type ParticipantRow = {
  id: string;
  event_id: string;
  full_name: string;
  phone: string;
  whatsapp: string | null;
  payment_status: PaymentStatus;
  pass_token: string;
  checked_in_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

export function eventFromRow(row: EventRow): EventItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    tagline: row.tagline ?? "",
    description: row.description ?? "",
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    locationPublic: row.location_public ?? "",
    locationPrivate: row.location_private ?? undefined,
    priceLabel: row.price_label ?? "",
    capacity: row.capacity ?? 0,
    coverGradient: row.cover_gradient ?? "",
    coverImage: row.cover_image ?? undefined,
    status: row.status,
    whatsIncluded: Array.isArray(row.whats_included) ? row.whats_included : [],
    galleryNote: row.gallery_note ?? undefined,
    dumps: Array.isArray(row.dumps) ? row.dumps : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function eventToRow(event: EventItem): EventRow {
  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    tagline: event.tagline,
    description: event.description,
    starts_at: event.startsAt,
    ends_at: event.endsAt,
    location_public: event.locationPublic,
    location_private: event.locationPrivate ?? null,
    price_label: event.priceLabel,
    capacity: event.capacity,
    cover_gradient: event.coverGradient,
    cover_image: event.coverImage ?? null,
    status: event.status,
    whats_included: event.whatsIncluded,
    gallery_note: event.galleryNote ?? null,
    dumps: event.dumps,
    created_at: event.createdAt,
    updated_at: event.updatedAt,
  };
}

export function participantFromRow(row: ParticipantRow): Participant {
  return {
    id: row.id,
    eventId: row.event_id,
    fullName: row.full_name,
    phone: row.phone,
    whatsapp: row.whatsapp ?? undefined,
    paymentStatus: row.payment_status,
    passToken: row.pass_token,
    checkedInAt: row.checked_in_at,
    revokedAt: row.revoked_at,
    createdAt: row.created_at,
  };
}

export function participantToRow(p: Participant): ParticipantRow {
  return {
    id: p.id,
    event_id: p.eventId,
    full_name: p.fullName,
    phone: p.phone,
    whatsapp: p.whatsapp ?? null,
    payment_status: p.paymentStatus,
    pass_token: p.passToken,
    checked_in_at: p.checkedInAt,
    revoked_at: p.revokedAt,
    created_at: p.createdAt,
  };
}
