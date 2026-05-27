-- TowerSmith community gallery (run in Supabase SQL editor or via CLI)

create extension if not exists pg_trgm;

-- Public profile per auth user
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.builds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) >= 1 and char_length(title) <= 80),
  storage_path text not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index builds_list_idx
  on public.builds (created_at desc, id desc)
  where deleted_at is null;

create index builds_title_trgm_idx
  on public.builds using gin (title gin_trgm_ops)
  where deleted_at is null;

create index builds_user_idx
  on public.builds (user_id, created_at desc)
  where deleted_at is null;

alter table public.profiles enable row level security;
alter table public.builds enable row level security;

-- Anonymous + logged-in users can browse public builds
create policy builds_select_public
  on public.builds
  for select
  using (deleted_at is null);

create policy profiles_select_public
  on public.profiles
  for select
  using (true);

-- Users can read/update their own profile
create policy profiles_update_own
  on public.profiles
  for update
  using (auth.uid() = id);

-- New auth users get a profile row
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
      nullif(trim(new.raw_user_meta_data->>'name'), ''),
      nullif(trim(new.raw_user_meta_data->>'user_name'), ''),
      split_part(coalesce(new.email, 'player'), '@', 1)
    ),
    nullif(trim(new.raw_user_meta_data->>'avatar_url'), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Storage bucket for LabsShareFile JSON (create bucket "tower-payloads" as public read in Dashboard)
-- Policy: public read, authenticated upload via service role from Netlify Functions only.
