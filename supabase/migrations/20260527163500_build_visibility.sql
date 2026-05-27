alter table public.builds
  add column if not exists visibility text not null default 'public';

update public.builds
set visibility = 'public'
where visibility is null;

alter table public.builds
  drop constraint if exists builds_visibility_check;

alter table public.builds
  add constraint builds_visibility_check
  check (visibility in ('public', 'unlisted'));

drop policy if exists builds_select_public on public.builds;

create policy builds_select_public
  on public.builds
  for select
  using (deleted_at is null and visibility = 'public');
