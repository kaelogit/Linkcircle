# Link Circle

Website for the Link Circle (Ajah → Eleko) community.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000

Admin: http://localhost:3000/admin/login

## Env

Copy `.env.example` to `.env.local`:

```
ADMIN_PASSWORD_FOUNDERS=...
ADMIN_PASSWORD_ELVIS=...
```

## Deploy (Vercel)

1. Push this repo to GitHub
2. Import in Vercel (root = project root, no subdirectory)
3. Add the same env vars
4. Deploy
