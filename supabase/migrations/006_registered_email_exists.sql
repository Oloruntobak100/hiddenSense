-- Server-only helper: returning user exists if email matches profiles OR auth.users.
-- Granted to service_role only (used from Next.js server actions with the service key).

create or replace function public.registered_email_exists(lookup_email text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where lower(trim(p.email)) = lower(trim(lookup_email))
  )
  or exists (
    select 1
    from auth.users u
    where lower(trim(u.email)) = lower(trim(lookup_email))
  );
$$;

revoke all on function public.registered_email_exists(text) from public;
revoke all on function public.registered_email_exists(text) from anon, authenticated;
grant execute on function public.registered_email_exists(text) to service_role;
