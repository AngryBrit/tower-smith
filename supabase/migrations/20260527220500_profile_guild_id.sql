alter table public.profiles
  add column if not exists guild_id text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_guild_id_format_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_guild_id_format_check
      check (
        guild_id is null
        or (
          char_length(trim(guild_id)) >= 1
          and char_length(trim(guild_id)) <= 40
          and trim(guild_id) ~ '^[A-Za-z0-9_-]+$'
        )
      );
  end if;
end $$;
