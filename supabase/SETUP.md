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

You should see Beach Hangout + House Party after seeding.

If the Storage policy step fails in SQL, create a public bucket named `member-photos` under **Storage** in the dashboard instead.

## 3. Copy API keys

In Supabase: **Project Settings → API**

- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- `service_role` key (secret) → `SUPABASE_SERVICE_ROLE_KEY`

Do **not** put the service role key in client-side code. Only use it in Next.js server routes.

## 4. Local env

Add to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 5. Vercel env

Project → **Settings → Environment Variables** → add the same two keys for Production (and Preview if you want).

Redeploy after saving.

## 6. Verify

1. Open `/admin/participants`
2. Create a pass
3. Wait a few minutes / hard refresh
4. Participant should still be there

Without these env vars, the app falls back to local `data/*.json` (fine for `npm run dev` on your PC only).
