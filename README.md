A lightweight, self-hosted itinerary tracker — a minimal alternative to Wanderlog. You manage trips from a
password-protected admin dashboard; friends/family view a mobile-friendly, read-only itinerary at a share link.
No accounts, no subscriptions.

## Stack

- **Next.js** (App Router) — one app serves both the admin dashboard and the public itinerary pages
- **Postgres** via **Prisma** — trips and itinerary items
- **Tailwind CSS** — mobile-first styling
- Auth: a single shared admin password, no user accounts

## Data model

- `Trip`: name, slug (used in the public URL `/t/[slug]`), destination, dates, timezone, optional cover note
- `Item`: belongs to a trip — type (flight/lodging/activity/ticket/transport/food/other), title, location,
  start/end time, confirmation #, notes, link

## Local development

1. Install dependencies:
   ```
   npm install
   ```
2. Create a Postgres database and set `DATABASE_URL` in `.env` (copy `.env.example` if present, or create `.env`):
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/travel_assistant?schema=public"
   ADMIN_PASSWORD="pick-a-password"
   SESSION_SECRET="a-long-random-string"
   ```
   Generate a strong `SESSION_SECRET` with `openssl rand -hex 32`.
3. Run migrations:
   ```
   npx prisma migrate dev
   ```
4. Start the dev server:
   ```
   npm run dev
   ```
5. Visit `http://localhost:3000/admin`, sign in with `ADMIN_PASSWORD`, and create a trip. The trip detail page
   shows its public share link (`/t/your-trip-slug`) — that's the read-only link to send to friends.

## Deploying to Vercel

1. Push this repo to GitHub and import it in Vercel.
2. Add a Postgres database — Vercel's own **Storage → Postgres** (backed by Neon) or a separate
   [Neon](https://neon.tech)/[Supabase](https://supabase.com) free-tier project both work. Connecting it through
   the Vercel dashboard sets `DATABASE_URL` automatically; otherwise add it yourself in **Settings → Environment
   Variables**.
3. Add two more environment variables in Vercel:
   - `ADMIN_PASSWORD` — the password you'll use to sign in to `/admin`
   - `SESSION_SECRET` — a long random string (`openssl rand -hex 32`), used to sign the admin session cookie
4. Apply the schema to the production database once, from your machine, pointed at the production
   `DATABASE_URL`:
   ```
   DATABASE_URL="<production-url>" npx prisma migrate deploy
   ```
5. Deploy. `npm run build` runs `prisma generate` automatically (see `postinstall` in `package.json`).

Whenever you change `prisma/schema.prisma`, run `npx prisma migrate dev` locally to create the migration, commit
the generated `prisma/migrations/*` folder, then run `prisma migrate deploy` against production (step 4) before
or after deploying.

## Notes / what's intentionally left out (v1)

- Single shared admin password — fine for one admin, not a multi-user tool.
- No booking-email parsing or calendar sync — items are entered by hand.
- No maps/route optimization or expense splitting.

These are reasonable things to add later if useful, but weren't needed for a personal itinerary board.
