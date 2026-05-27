alter table public.profiles
  add column if not exists playfab_id text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_playfab_id_format_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_playfab_id_format_check
      check (
        playfab_id is null
        or (
          char_length(trim(playfab_id)) >= 1
          and char_length(trim(playfab_id)) <= 64
          and upper(trim(playfab_id)) ~ '^[A-Z0-9]+$'
        )
      );
  end if;
end $$;
