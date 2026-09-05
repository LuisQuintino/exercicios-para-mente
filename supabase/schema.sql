-- Rode este script no SQL Editor do painel do Supabase (Project > SQL Editor).

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_id text not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists entries_user_exercise_idx
  on public.entries (user_id, exercise_id, created_at desc);

alter table public.entries enable row level security;

create policy "Usuários veem apenas seus registros"
  on public.entries for select
  using (auth.uid() = user_id);

create policy "Usuários inserem apenas seus registros"
  on public.entries for insert
  with check (auth.uid() = user_id);

create policy "Usuários apagam apenas seus registros"
  on public.entries for delete
  using (auth.uid() = user_id);
