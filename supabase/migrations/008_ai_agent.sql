-- AI recommendation agent configuration and per-user preference memory

alter table public.profiles
  add column if not exists ai_preference_summary text;

comment on column public.profiles.ai_preference_summary is
  'Rolling natural-language summary of user tastes and feedback for AI context.';

create table if not exists public.ai_agent_config (
  id int primary key default 1 check (id = 1),
  enabled boolean not null default false,
  system_prompt text not null,
  model text not null default 'gpt-4o-mini',
  temperature numeric(4, 2) not null default 0.70 check (temperature >= 0 and temperature <= 2),
  max_candidates int not null default 20 check (max_candidates >= 5 and max_candidates <= 50),
  history_limit int not null default 12 check (history_limit >= 3 and history_limit <= 30),
  updated_at timestamptz not null default now()
);

insert into public.ai_agent_config (id, enabled, system_prompt)
values (
  1,
  false,
  $prompt$You are HiddenSense's pairing recommendation agent for Hidden Spirits.

Select the best drink + food pairing from catalog_candidates for the user's current mood session.

You receive:
- current_session: mood, taste lane, emotional scores, alcohol policy
- user_history: past recommendations and feedback (pairing_feedback, mood accuracy, ratings, checkout clicks)
- preference_summary: rolling notes from prior visits
- avoid_recommendation_ids: listings the user disliked — never select these

Rules:
1. ONLY pick a listing from catalog_candidates using its recommendation_id.
2. Do NOT select listings in avoid_recommendation_ids or pairings the user rated "not_really".
3. Prefer flavors, moods, and categories that received "absolutely" or checkout clicks.
4. If user_history is empty, rely on current_session and catalog metadata only.
5. Write emotionalReasoning in warm, concise second-person voice (2–4 sentences).
6. Return valid JSON matching the required schema exactly.$prompt$
)
on conflict (id) do nothing;
