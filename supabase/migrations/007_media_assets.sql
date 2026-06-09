-- Admin media library for drink/food images (CMS-style asset store).

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  slug text not null,
  public_url text not null,
  storage_path text not null,
  kind text not null default 'general' check (kind in ('drink', 'food', 'general')),
  created_at timestamptz not null default now(),
  constraint media_assets_slug_unique unique (slug)
);

create index if not exists media_assets_slug_idx on public.media_assets (slug);
create index if not exists media_assets_kind_idx on public.media_assets (kind);
create index if not exists media_assets_created_idx on public.media_assets (created_at desc);

comment on table public.media_assets is 'CMS media library; listings reference public_url on cocktail_recommendations.';
comment on column public.media_assets.slug is 'Unique slug for CSV bulk import linking (drink_image_slug / food_image_slug).';
