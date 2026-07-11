# Link Circle (Ajah → Eleko) — Website Master Plan

> **Status:** Planning only (no build yet)  
> **Product:** Public community website + private event access system  
> **Goal:** An extraordinarily beautiful, high-converting site that makes Link Circle feel like a movement — and gives admins real tools for events, passes, and growth.

---

## 1. Vision & North Star

**Link Circle** is more than a WhatsApp community. It’s a movement for people along the Ajah → Eleko corridor to **connect, network, grow, collaborate, support businesses, and build real relationships**.

The website must:
1. Make first-time visitors feel the energy instantly (brand-first, cinematic, local).
2. Explain the community clearly (weekly rhythm, marketplace, events, people).
3. Drive joins (WhatsApp / invite flow).
4. Showcase past & upcoming events with real photos/dumps.
5. Power **paid event access** with unique barcodes + links that **cannot be reused**.
6. Give admins a clean control panel (participants inventory, scan door, coordinators).

**Tagline options (pick / refine later):**
- “More than a community. A movement.”
- “Connect. Grow. Belong. Ajah → Eleko.”
- “Where the corridor meets.”

---

## 2. Brand Direction (Design Brief)

### 2.1 Feel
- Warm Lagos coastal energy: Ajah → Eleko, hangouts, night vibes, friendship, ambition.
- Not generic “purple SaaS.” Not newspaper. Not cream-and-terracotta AI default.
- Think: golden hour + deep night contrast, real photography, motion with presence.

### 2.2 Visual pillars
| Pillar | Direction |
|--------|-----------|
| Color | Define CSS variables early. Candidate palette: deep charcoal / ink night, warm sand, coral-sunset accent, soft lagoon teal as secondary — finalize with real photos. |
| Typography | Expressive display + clean body. Avoid Inter/Roboto/Arial/system defaults. |
| Imagery | Real community photos, hangouts, faces, places along Ajah–Eleko. Hero = full-bleed edge-to-edge. |
| Motion | 2–3 intentional motions (hero reveal, scroll section entrance, pass success animation). |
| Layout | One composition in first viewport. Brand hero-level. No card clutter in hero. |

### 2.3 Brand assets to collect
- [ ] Logo (SVG + PNG, light/dark)
- [ ] Wordmark / lockup
- [ ] Favicon + app icons
- [ ] Brand photos (events, hangouts, members — with consent)
- [ ] Founder & coordinator headshots (consistent crop/lighting)
- [ ] Social handles & WhatsApp invite links
- [ ] Payment details for events (bank / transfer / Paystack later)

---

## 3. Site Map (Pages & Sections)

### Public site

| Route | Purpose |
|-------|---------|
| `/` | Home — brand + join CTA |
| `/about` | Mission, story, who we are |
| `/weekly` | Weekly structure (Mon–Sun) |
| `/marketplace` | LC Marketplace overview + how it works |
| `/events` | Upcoming + past events |
| `/events/[slug]` | Single event detail + “Get access / pay info” |
| `/coordinators` | Founders (stand out) + coordinators/admins |
| `/join` | How to join + WhatsApp CTA |
| `/pass/[token]` | Participant digital pass (barcode + name) — **private link** |
| `/scan` or door app | Admin-only scan gate (or separate PWA) |
| `/admin` | Admin dashboard (protected) |

Optional later:
- `/gallery` — photo dumps
- `/partners` — brands/sponsors
- `/rules` / `/guidelines` — community rules
- `/contact`

---

## 4. Homepage Composition (First Viewport Rules)

**First viewport = one composition only:**
1. Brand: **Link Circle** (hero-level)
2. One headline
3. One short supporting line (Ajah → Eleko / movement)
4. One CTA group: **Join the Circle** + **See events**
5. One dominant full-bleed visual (community / hangout atmosphere)

**Do not put in hero:** stats strips, schedule snippets, address blocks, promo chips, marketplace cards.

### Suggested homepage scroll sections (after hero)
1. **What is Link Circle** — mission paragraph
2. **The weekly rhythm** — Mon–Sun teaser → link to `/weekly`
3. **Upcoming event spotlight** — House Apartment Hangout (Jul 25–26)
4. **LC Marketplace** — short pitch → `/marketplace`
5. **People** — Founders highlight teaser → `/coordinators`
6. **Past vibes** — event dumps strip → `/events`
7. **Join** — strong close CTA

---

## 5. Content Sections — Full Spec

### 5.1 About / Mission
Use and refine:

> Welcome to Link Circle — more than just a community, it's a movement. Our mission is to help people connect, network, grow, collaborate, support businesses, and build meaningful relationships. Through discussions, opportunities, events, and real-life connections, we're creating a place where everyone belongs.

Also include:
- Location identity: **Ajah → Eleko**
- WhatsApp community as the living hub
- Website as the public face + event ops layer

