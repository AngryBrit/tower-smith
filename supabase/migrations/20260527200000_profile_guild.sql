alter table public.profiles
  add column if not exists guild text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_guild_len_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_guild_len_check
      check (guild is null or (char_length(trim(guild)) >= 1 and char_length(trim(guild)) <= 40));
  end if;
end $$;
