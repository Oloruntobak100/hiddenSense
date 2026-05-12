-- Persist age band for recommendations (survives cookie expiry after signup).

alter table public.profiles
  add column if not exists alcohol_policy text not null default 'adult'
    check (alcohol_policy in ('adult', 'minor'));

comment on column public.profiles.alcohol_policy is
  'Age band for pairing engine: adult (21+) or minor (under 21). Synced from auth user_metadata and used for recommendations.';
