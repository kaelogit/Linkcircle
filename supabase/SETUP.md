# Supabase setup for Link Circle

Participants and events disappear on Vercel when stored in temp files.
Use Supabase Postgres so data survives reloads and redeploys.

## 1. Create a project

1. Go to https://supabase.com and create a free project
2. Wait until the database is ready

## 2. Run migrations (SQL Editor)

Open **SQL → New query** and run these files **in order**:

1. `migrations/001_create_events_participants.sql`
2. `migrations/002_seed_events.sql`
3. `migrations/003_create_members.sql` (members directory + `member-photos` storage bucket)
4. `migrations/004_create_coordinators.sql` + `005_seed_coordinators.sql`
5. `migrations/006_house_party_ended.sql` (marks House Party as past)
6. `migrations/007_event_dumps_storage.sql` (**required** for photo/video dump uploads on Vercel)
7. `migrations/008_weekend_events_aug_2026.sql` (Networking Picnic + Mixed Football)
8. `migrations/009_event_registrations.sql` (**required** for picnic Paystack signups)
9. `migrations/010_picnic_registration_details.sql` (₦5,000 · 30 slots · copy)

If a Storage policy step fails in SQL, create the public bucket in the dashboard instead (`member-photos` and/or `event-dumps`).

## 3. Copy API keys

In Supabase: **Project Settings → API**

- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- `service_role` key (secret) → `SUPABASE_SERVICE_ROLE_KEY`

Do **not** put the service role key in client-side code. Only use it in Next.js server routes.

## 4. Paystack (picnic registration)

1. Create a Paystack account → **Settings → API Keys & Webhooks**
2. Add to `.env.local` and Vercel:

```
NEXT_PUBLIC_SITE_URL=https://linkcircle.ng
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxx
PAYSTACK_SECRET_KEY=sk_live_xxx
```

3. Paystack **callback** is handled by the app: `https://linkcircle.ng/api/paystack/callback`
4. Optional webhook URL: `https://linkcircle.ng/api/paystack/webhook` (uses `x-paystack-signature` with your secret key)

Public register page: `https://linkcircle.ng/events/networking-picnic-aug-29/register`

## 5. Local env

Add to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxx
PAYSTACK_SECRET_KEY=sk_test_xxx
```

## 6. Vercel env

Project → **Settings → Environment Variables** → add Supabase + Paystack keys for Production.

Redeploy after saving.

## 7. Verify

1. Open `/admin/participants`
2. Create a pass
3. Wait a few minutes / hard refresh
4. Participant should still be there
5. Open picnic register → complete a **test** Paystack payment → check `/admin/picnic`

Without Supabase env vars, the app falls back to local `data/*.json` (fine for `npm run dev` on your PC only).
