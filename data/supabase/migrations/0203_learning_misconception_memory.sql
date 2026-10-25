-- 0203: Preserve the evidence trail for identified and resolved misconceptions.

alter table public.student_misconceptions
  add column if not exists evidence_ids uuid[] not null default '{}';
