-- Editable quiz copy (prompts, scale labels, taste options, section headers)

create table if not exists public.quiz_content_config (
  id int primary key default 1 check (id = 1),
  content jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.quiz_content_config (id, content)
values (1, '{}'::jsonb)
on conflict (id) do nothing;
