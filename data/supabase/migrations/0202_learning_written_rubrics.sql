-- 0202: Deterministic short-text rubric features.

alter table public.learning_questions
  add column if not exists rubric_features jsonb not null default '[]'::jsonb,
  add column if not exists passing_score numeric(5,4)
    check (passing_score between 0 and 1);
