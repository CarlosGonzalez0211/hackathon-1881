-- 0401: professor decisions on derived interventions (Platform owner). Depends on 0400 (classes).
-- Interventions are recomputed from domain events; only their status is stored. Written by the
-- API with the service role. RLS is on with no policies, so clients cannot read or write it.

create table if not exists public.intervention_status (
  class_id uuid not null references public.classes (id) on delete cascade,
  intervention_id text not null,
  status text not null check (status in ('open', 'acknowledged', 'resolved')),
  -- Severity when decided; the API reopens the intervention if it later escalates.
  severity text not null check (severity in ('low', 'medium', 'high')),
  updated_by uuid references public.profiles (id),
  updated_at timestamptz not null default now(),
  primary key (class_id, intervention_id)
);

alter table public.intervention_status enable row level security;
