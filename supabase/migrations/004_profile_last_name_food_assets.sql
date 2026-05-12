-- Profile last name + admin food display columns

alter table public.profiles
  add column if not exists last_name text not null default '';

alter table public.cocktail_recommendations
  add column if not exists food_name text,
  add column if not exists food_image_url text;

comment on column public.profiles.last_name is 'Optional family name from auth user_metadata.';
comment on column public.cocktail_recommendations.food_name is 'Primary food pairing label for result UI.';
comment on column public.cocktail_recommendations.food_image_url is 'Public URL for food hero image.';
