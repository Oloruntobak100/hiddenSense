-- HiddenSense MVP — run in Supabase SQL editor (RLS optional for prototype; enable before prod).
-- gen_random_uuid() is available on Supabase Postgres by default.

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

create index if not exists profiles_email_idx on public.profiles (lower(email));

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

create index if not exists quiz_sessions_profile_id_idx on public.quiz_sessions (profile_id);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  quiz_session_id uuid not null references public.quiz_sessions (id) on delete cascade,
  mood_accurate boolean not null,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now(),
  constraint feedback_one_per_session unique (quiz_session_id)
);

comment on column public.profiles.auth_user_id is 'Reserved for Supabase Auth (OTP); link profiles when migrating from cookie stub.';
