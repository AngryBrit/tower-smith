-- Harden tower-payloads: private bucket, JSON only, 512 KB limit.
-- Run once in Supabase SQL editor on existing projects that created the bucket as public.
-- Safe to re-run (idempotent).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tower-payloads',
  'tower-payloads',
  false,
  524288,
  array['application/json']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- No storage.objects policies: only the service role (Netlify Functions) can access files.
