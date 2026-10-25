-- 0500: pgvector and the private bucket for original class material (Content owner).
-- Not applied anywhere yet. See docs/CONTENT_RAG.md.

create extension if not exists vector with schema extensions;

-- Private bucket. Files reach it only through server-issued signed upload URLs for a
-- server-chosen path ({class_id}/{sha256}); professors download through 60 s signed URLs.
-- No storage.objects policies are created, so no client can list, read or write it directly.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'content-materials',
  'content-materials',
  false,
  20971520,
  array['application/pdf', 'text/plain', 'text/markdown']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
