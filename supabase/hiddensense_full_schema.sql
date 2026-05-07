-- =============================================================================
-- HiddenSense™ MVP — full schema for Supabase (PostgreSQL)
-- Run once in: Supabase Dashboard → SQL Editor → New query → Run
--
-- Depends: extension pgcrypto for gen_random_uuid() (enabled by default on Supabase)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ENTITY RELATIONSHIP (conceptual)
--
--   profiles (1) ──────────< (N) quiz_sessions (1) ──────────< (0..1) feedback
--
--   • quiz_sessions.profile_id → profiles.id  (ON DELETE CASCADE)
--   • feedback.quiz_session_id → quiz_sessions.id  (ON DELETE CASCADE)
--   • profiles.auth_user_id: optional FK to auth.users when you wire Supabase Auth
-- -----------------------------------------------------------------------------

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────────
-- profiles — captured at gate / future auth link
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  email text not null,
  phone text not null,
  email_opt_in boolean not null default true,
  sms_opt_in boolean not null default true,
  auth_user_id uuid unique,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'End-user capture from gate; auth_user_id reserved for OTP / Magic Link migration.';
comment on column public.profiles.auth_user_id is 'Optional FK to auth.users.id when using Supabase Auth.';

-- Email lookup / dedupe (case-insensitive)
create index if not exists profiles_email_lower_idx on public.profiles (lower(email));

-- Time-series / exports (recent signups first)
create index if not exists profiles_created_at_desc_idx on public.profiles (created_at desc);

-- auth_user_id: UNIQUE implies a unique btree index automatically (profiles_auth_user_id_key).
-- quiz_sessions — one mood run per submission from /quiz
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  answers jsonb not null,
  attribute_profile jsonb not null,
  mood_key text not null,
  mood_name text not null,
  confidence_score int not null check (confidence_score >= 0 and confidence_score <= 5),
  created_at timestamptz not null default now()
);

comment on table public.quiz_sessions is 'Mood quiz output: answers, derived attributes, dominant mood.';
comment on column public.quiz_sessions.answers is 'JSON shape: {"q1":"A","q2":"B", ...}';
comment on column public.quiz_sessions.attribute_profile is 'Resolved profile for scoring / analytics.';

-- FK → profiles listing “all quizzes for profile” (already indexed implicitly for FK lookups in Postgres is not automatic — explicit below)
create index if not exists quiz_sessions_profile_id_idx on public.quiz_sessions (profile_id);

-- Timeline per profile (latest first)
create index if not exists quiz_sessions_profile_created_idx on public.quiz_sessions (profile_id, created_at desc);

-- Mood analytics dashboards
create index if not exists quiz_sessions_mood_key_idx on public.quiz_sessions (mood_key);

-- Global “recent completions”
create index if not exists quiz_sessions_created_at_desc_idx on public.quiz_sessions (created_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- feedback — optional 1 row per quiz_session (Post-MVP purchases can get own table)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  quiz_session_id uuid not null references public.quiz_sessions (id) on delete cascade,
  mood_accurate boolean not null,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now(),
  constraint feedback_one_per_session unique (quiz_session_id)
);

comment on table public.feedback is 'User feedback tied 1:1 to a completed quiz session.';

-- UNIQUE (quiz_session_id) creates backing index feedback_one_per_session automatically.

create index if not exists feedback_rating_idx on public.feedback (rating);
create index if not exists feedback_created_at_desc_idx on public.feedback (created_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- Optional FK: profiles.auth_user_id → auth.users (enable when using Supabase Auth)
-- ─────────────────────────────────────────────────────────────────────────────
-- Uncomment after switching from cookie stub to Auth:
--
-- alter table public.profiles
--   drop constraint if exists profiles_auth_user_id_fkey,
--   add constraint profiles_auth_user_id_fkey
--   foreign key (auth_user_id) references auth.users (id) on delete set null;
