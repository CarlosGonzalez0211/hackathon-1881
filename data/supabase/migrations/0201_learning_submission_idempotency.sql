-- 0201: Submission idempotency and retry safety.
-- Optional submission ids must be reusable only when absent; a provided id is unique per student.

alter table public.checkpoint_evidence
  drop constraint if exists checkpoint_evidence_student_id_submission_id_key;

alter table public.retention_evidence
  drop constraint if exists retention_evidence_student_id_submission_id_key;

create unique index if not exists checkpoint_evidence_submission_once_idx
  on public.checkpoint_evidence (student_id, submission_id)
  where submission_id is not null;

create unique index if not exists retention_evidence_submission_once_idx
  on public.retention_evidence (student_id, submission_id)
  where submission_id is not null;
