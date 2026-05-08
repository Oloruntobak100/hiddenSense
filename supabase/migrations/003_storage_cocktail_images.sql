-- Public bucket for cocktail/recommendation images (admin uploads via service role).
insert into storage.buckets (id, name, public)
values ('cocktail-images', 'cocktail-images', true)
on conflict (id) do nothing;

-- Allow anyone to read objects (images are referenced on the public result page).
drop policy if exists "cocktail_images_public_read" on storage.objects;

create policy "cocktail_images_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'cocktail-images');
