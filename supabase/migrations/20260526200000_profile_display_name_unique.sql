-- Case-insensitive unique usernames (display_name).

-- Resolve existing duplicates before adding the index (keep earliest profile per name).
with ranked as (
  select
    id,
    display_name,
    row_number() over (
      partition by lower(trim(display_name))
      order by created_at asc, id asc
    ) as rn
  from public.profiles
  where display_name is not null
    and trim(display_name) <> ''
)
update public.profiles as p
set
  display_name = left(trim(p.display_name), 35) || '-' || substr(p.id::text, 1, 4),
  updated_at = now()
from ranked as r
where p.id = r.id
  and r.rn > 1;

create unique index if not exists profiles_display_name_lower_unique_idx
  on public.profiles (lower(trim(display_name)))
  where display_name is not null
    and trim(display_name) <> '';