### 5.2 Weekly Structure
Mirror the existing structure exactly (content source of truth):

| Day | Theme | Vibe |
|-----|--------|------|
| Monday | Reset / Quiet Day | Low activity, reset |
| Tuesday | Cruise & Daily Life | Gist, memes, day vibes |
| Wednesday | Networking Day | Business, collabs, profiles |
| Thursday | Growth & Opportunities | Jobs, advice, learning |
| Friday | Good Vibes Day | Music, food, weekend plans |
| Saturday | Hangout / Meetup Day | Real-life connections |
| Sunday | Chill & Reflection | Intros, check-ins, calm close |

**UX:** Beautiful day-by-day timeline or horizontal day strip; today highlighted.

### 5.3 LC Marketplace
Pitch + rules:

> Official business hub of Link Circle — buying, selling, promoting products/services, connecting buyers with trusted sellers.

Rules to display:
- Business-related posts only
- No random chats / spam
- Honesty & transparency
- Involve admins in major transactions when needed
- Respect & professionalism

**Website role (v1):** Explain marketplace + CTA to WhatsApp marketplace group.  
**Later:** Optional business directory / featured vendors on the site.

### 5.4 LC Events
Two lists:
1. **Upcoming** — House Apartment Hangout, Jul 25–26 (24 hours), etc.
2. **Past** — photo dumps, recaps, “what happened”

Each event page needs:
- Title, dates, time window
- Location (public blur until paid / day-of, if desired)
- Description & vibe
- Price / payment instructions
- Capacity
- CTA: Pay → admin confirms → receive pass
- Gallery (for past)
- Status: `draft` | `upcoming` | `live` | `ended`

### 5.5 Coordinators & Founders
- **Founders section must stand out** — larger portraits, names, short bios, distinct layout (not same grid as everyone else).
- **Coordinators / Admins** — photos, roles (e.g. Events, Marketplace, Growth, Door/Check-in).
- Optional: WhatsApp contact (careful with spam) or “Message via admin”.

### 5.6 Join / Growth
- Why join
- How to join (WhatsApp invite / request form)
- Sunday intros culture
- Social proof (member count when you’re comfortable sharing; photos)

---

## 6. Flagship Feature: Event Access Pass System

### 6.1 Problem
Only people who **paid** should enter. Door staff need fast, fraud-resistant check-in.

### 6.2 Solution overview
1. Admin adds paid participants to **inventory** (name, phone, WhatsApp, event).
2. System generates a **unique barcode/QR** + **unique pass link** per participant.
3. Admin shares **barcode image + link** to each person (WhatsApp).
4. At the door, staff **scan barcode** OR open link → verify → **grant once**.
5. Success screen: **“Welcome to Link Circle, [Name]”**
6. Same pass **cannot** be used twice (single-use check-in).

### 6.3 User flows

#### A. Admin — add participant
1. Open Admin → Event → Participants
2. Add: Full name, phone/WhatsApp, optional email, notes, payment status = Paid
3. System creates `pass_token` (unguessable)
4. Generate QR/barcode encoding pass URL or pass ID
5. Show: download PNG, copy link, “Send via WhatsApp” deep link

#### B. Participant — receive pass
1. Gets WhatsApp message with image + link
2. Opens `/pass/[token]` anytime before event
3. Sees: name, event title, dates, QR/barcode, “Show this at the door”
4. Can screenshot or keep link offline-ish (link still needs network at scan time for anti-reuse)

#### C. Door — check-in
1. Staff logged into Door Mode (phone/tablet)
2. Scan QR with camera **or** type/manual search
3. Backend checks: valid event? paid? already checked in?
4. If OK → mark `checked_in_at`, show big green welcome with name
5. If already used → red reject: “Already checked in at [time]”
6. If invalid → “Pass not found / not for this event”

#### D. Edge cases
| Case | Behavior |
|------|----------|
| Duplicate scan | Reject + show first check-in time |
| Wrong event | Reject |
| Unpaid / revoked | Reject |
| Offline door | v1: require online; v2: optional offline sync |
| Name correction | Admin can edit name; token stays |
| Lost phone | Link still works; admin can regenerate (invalidate old) |
| Transfer ticket | Admin revoke A, create B (or transfer once) |

### 6.4 Data model (core)

```
Event
  id, slug, title, description
  starts_at, ends_at
  location_public, location_private
  price, capacity, cover_image
  status

Participant (Pass)
  id, event_id
  full_name, phone, whatsapp, email?
  payment_status: unpaid | paid | refunded | complimentary
  pass_token (unique, secret)
  barcode_payload / qr_value
  checked_in_at (nullable)
  checked_in_by (admin id)
  revoked_at (nullable)
  created_at, updated_at

AdminUser
  id, name, email, role: founder | admin | door_staff
  password / auth provider

EventMedia
  id, event_id, url, type, caption, sort_order

Coordinator
  id, name, role_title, bio, photo_url
  is_founder (bool), sort_order

JoinLead (optional)
  name, phone, how_heard, created_at
```

