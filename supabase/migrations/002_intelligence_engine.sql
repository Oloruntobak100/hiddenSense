-- HiddenSense Intelligence Engine schema (v2)

create table if not exists public.cocktail_recommendations (
  id uuid primary key default gen_random_uuid(),
  cocktail_name text not null,
  alcohol_category text not null,
  mood_tags text[] not null default '{}',
  flavor_profile text not null,
  emotional_tags text[] not null default '{}',
  atmosphere_tags text[] not null default '{}',
  description text not null default '',
  square_checkout_url text not null,
  image_url text,
  food_pairings text[] not null default '{}',
  priority_score int not null default 50,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists cocktail_recommendations_active_idx on public.cocktail_recommendations (active);
create index if not exists cocktail_recommendations_priority_idx on public.cocktail_recommendations (priority_score desc);
create index if not exists cocktail_recommendations_mood_tags_idx on public.cocktail_recommendations using gin (mood_tags);

create table if not exists public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  route text not null default '/quiz',
  session_duration_seconds int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists user_sessions_profile_idx on public.user_sessions (profile_id, created_at desc);

create table if not exists public.mood_results (
  id uuid primary key default gen_random_uuid(),
  quiz_session_id uuid not null references public.quiz_sessions (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  mood_key text not null,
  mood_name text not null,
  confidence_score numeric(5,2) not null,
  secondary_mood_key text,
  secondary_mood_name text,
  emotional_profile jsonb not null,
  flavor_profile text not null,
  atmosphere_profile text not null,
  recommendation_source text not null,
  recommendation_id uuid references public.cocktail_recommendations (id) on delete set null,
  recommendation_payload jsonb not null,
  ai_reasoning text not null,
  created_at timestamptz not null default now()
);

create index if not exists mood_results_profile_idx on public.mood_results (profile_id, created_at desc);
create index if not exists mood_results_mood_key_idx on public.mood_results (mood_key);

create table if not exists public.recommendation_clicks (
  id uuid primary key default gen_random_uuid(),
  mood_result_id uuid not null references public.mood_results (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  recommendation_id uuid references public.cocktail_recommendations (id) on delete set null,
  click_type text not null default 'checkout',
  created_at timestamptz not null default now()
);

create index if not exists recommendation_clicks_result_idx on public.recommendation_clicks (mood_result_id, created_at desc);

create table if not exists public.feedback_responses (
  id uuid primary key default gen_random_uuid(),
  mood_result_id uuid not null references public.mood_results (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  response text not null check (response in ('absolutely','close_enough','not_really')),
  created_at timestamptz not null default now(),
  unique (mood_result_id)
);

create index if not exists feedback_responses_profile_idx on public.feedback_responses (profile_id, created_at desc);

create table if not exists public.mood_analytics (
  id uuid primary key default gen_random_uuid(),
  mood_result_id uuid not null references public.mood_results (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  energy_score numeric(5,2) not null,
  emotional_weight numeric(5,2) not null,
  social_score numeric(5,2) not null,
  mental_clarity numeric(5,2) not null,
  behavioral_intent numeric(5,2) not null,
  flavor_preference numeric(5,2) not null,
  atmosphere_preference numeric(5,2) not null,
  recommendation_clicked boolean not null default false,
  purchase_initiated boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists mood_analytics_profile_idx on public.mood_analytics (profile_id, created_at desc);
create index if not exists mood_analytics_mood_result_idx on public.mood_analytics (mood_result_id);
