-- Community build upvotes (one per user per build)

alter table public.builds
  add column if not exists upvote_count integer not null default 0
    check (upvote_count >= 0);

create table if not exists public.build_votes (
  build_id uuid not null references public.builds (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (build_id, user_id)
);

create index if not exists build_votes_user_idx
  on public.build_votes (user_id, build_id);

create index if not exists builds_top_list_idx
  on public.builds (upvote_count desc, created_at desc, id desc)
  where deleted_at is null;

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

alter table public.build_votes enable row level security;

-- Votes are written only via Netlify Functions (service role).
