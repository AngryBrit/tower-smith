alter table public.builds
  add column if not exists guild text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'builds_guild_len_check'
      and conrelid = 'public.builds'::regclass
  ) then
    alter table public.builds
      add constraint builds_guild_len_check
      check (guild is null or (char_length(trim(guild)) >= 1 and char_length(trim(guild)) <= 40));
  end if;
end $$;
