alter table public.builds
  drop constraint if exists builds_title_check;

alter table public.builds
  add constraint builds_title_check
  check (char_length(title) >= 1 and char_length(title) <= 40);
