-- 0504: covering indexes for content foreign keys (Content owner). Depends on 0501-0503.
-- Flagged by the Supabase performance advisor (unindexed_foreign_keys). Without them, deleting
-- a material, AI call, objective or milestone scans the referencing table to cascade.

-- Cascade from content_materials: (class_id, material_id, generation) leads with class_id, so it
-- does not cover the (material_id, class_id) key.
create index if not exists content_chunks_material_class_idx
  on public.content_chunks (material_id, class_id);

-- Cascades from content_ai_calls and profiles; flags by student also serve a future inbox filter.
create index if not exists content_ai_flags_call_idx on public.content_ai_flags (call_id);
create index if not exists content_ai_flags_student_idx on public.content_ai_flags (student_id);

-- on delete set null (material_id) from content_materials.
create index if not exists content_objectives_material_class_idx
  on public.content_objectives (material_id, class_id);

-- Link tables: each composite foreign key gets an index in its own column order. The primary
-- keys lead with chunk_id / milestone_id but stop before class_id.
create index if not exists content_chunk_objectives_chunk_class_idx
  on public.content_chunk_objectives (chunk_id, class_id);
create index if not exists content_chunk_objectives_objective_class_idx
  on public.content_chunk_objectives (objective_id, class_id);
-- Superseded by the (objective_id, class_id) index above.
drop index if exists public.content_chunk_objectives_objective_idx;

create index if not exists content_milestone_objectives_milestone_class_idx
  on public.content_milestone_objectives (milestone_id, class_id);
create index if not exists content_milestone_objectives_objective_class_idx
  on public.content_milestone_objectives (objective_id, class_id);
