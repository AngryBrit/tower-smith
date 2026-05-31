-- TowerSmith community gallery — canonical schema (fresh Supabase project).
-- Run once in the Supabase SQL editor. Incremental local changes: supabase/migrations/ (gitignored).

create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  playfab_id text,
  guild_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_playfab_id_format_check check (
    playfab_id is null
    or (
      char_length(trim(playfab_id)) >= 1
      and char_length(trim(playfab_id)) <= 64
      and upper(trim(playfab_id)) ~ '^[A-Z0-9]+$'
    )
  ),
  constraint profiles_guild_id_format_check check (
    guild_id is null
    or (
      char_length(trim(guild_id)) >= 1
      and char_length(trim(guild_id)) <= 40
      and trim(guild_id) ~ '^[A-Za-z0-9_-]+$'
    )
  )
);

create table if not exists public.builds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  storage_path text not null,
  category text,
  upvote_count integer not null default 0,
  visibility text not null default 'public',
  guild text,
  created_at timestamptz not null default now(),
  constraint builds_title_check check (char_length(title) >= 1 and char_length(title) <= 40),
  constraint builds_category_check check (
    category is null
    or category in ('turtle', 'ehp', 'blender', 'devo', 'glass_cannon', 'hybrid', 'other')
  ),
  constraint builds_upvote_count_check check (upvote_count >= 0),
  constraint builds_visibility_check check (visibility in ('public', 'unlisted')),
  constraint builds_guild_len_check check (
    guild is null
    or (char_length(trim(guild)) >= 1 and char_length(trim(guild)) <= 40)
  )
);

create table if not exists public.build_votes (
  build_id uuid not null references public.builds (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (build_id, user_id)
);

create table if not exists public.guild_identities (
  guild_id text primary key,
  guild_name text not null,
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint guild_identities_guild_id_len_check check (
    char_length(trim(guild_id)) >= 1 and char_length(trim(guild_id)) <= 40
  ),
  constraint guild_identities_guild_name_len_check check (
    char_length(trim(guild_name)) >= 1 and char_length(trim(guild_name)) <= 40
  )
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists builds_list_idx
  on public.builds (created_at desc, id desc);

create index if not exists builds_title_trgm_idx
  on public.builds using gin (title gin_trgm_ops);

create index if not exists builds_user_idx
  on public.builds (user_id, created_at desc);

create index if not exists builds_category_list_idx
  on public.builds (category, created_at desc, id desc);

create index if not exists builds_top_list_idx
  on public.builds (upvote_count desc, created_at desc, id desc);

create index if not exists build_votes_user_idx
  on public.build_votes (user_id, build_id);

create unique index if not exists profiles_display_name_lower_unique_idx
  on public.profiles (lower(trim(display_name)))
  where display_name is not null
    and trim(display_name) <> '';

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.builds enable row level security;
alter table public.build_votes enable row level security;
alter table public.guild_identities enable row level security;

drop policy if exists builds_select_public on public.builds;
create policy builds_select_public
  on public.builds
  for select
  using (visibility = 'public');

drop policy if exists profiles_select_public on public.profiles;
create policy profiles_select_public
  on public.profiles
  for select
  using (true);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles
  for update
  using (auth.uid() = id);

drop policy if exists guild_identities_select_all on public.guild_identities;
create policy guild_identities_select_all
  on public.guild_identities
  for select
  using (true);

-- Votes are written only via Netlify Functions (service role).

-- ---------------------------------------------------------------------------
-- Auth: auto-create profile on sign-up
-- ---------------------------------------------------------------------------

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

-- ---------------------------------------------------------------------------
-- Build upvote counter (maintained by triggers on build_votes)
-- ---------------------------------------------------------------------------

create or replace function public.sync_build_upvote_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'INSERT' then
    update public.builds
    set upvote_count = upvote_count + 1
    where id = NEW.build_id;
  elsif TG_OP = 'DELETE' then
    update public.builds
    set upvote_count = greatest(0, upvote_count - 1)
    where id = OLD.build_id;
  end if;
  return null;
end;
$$;

drop trigger if exists build_votes_count_insert on public.build_votes;
create trigger build_votes_count_insert
  after insert on public.build_votes
  for each row
  execute function public.sync_build_upvote_count();

drop trigger if exists build_votes_count_delete on public.build_votes;
create trigger build_votes_count_delete
  after delete on public.build_votes
  for each row
  execute function public.sync_build_upvote_count();

-- ---------------------------------------------------------------------------
-- Storage: user avatars (public read; users manage files under their folder)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  524288,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read
  on storage.objects
  for select
  using (bucket_id = 'avatars');

drop policy if exists avatars_insert_own on storage.objects;
create policy avatars_insert_own
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists avatars_update_own on storage.objects;
create policy avatars_update_own
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists avatars_delete_own on storage.objects;
create policy avatars_delete_own
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ---------------------------------------------------------------------------
-- Optional seed data
-- ---------------------------------------------------------------------------

insert into public.guild_identities (guild_id, guild_name, source)
values ('NTQDF9', 'UK BOYS', 'seed')
on conflict (guild_id) do update
set guild_name = excluded.guild_name,
    source = excluded.source,
    updated_at = now();

-- ---------------------------------------------------------------------------
-- Manual step (Dashboard): create a **public** storage bucket `tower-payloads`
-- for LabsShareFile JSON. Uploads use the service role from Netlify Functions.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Upgrade (existing project that used soft delete): run once in SQL editor.
-- ---------------------------------------------------------------------------
-- delete from public.builds where deleted_at is not null;
-- alter table public.builds drop column if exists deleted_at;
-- drop index if exists public.builds_list_idx;
-- drop index if exists public.builds_title_trgm_idx;
-- drop index if exists public.builds_user_idx;
-- drop index if exists public.builds_category_list_idx;
-- drop index if exists public.builds_top_list_idx;
-- create index if not exists builds_list_idx on public.builds (created_at desc, id desc);
-- create index if not exists builds_title_trgm_idx on public.builds using gin (title gin_trgm_ops);
-- create index if not exists builds_user_idx on public.builds (user_id, created_at desc);
-- create index if not exists builds_category_list_idx on public.builds (category, created_at desc, id desc);
-- create index if not exists builds_top_list_idx on public.builds (upvote_count desc, created_at desc, id desc);
-- drop policy if exists builds_select_public on public.builds;
-- create policy builds_select_public on public.builds for select using (visibility = 'public');