### 6.5 Pass security rules
- Tokens: long random (e.g. 32+ chars), not sequential IDs
- HTTPS only
- Scan endpoint requires admin/door auth
- Public pass page shows barcode but **check-in only via authenticated scan**
- Rate-limit scan attempts
- Audit log: who scanned, when, result
- Soft-delete / revoke without deleting history

### 6.6 First event to wire
**House Apartment Hangout**  
- **When:** July 25 – July 26 (24 hours)  
- **What:** Apartment hangout  
- **Access:** Paid participants only via unique pass  
- **Inventory:** Admins maintain paid list  
- **Door:** Scan → welcome name → single use

---

## 7. Admin Panel Requirements

### 7.1 Modules
1. **Dashboard** — upcoming event, check-in counts, join clicks
2. **Events** — CRUD, status, media dumps
3. **Participants** — add/import CSV, mark paid, generate passes, bulk WhatsApp copy
4. **Door / Check-in** — live scanner + recent check-ins list + search by name
5. **Coordinators** — manage photos, founder flag, order
6. **Content** — weekly copy, marketplace text, homepage fields (optional CMS-lite)
7. **Settings** — WhatsApp links, payment instructions, brand assets

### 7.2 Door Mode UX
- Full-screen, high contrast, big camera view
- Loud success / fail states (visual + optional sound)
- Works on mobile Chrome/Safari in bright light
- Manual name search fallback if camera fails

### 7.3 Ops checklist for Jul 25–26
- [ ] Create event in admin
- [ ] Set price + payment instructions
- [ ] Collect payments (WhatsApp / transfer)
- [ ] Enter each paid name into inventory
- [ ] Generate & send passes
- [ ] Test 5 dummy passes (grant + reuse reject)
- [ ] Assign door staff accounts
- [ ] Print backup paper list (name + last 4 of phone)
- [ ] On-site: charger, hotspot, spare phone

---

## 8. What Else Should We Add? (Recommended)

### Must-have for v1
- [x] Beautiful public marketing site
- [x] Weekly structure page
- [x] Marketplace explainer
- [x] Events (upcoming + past)
- [x] Coordinators + standout Founders
- [x] Join CTA / WhatsApp
- [x] Admin participant inventory
- [x] Unique QR/barcode + pass link
- [x] Single-use door scan + welcome screen

### Strongly recommended (v1.1)
- CSV import for paid list
- Bulk “copy all pass links”
- Check-in live counter (X / Y inside)
- Complimentary / guest / VIP pass types
- Revoke & regenerate pass
- Event photo gallery / dumps
- SEO + Open Graph share cards for events
- Analytics (join button clicks, event page views)

### Nice-to-have (v2)
- Online payment (Paystack/Flutterwave) → auto-create pass
- Waitlist when sold out
- Member directory (opt-in)
- Business directory for Marketplace
- Push/email reminders before event
- Offline door mode
- Multi-event season passes
- Sponsorship packages page
- Newsletter / broadcast (careful — WhatsApp is primary)

### Trust & safety
- Community guidelines page
- Marketplace disclaimer (admins help, not escrow by default unless you decide otherwise)
- Photo consent note for galleries
- Privacy: don’t expose full phone numbers on public pages

### Growth
- Shareable “Invite a friend” page
- Instagram / TikTok embeds or link hub
- “This week’s theme” auto-highlight based on weekday
- Testimonials / member quotes

---

## 9. Information Architecture Wire (Text)

```
Home
 ├─ About
 ├─ Weekly Rhythm
 ├─ Marketplace
 ├─ Events
 │   ├─ Upcoming: House Hangout Jul 25–26
 │   └─ Past dumps…
 ├─ Coordinators (Founders ★ + Team)
 ├─ Join
 └─ [Private] Pass / Admin / Door
```

---

## 10. Tech Approach (Recommended)

> Finalize stack when build starts; this is the default recommendation.

| Layer | Suggestion |
|-------|------------|
| Frontend | Next.js (App Router) + TypeScript |
| Styling | Tailwind + custom CSS variables; motion via Framer Motion |
| Backend/DB | Supabase (Auth + Postgres) or similar |
| QR | `qrcode` library → PNG for WhatsApp; same token in URL |
| Barcode | Prefer **QR** for phone cameras; optional Code128 if you need classic barcode scanners |
| Hosting | Vercel (site) + Supabase |
| Auth | Email magic link / password for admins only |
| Storage | Supabase Storage for photos & generated pass images |
| Payments (later) | Paystack |

