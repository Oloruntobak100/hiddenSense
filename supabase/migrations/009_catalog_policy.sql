-- Catalog policy: which alcohol categories minors may receive in recommendations

create table if not exists public.catalog_policy_config (
  id int primary key default 1 check (id = 1),
  minor_allowed_categories text[] not null default array['Non-alcoholic']::text[],
  updated_at timestamptz not null default now()
);

insert into public.catalog_policy_config (id, minor_allowed_categories)
values (1, array['Non-alcoholic']::text[])
on conflict (id) do nothing;
