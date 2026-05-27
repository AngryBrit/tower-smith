-- profiles.guild (readable name) replaced by profiles.guild_id + guild_identities lookup.

alter table public.profiles
  drop constraint if exists profiles_guild_len_check;

alter table public.profiles
  drop column if exists guild;
