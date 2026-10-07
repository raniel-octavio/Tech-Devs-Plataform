-- =====================================================================
--  TECH DEVS BOARD — schema do Supabase
--  Cole tudo no SQL Editor do Supabase e clique em "Run".
--  Pode ser executado mais de uma vez com segurança.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- PERFIS (membros da equipe) --------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_color text default '#2F7BFF',
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, avatar_color)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1)),
    new.email,
    (array['#2F7BFF','#FF8A1F','#22D3EE','#A78BFA','#34D399','#F472B6'])[1 + floor(random() * 6)::int]
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Garante perfil para usuários que já existiam antes deste script
insert into public.profiles (id, full_name, email)
select u.id, coalesce(nullif(u.raw_user_meta_data->>'full_name', ''), split_part(u.email, '@', 1)), u.email
from auth.users u
on conflict (id) do nothing;

-- ---------- PROJETOS ---------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key ~ '^[A-Z0-9]{2,6}$'),
  name text not null,
  description text,
  task_counter integer not null default 0,
  created_by uuid default auth.uid() references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------- SPRINTS ----------------------------------------------------
create table if not exists public.sprints (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  goal text,
  start_date date,
  end_date date,
  status text not null default 'planned' check (status in ('planned','active','closed')),
  created_at timestamptz not null default now()
);

-- ---------- TAREFAS ----------------------------------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  number integer not null default 0,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('backlog','todo','in_progress','review','done')),
  priority text not null default 'medium' check (priority in ('lowest','low','medium','high','highest')),
  type text not null default 'task' check (type in ('task','bug','story','epic')),
  assignee_id uuid references public.profiles(id) on delete set null,
  reporter_id uuid default auth.uid() references public.profiles(id) on delete set null,
  sprint_id uuid references public.sprints(id) on delete set null,
  story_points integer check (story_points is null or story_points >= 0),
  due_date date,
  labels text[] not null default '{}',
  position double precision not null default 1000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_project_idx on public.tasks(project_id);
create index if not exists tasks_assignee_idx on public.tasks(assignee_id);
create index if not exists tasks_sprint_idx on public.tasks(sprint_id);

-- Numeração sequencial por projeto (TDV-1, TDV-2, ...)
create or replace function public.set_task_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.projects
     set task_counter = task_counter + 1
   where id = new.project_id
  returning task_counter into new.number;
  return new;
end;
$$;

drop trigger if exists tasks_set_number on public.tasks;
create trigger tasks_set_number
  before insert on public.tasks
  for each row execute function public.set_task_number();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_touch_updated_at on public.tasks;
create trigger tasks_touch_updated_at
  before update on public.tasks
  for each row execute function public.touch_updated_at();

-- ---------- COMENTÁRIOS ------------------------------------------------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  author_id uuid default auth.uid() references public.profiles(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_task_idx on public.comments(task_id);

-- =====================================================================
--  SEGURANÇA (RLS)
--  A anon key fica pública no front-end; quem protege os dados é o RLS.
--  Regra: só usuários LOGADOS leem e escrevem. Visitantes não acessam nada.
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.sprints  enable row level security;
alter table public.tasks    enable row level security;
alter table public.comments enable row level security;

drop policy if exists "profiles_select" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_select" on public.profiles
  for select to authenticated using (true);
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "projects_all" on public.projects;
create policy "projects_all" on public.projects
  for all to authenticated using (true) with check (true);

drop policy if exists "sprints_all" on public.sprints;
create policy "sprints_all" on public.sprints
  for all to authenticated using (true) with check (true);

drop policy if exists "tasks_all" on public.tasks;
create policy "tasks_all" on public.tasks
  for all to authenticated using (true) with check (true);

drop policy if exists "comments_select" on public.comments;
drop policy if exists "comments_insert" on public.comments;
drop policy if exists "comments_delete_own" on public.comments;
create policy "comments_select" on public.comments
  for select to authenticated using (true);
create policy "comments_insert" on public.comments
  for insert to authenticated with check (author_id = auth.uid());
create policy "comments_delete_own" on public.comments
  for delete to authenticated using (author_id = auth.uid());

-- ---------- REALTIME (atualiza o quadro de todo mundo ao vivo) ---------
do $$
declare t text;
begin
  foreach t in array array['projects','sprints','tasks','comments','profiles'] loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;
