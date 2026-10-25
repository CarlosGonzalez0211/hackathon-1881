-- 0502: chunks, embeddings and retrieval (Content owner). Depends on 0500 (vector) and 0501.
-- Not applied anywhere yet. Service role only: students reach chunks through the guarded chat.

create table if not exists public.content_chunks (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null,
  class_id uuid not null,
  generation integer not null check (generation > 0),
  chunk_index integer not null check (chunk_index between 0 and 1999),
  page_start integer check (page_start > 0),
  page_end integer check (page_end >= page_start),
  section_title text check (char_length(section_title) <= 300),
  content text not null check (char_length(content) between 1 and 12000),
  content_hash text not null check (content_hash ~ '^[0-9a-f]{64}$'),
  token_estimate integer not null check (token_estimate > 0),
  -- Filled batch by batch; a generation is activated only when every row has one.
  embedding extensions.vector(768),
  embedding_model text,
  created_at timestamptz not null default now(),
  check ((embedding is null) = (embedding_model is null)),
  -- The chunk's class always equals its material's class, which is what retrieval filters on.
  foreign key (material_id, class_id)
    references public.content_materials (id, class_id) on delete cascade,
  unique (material_id, generation, chunk_index),
  unique (id, class_id)
);

-- Exact scan per class (a class holds at most a few thousand chunks), so filtering by class
-- never loses recall the way a filtered HNSW search can. Add HNSW only if classes grow large.
create index if not exists content_chunks_class_idx
  on public.content_chunks (class_id, material_id, generation);
-- Reuse embeddings of unchanged text when a material is rebuilt.
create index if not exists content_chunks_hash_idx
  on public.content_chunks (material_id, content_hash, embedding_model);

create table if not exists public.content_chunk_objectives (
  chunk_id uuid not null,
  objective_id uuid not null,
  class_id uuid not null,
  primary key (chunk_id, objective_id),
  foreign key (chunk_id, class_id)
    references public.content_chunks (id, class_id) on delete cascade,
  foreign key (objective_id, class_id)
    references public.content_objectives (id, class_id) on delete cascade
);

create index if not exists content_chunk_objectives_objective_idx
  on public.content_chunk_objectives (objective_id);

alter table public.content_chunks enable row level security;
alter table public.content_chunk_objectives enable row level security;
revoke all on public.content_chunks, public.content_chunk_objectives from anon, authenticated;

-- Top chunks of the class's live generations, optionally limited to one topic. p_class_id must
-- come from a route the API has already authorized. Invoker rights: only the service role may
-- call it, and it bypasses RLS anyway.
create or replace function public.content_match_chunks(
  p_class_id uuid,
  p_query extensions.vector,
  p_model text,
  p_topic_id uuid default null,
  p_limit integer default 6,
  p_min_similarity double precision default 0
) returns table (
  chunk_id uuid,
  material_id uuid,
  material_title text,
  page_start integer,
  page_end integer,
  section_title text,
  content text,
  similarity double precision
)
language sql stable set search_path = ''
as $$
  select c.id, c.material_id, m.title, c.page_start, c.page_end, c.section_title, c.content,
         1 - (c.embedding operator(extensions.<=>) p_query) as similarity
  from public.content_chunks c
  join public.content_materials m on m.id = c.material_id and m.class_id = c.class_id
  where c.class_id = p_class_id
    and c.generation = m.active_generation
    and c.embedding_model = p_model
    and (
      p_topic_id is null
      or exists (
        select 1 from public.content_material_topics t
        where t.material_id = c.material_id and t.topic_id = p_topic_id
      )
    )
    and 1 - (c.embedding operator(extensions.<=>) p_query) >= p_min_similarity
  order by c.embedding operator(extensions.<=>) p_query
  limit least(greatest(p_limit, 1), 20)
$$;

-- Makes a fully embedded generation live and drops the older ones in one transaction.
create or replace function public.content_activate_generation(
  p_material_id uuid,
  p_generation integer
) returns void
language plpgsql volatile set search_path = ''
as $$
declare
  total integer;
  missing integer;
begin
  select count(*), count(*) filter (where embedding is null)
  into total, missing
  from public.content_chunks
  where material_id = p_material_id and generation = p_generation;

  if total = 0 then
    raise exception 'generation % of material % has no chunks', p_generation, p_material_id;
  end if;
  if missing > 0 then
    raise exception 'generation % of material % has % chunks without embeddings',
      p_generation, p_material_id, missing;
  end if;

  update public.content_materials
  set active_generation = p_generation,
      building_generation = null,
      status = 'ready',
      error_code = null,
      error_message = null,
      chunks_total = total,
      chunks_embedded = total,
      claimed_at = null,
      processed_at = now(),
      updated_at = now()
  where id = p_material_id and building_generation = p_generation;

  if not found then
    raise exception 'material % is not building generation %', p_material_id, p_generation;
  end if;

  delete from public.content_chunks
  where material_id = p_material_id and generation <> p_generation;
end;
$$;

revoke all on function public.content_match_chunks(
  uuid, extensions.vector, text, uuid, integer, double precision
) from public, anon, authenticated;
revoke all on function public.content_activate_generation(uuid, integer)
  from public, anon, authenticated;
grant execute on function public.content_match_chunks(
  uuid, extensions.vector, text, uuid, integer, double precision
) to service_role;
grant execute on function public.content_activate_generation(uuid, integer) to service_role;
