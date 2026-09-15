create table if not exists public.state (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.state (id) values ('main')
on conflict (id) do nothing;

alter table public.state enable row level security;

drop policy if exists state_select on public.state;
drop policy if exists state_write on public.state;

create policy state_select on public.state
  for select to anon using (true);

create policy state_write on public.state
  for all to anon using (true) with check (true);

do $$
begin
  alter publication supabase_realtime add table public.state;
exception
  when duplicate_object then null;
end $$;
