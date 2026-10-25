-- 0200: Adaptive Learning and Assessment (Daniela / P2).
-- Depends on Platform profiles (0001) and Curriculum courses/topics (0100 range).
-- Direct client access is denied by RLS; the backend service role enforces enrollment/role checks.

create table if not exists public.learning_concepts (
  concept_id text primary key,
  course_id uuid not null references public.courses(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  title text not null,
  description text,
  prerequisite_concept_ids text[] not null default '{}',
  required_for_mastery boolean not null default true,
  curriculum_version integer not null check (curriculum_version > 0),
  unique (course_id, topic_id, concept_id)
);

create table if not exists public.learning_questions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  concept_id text not null references public.learning_concepts(concept_id) on delete cascade,
  purpose text not null check (purpose in ('diagnostic', 'checkpoint', 'retention')),
  prompt text not null,
  format text not null check (format in ('numeric', 'multiple_choice', 'short_text')),
  choices jsonb,
  difficulty numeric(5,4) not null check (difficulty between 0 and 1),
  required_for_mastery boolean not null default true,
  is_transfer boolean not null default false,
  answer_key jsonb not null,
  partial_credit_answers jsonb not null default '{}'::jsonb,
  misconception_answers jsonb not null default '{}'::jsonb,
  strategy_context_key text not null,
  active boolean not null default true
);

create table if not exists public.diagnostic_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  result jsonb not null,
  completed_at timestamptz not null
);

create table if not exists public.checkpoint_evidence (
  id uuid primary key,
  submission_id text,
  student_id uuid not null references public.profiles(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  concept_id text not null references public.learning_concepts(concept_id),
  question_id uuid not null references public.learning_questions(id),
  correct boolean not null,
  score numeric(5,4) not null check (score between 0 and 1),
  difficulty numeric(5,4) not null check (difficulty between 0 and 1),
  strategy text not null,
  hint_count integer not null default 0 check (hint_count >= 0),
  evidence_eligible boolean not null,
  misconception_resolved boolean not null,
  submitted_at timestamptz not null,
  result jsonb,
  unique nulls not distinct (student_id, submission_id)
);

create table if not exists public.student_topic_mastery (
  student_id uuid not null references public.profiles(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  mastery numeric(5,4) not null check (mastery between 0 and 1),
  demonstrated_concept_ids text[] not null default '{}',
  evidence_ids uuid[] not null default '{}',
  confidence numeric(5,4) not null check (confidence between 0 and 1),
  updated_at timestamptz not null,
  primary key (student_id, topic_id)
);

create table if not exists public.student_concept_knowledge (
  student_id uuid not null references public.profiles(id) on delete cascade,
  concept_id text not null references public.learning_concepts(concept_id),
  probability_known numeric(5,4) not null check (probability_known between 0 and 1),
  evidence_count integer not null default 0 check (evidence_count >= 0),
  updated_at timestamptz not null,
  primary key (student_id, concept_id)
);

create table if not exists public.student_misconceptions (
  student_id uuid not null references public.profiles(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  misconception_id text not null,
  active boolean not null default true,
  identified_at timestamptz not null default now(),
  resolved_at timestamptz,
  primary key (student_id, topic_id, misconception_id)
);

create table if not exists public.strategy_posteriors (
  student_id uuid not null references public.profiles(id) on delete cascade,
  context_key text not null,
  strategy text not null,
  alpha numeric not null check (alpha > 0),
  beta numeric not null check (beta > 0),
  observations integer not null default 0 check (observations >= 0),
  primary key (student_id, context_key, strategy)
);

create table if not exists public.strategy_observations (
  id uuid primary key,
  student_id uuid not null references public.profiles(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  concept_id text not null references public.learning_concepts(concept_id),
  payload jsonb not null,
  observed_at timestamptz not null
);

create table if not exists public.retention_schedules (
  student_id uuid not null references public.profiles(id) on delete cascade,
  concept_id text not null references public.learning_concepts(concept_id),
  successful_recall_streak integer not null default 0 check (successful_recall_streak >= 0),
  interval_days integer not null check (interval_days > 0),
  due_at timestamptz not null,
  primary key (student_id, concept_id)
);

create table if not exists public.retention_evidence (
  id uuid primary key,
  submission_id text,
  student_id uuid not null references public.profiles(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  concept_id text not null references public.learning_concepts(concept_id),
  question_id uuid not null references public.learning_questions(id),
  correct boolean not null,
  score numeric(5,4) not null check (score between 0 and 1),
  scheduled_for timestamptz not null,
  checked_at timestamptz not null,
  result jsonb,
  unique nulls not distinct (student_id, submission_id)
);

create table if not exists public.student_learning_preferences (
  student_id uuid primary key references public.profiles(id) on delete cascade,
  preferences jsonb not null,
  updated_at timestamptz not null
);

create table if not exists public.teacher_topic_priorities (
  course_id uuid not null references public.courses(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  priority numeric(5,4) not null check (priority between 0 and 1),
  updated_at timestamptz not null default now(),
  primary key (course_id, topic_id)
);

create table if not exists public.learning_sessions (
  id uuid primary key,
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  concept_id text not null references public.learning_concepts(concept_id),
  objective text not null,
  strategy text not null,
  curriculum_version integer not null check (curriculum_version > 0),
  status text not null check (status in ('active', 'unsupported', 'completed')),
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table if not exists public.tutor_messages (
  id uuid primary key,
  session_id uuid not null references public.learning_sessions(id) on delete cascade,
  role text not null check (role in ('student', 'tutor')),
  content text not null,
  strategy text,
  citations jsonb not null default '[]'::jsonb,
  curriculum_version integer not null check (curriculum_version > 0),
  source_ids uuid[] not null default '{}',
  unsupported boolean not null default false,
  created_at timestamptz not null
);

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'learning_concepts', 'learning_questions', 'diagnostic_attempts', 'checkpoint_evidence',
    'student_topic_mastery', 'student_concept_knowledge', 'student_misconceptions',
    'strategy_posteriors', 'strategy_observations', 'retention_schedules',
    'retention_evidence', 'student_learning_preferences', 'teacher_topic_priorities',
    'learning_sessions', 'tutor_messages'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on public.%I from anon, authenticated', table_name);
  end loop;
end $$;
