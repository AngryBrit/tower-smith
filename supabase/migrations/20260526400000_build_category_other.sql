alter table public.builds
  drop constraint if exists builds_category_check;

alter table public.builds
  add constraint builds_category_check
  check (
    category is null
    or category in ('turtle', 'ehp', 'blender', 'devo', 'glass_cannon', 'hybrid', 'other')
  );