**Why QR over classic barcode:** every admin phone can scan without a hardware scanner; still can label it “barcode/pass” in copy.

---

## 11. Phased Roadmap (A → Z)

### Phase 0 — Foundations (now)
1. Lock brand name, tagline, colors, fonts
2. Collect logos, founder photos, event photos
3. Confirm WhatsApp invite links (main + marketplace + events)
4. Confirm payment method for Jul 25–26
5. Write final copy for About / Marketplace / Weekly
6. List all founders + coordinators with titles
7. Approve this master plan

### Phase 1 — Design
1. Moodboard + palette
2. Homepage high-fidelity (mobile + desktop)
3. Events + Coordinators layouts
4. Pass page + Door scan UI
5. Admin wireframes

### Phase 2 — Public site build
1. Project setup, design system, fonts
2. Home, About, Weekly, Marketplace, Join
3. Coordinators (Founders standout)
4. Events list + detail + past dumps
5. SEO, OG images, favicon, performance

### Phase 3 — Event access system
1. Auth + admin roles
2. Events CRUD
3. Participants inventory + pass generation
4. Public pass page
5. Door scanner + single-use logic
6. Audit log + revoke
7. End-to-end test with dummy guests

### Phase 4 — Launch for House Hangout
1. Seed real paid participants
2. Send passes
3. Door staff training (5-min script)
4. Go live Jul 25–26
5. Capture photos for site dump after

### Phase 5 — Growth & polish
1. Payments automation
2. Marketplace directory (optional)
3. Galleries, analytics, content CMS
4. Iterate design from real feedback

---

## 12. Asset & Content Checklist (Before Build Looks Elite)

### People
- [ ] Founder names, titles, bios, photos
- [ ] Coordinator list + photos + roles

### Community
- [ ] Official WhatsApp community invite link
- [ ] Marketplace group link
- [ ] Events announcement group/link if separate
- [ ] Socials (IG, TikTok, Twitter/X, etc.)

### Event (Jul 25–26)
- [ ] Exact title
- [ ] Exact start/end times
- [ ] Price
- [ ] What’s included (food? sleep? games?)
- [ ] Rules / what to bring
- [ ] Public location wording
- [ ] Cover image / flyer
- [ ] Capacity

### Visual
- [ ] 10–30 real community photos
- [ ] Logo files
- [ ] Flyer for hangout

---

## 13. Success Metrics

| Metric | Why |
|--------|-----|
| Join CTA clicks | Growth |
| Event page views | Interest |
| Paid conversions (manual ok) | Revenue |
| Passes generated vs checked in | Ops health |
| Duplicate scan attempts blocked | Fraud resistance |
| Time to check-in at door | Experience |
| Post-event gallery engagement | Retention |

---

## 14. Open Decisions (Need Your Answers)

1. **Domain?** (e.g. `linkcircle.ng`, `thelinkcircle.com`)
2. **Exact founders list** (names + photos)
3. **Coordinator list** (names + roles + photos)
4. **Hangout price** and payment account details
5. **Capacity** for Jul 25–26
6. **Location reveal policy** (public vs after payment)
7. **QR only** or also printable Code128 barcode?
8. **Online payment now** or manual transfer + admin inventory for v1?
9. **Member count** — show publicly or not?
10. **Brand colors / logo** — existing assets or design from scratch?

---

## 15. Build Order Summary (When You Say “Go”)

1. Design system + homepage beauty  
2. Content pages (Weekly, Marketplace, About, Coordinators, Join)  
3. Events (upcoming + past)  
4. Admin + participants + passes  
5. Door scan + anti-reuse  
6. Soft launch → House Apartment Hangout  

---

## 16. Copy Bank (Ready to Place)

### Mission (short)
More than a community — a movement. Connect, network, grow, collaborate, and belong along Ajah → Eleko.

### Marketplace (short)
LC Marketplace is the official business hub of Link Circle. Promote daily. Support each other. Keep it business-only, honest, and respectful.

### Events (short)
From apartment hangouts to corridor meetups — real-life Link Circle. Past dumps live here. Upcoming drops land here first.

### Join (short)
We’re growing every day. If you’re around Ajah → Eleko and want real connections — join Link Circle.

### Pass success
Welcome to Link Circle, {name}. You’re in. Enjoy the hangout.

### Pass already used
This pass was already checked in. If this is a mistake, see an admin.

---

## 17. Immediate Next Step

**Approve / tweak this plan**, then reply with:
1. Answers to Section 14 open decisions (even partial)
2. Founder + coordinator names
3. Hangout price, times, what’s included
4. Logo / photos if ready

Then we move from **MD → design → build**.

---

*Document owner: Link Circle web project*  
*First event target: House Apartment Hangout — July 25–26 (24h)*  
*Created: July 11, 2026*
