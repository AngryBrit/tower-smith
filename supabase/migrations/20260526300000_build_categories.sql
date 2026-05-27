alter table public.builds
  add column if not exists category text;

alter table public.builds
  drop constraint if exists builds_category_check;

alter table public.builds
  add constraint builds_category_check
  check (
    category is null
    or category in ('turtle', 'ehp', 'blender', 'devo', 'glass_cannon', 'hybrid', 'other')
  );

create index if not exists builds_category_list_idx
  on public.builds (category, created_at desc, id desc)
  where deleted_at is null;
