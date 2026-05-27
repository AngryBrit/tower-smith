create table if not exists public.guild_identities (
  guild_id text primary key,
  guild_name text not null,
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint guild_identities_guild_id_len_check check (char_length(trim(guild_id)) >= 1 and char_length(trim(guild_id)) <= 40),
  constraint guild_identities_guild_name_len_check check (char_length(trim(guild_name)) >= 1 and char_length(trim(guild_name)) <= 40)
);

alter table public.guild_identities enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'guild_identities'
      and policyname = 'guild_identities_select_all'
  ) then
    create policy guild_identities_select_all
      on public.guild_identities
      for select
      using (true);
  end if;
end $$;

insert into public.guild_identities (guild_id, guild_name, source)
values ('NTQDF9', 'UK BOYS', 'seed')
on conflict (guild_id) do update
set guild_name = excluded.guild_name,
    source = excluded.source,
    updated_at = now();
