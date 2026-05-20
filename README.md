# HiddenSense™ MVP (prototype)

Web-first mood funnel for **Hidden Spirits**: gated profile capture → five tap questions → deterministic mood scoring → curated cocktail + pairing → checkout stub → required feedback captured in Supabase.

## Stack

Next.js App Router • React • Tailwind v4 • Supabase Postgres (writes via server-only **service role** + httpOnly `hiddensense_profile_id` stub cookie • Vercel-ready.

## Prerequisites

- Node.js 20+
- A Supabase project (optional during `next dev` thanks to offline demo)

## Tester login (skip `/login` gate)

- In **development** (`next dev`), visit [http://localhost:3000/login](http://localhost:3000/login) or use **“Tester login”** on the home page.
- **With Supabase configured:** creates a throwaway `profiles` row and runs the full funnel (quiz rows in the DB).
- **Without Supabase (dev only by default):** falls back to **offline demo** cookies so you can still polish the quiz UI; results open at `/result/demo` (no DB persistence).
- **`/logout`** clears profile + demo cookies.
- For **production builds**, set `ENABLE_QUICK_LOGIN=true` to expose `/login`, and `ENABLE_OFFLINE_DEMO=true` only on private sandboxes (never public production).

## Setup

1. Copy environment template and fill Supabase secrets when you want real persistence:

```bash
cp .env.example .env.local
```

2. Run the migration in the Supabase SQL editor:

`supabase/migrations/001_init.sql`  
`supabase/migrations/002_intelligence_engine.sql` (if not already)  
`supabase/migrations/003_storage_cocktail_images.sql`  
`supabase/migrations/004_profile_last_name_food_assets.sql`

Leave RLS disabled for this prototype, or tighten policies before production (see plan for OTP/auth migration notes).

3. Install and run locally:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Ambient photography

Premium food & drink imagery is wired as **fixed backgrounds** with **translucent violet / amber scrims** layered on top (`components/visual/FixedAmbientBackground.tsx`), so the vault gradient stays legible. URLs live in [`lib/media/ambient.ts`](lib/media/ambient.ts) (Unsplash); override with your own files under `public/media/` and point those constants to `/media/....` if you prefer fully self-hosted assets.

## Scripts

| Command        | Purpose                |
|----------------|------------------------|
| `npm run dev`  | Turbopack dev server   |
| `npm run build`| Production bundle      |
| `npm run start`| Serve production build |
| `npm run lint` | ESLint                 |
| `npm run test` | Vitest (mood engine)   |

## Environment variables

| Key | Purpose |
|-----|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Public** anon key — browser auth (`signInWithOtp`, `exchangeCodeForSession`) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** — upserts `profiles` after auth (never expose publicly) |
| `NEXT_PUBLIC_SITE_URL` | Absolute site root for shared links |
| `NEXT_PUBLIC_CHECKOUT_BASE_URL` | Stub storefront URL; UTMs plus `mood`, `session_id`, `profile_id` query params are appended |
| `ENABLE_QUICK_LOGIN` | Set `true` to allow `/login` outside development |
| `ENABLE_OFFLINE_DEMO` | Set `true` to permit Supabase-free UI runs (e.g. staging); dev mode already enables this fallback |

If `NEXT_PUBLIC_CHECKOUT_BASE_URL` is omitted, `https://example.com/checkout` is used so UI keeps working offline.

## User flow (production auth)

1. **Home** — Age consent (21+ / under 21) then **Get started** opens the public **`/quiz`**, or **Sign in** goes to **`/login`**.
2. **`/login` Sign up** — First name, last name, email, date of birth (same fields on **`/quiz`** sign up); Supabase **`signInWithOtp`** sends a **verification code**. Legacy **`/gate`** URLs redirect to **`/login`**.
3. **`/verify?email=&next=`** — Enter the email OTP; then profile sync and redirect to **`next`** (default **`/dashboard`**).
4. **`/quiz`** — Anonymous mood + taste flow; **View results** prompts account creation if needed; answers are stored in **`localStorage`** until the session is saved.
5. **`/quiz/complete`** — After verification, submits the pending quiz and redirects to **`/result/[sessionId]`**.
6. **`/result/[sessionId]`** — Drink + food pairing cards, checkout when configured, link to **`/feedback/[sessionId]/mood`** for mood accuracy.
7. **`/feedback/[sessionId]/mood`** — Absolutely / Close enough / Not really, then **`/feedback/[sessionId]`** for detailed feedback → **`/thanks`**.

**`/login`** — Email OTP (`signInWithOtp`) for returning users, then **`/verify`** + optional `?next=`.

Middleware protects **`/dashboard`**, **`/intro`** (redirects to `/dashboard`), **`/profile`**, **`/result/*`**, **`/feedback/*`** (including **`/feedback/*/mood`**). **`/quiz`** and **`/quiz/complete`** are public. **`/auth/callback`** is not gated by the auth redirect. Signed-in visitors to **`/`** are redirected to **`/dashboard`**.

## Supabase Auth settings

In [Authentication → Providers → Email](https://supabase.com/dashboard/project/_/auth/providers): enable **Email** and configure templates to send a **6-digit OTP** (`{{ .Token }}`), not magic-link URLs. Keep **`{SITE_URL}/auth/callback`** in redirect URLs if you still use link-based flows elsewhere. Site URL should match `NEXT_PUBLIC_SITE_URL`.
