create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,24}$'),
  role text not null check (role in ('admin', 'student')),
  created_at timestamptz not null default now()
);

create table sectors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order int not null default 0
);

create table units (
  id uuid primary key default gen_random_uuid(),
  sector_id uuid not null references sectors on delete cascade,
  title text not null,
  description text not null default '',
  sort_order int not null default 0
);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references units on delete cascade,
  title text not null,
  description text not null default '',
  youtube_url text not null,
  youtube_id text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table lesson_blocks (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons on delete cascade,
  type text not null check (type in ('note', 'code', 'link')),
  title text,
  body text,
  language text,
  url text,
  sort_order int not null default 0
);

create table quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null unique references lessons on delete cascade,
  status text not null check (status in ('ready', 'no_captions', 'failed')),
  questions jsonb not null default '[]'::jsonb,
  error text,
  created_at timestamptz not null default now()
);

create index units_sector_sort_idx on units (sector_id, sort_order);
create index lessons_unit_sort_idx on lessons (unit_id, sort_order);
create index lesson_blocks_lesson_sort_idx on lesson_blocks (lesson_id, sort_order);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table profiles enable row level security;
alter table sectors enable row level security;
alter table units enable row level security;
alter table lessons enable row level security;
alter table lesson_blocks enable row level security;
alter table quizzes enable row level security;

create policy "profiles_select_own" on profiles
  for select to authenticated using (id = auth.uid());

create policy "sectors_select_all" on sectors
  for select to authenticated using (true);
create policy "sectors_insert_admin" on sectors
  for insert to authenticated with check (public.is_admin());
create policy "sectors_update_admin" on sectors
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "sectors_delete_admin" on sectors
  for delete to authenticated using (public.is_admin());

create policy "units_select_all" on units
  for select to authenticated using (true);
create policy "units_insert_admin" on units
  for insert to authenticated with check (public.is_admin());
create policy "units_update_admin" on units
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "units_delete_admin" on units
  for delete to authenticated using (public.is_admin());

create policy "lessons_select_all" on lessons
  for select to authenticated using (true);
create policy "lessons_insert_admin" on lessons
  for insert to authenticated with check (public.is_admin());
create policy "lessons_update_admin" on lessons
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "lessons_delete_admin" on lessons
  for delete to authenticated using (public.is_admin());

create policy "lesson_blocks_select_all" on lesson_blocks
  for select to authenticated using (true);
create policy "lesson_blocks_insert_admin" on lesson_blocks
  for insert to authenticated with check (public.is_admin());
create policy "lesson_blocks_update_admin" on lesson_blocks
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "lesson_blocks_delete_admin" on lesson_blocks
  for delete to authenticated using (public.is_admin());

create policy "quizzes_select_all" on quizzes
  for select to authenticated using (true);
create policy "quizzes_insert_admin" on quizzes
  for insert to authenticated with check (public.is_admin());
create policy "quizzes_update_admin" on quizzes
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "quizzes_delete_admin" on quizzes
  for delete to authenticated using (public.is_admin());

insert into sectors (slug, name, sort_order)
values ('ai', 'AI', 1), ('robotics', 'Robotics', 2), ('python', 'Python', 3)
on conflict (slug) do nothing;
