-- 0503: AI call audit, daily cap and the professor's flag inbox (Content owner).
-- Depends on 0001 and 0400. Not applied anywhere yet. Service role only. No message text is
-- stored except a short excerpt on some flags.

create table if not exists public.content_ai_calls (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  topic_id uuid,
  kind text not null check (kind in ('chat')),
  -- 'pending' between content_begin_ai_call and the API recording the result.
  outcome text not null check (outcome in (
    'pending', 'answered', 'abstained', 'redirected', 'refused', 'rate_limited', 'error'
  )),
  flag_category text check (flag_category in (
    'graded_work', 'prompt_injection', 'off_topic', 'unsafe', 'self_harm'
  )),
  model text,
  latency_ms integer check (latency_ms >= 0),
  created_at timestamptz not null default now()
);

create index if not exists content_ai_calls_student_idx
  on public.content_ai_calls (student_id, created_at desc);
create index if not exists content_ai_calls_class_idx
  on public.content_ai_calls (class_id, created_at desc);

create table if not exists public.content_ai_flags (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null references public.content_ai_calls (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  topic_id uuid,
  category text not null check (category in (
    'graded_work', 'prompt_injection', 'off_topic', 'unsafe', 'self_harm'
  )),
  action text not null check (action in ('refused', 'redirected')),
  excerpt text check (char_length(excerpt) <= 280),
  locale text not null check (locale in ('en', 'es')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '90 days',
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id),
  -- Self-harm flags never keep the student's words.
  check (category <> 'self_harm' or excerpt is null)
);

create index if not exists content_ai_flags_class_idx
  on public.content_ai_flags (class_id, created_at desc);
create index if not exists content_ai_flags_expires_idx on public.content_ai_flags (expires_at);

alter table public.content_ai_calls enable row level security;
alter table public.content_ai_flags enable row level security;
revoke all on public.content_ai_calls, public.content_ai_flags from anon, authenticated;

-- Atomic daily cap. Serializes one student's calls with a transaction advisory lock, counts the
-- last 24 h (rate-limited attempts excluded) and inserts either a 'pending' call or a
-- 'rate_limited' one. Concurrent requests cannot both slip under the cap.
create or replace function public.content_begin_ai_call(
  p_class_id uuid,
  p_student_id uuid,
  p_topic_id uuid,
  p_kind text,
  p_daily_limit integer
) returns table (call_id uuid, allowed boolean, used_today integer)
language plpgsql volatile set search_path = ''
as $$
declare
  used integer;
  new_id uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended('content_ai_calls:' || p_student_id::text, 0));

  select count(*) into used
  from public.content_ai_calls
  where student_id = p_student_id
    and created_at > now() - interval '24 hours'
    and outcome <> 'rate_limited';

  insert into public.content_ai_calls (class_id, student_id, topic_id, kind, outcome)
  values (
    p_class_id, p_student_id, p_topic_id, p_kind,
    case when used >= p_daily_limit then 'rate_limited' else 'pending' end
  )
  returning id into new_id;

  return query select new_id, used < p_daily_limit, used;
end;
$$;

-- Retention: run daily (cron or the API) to drop expired flags.
create or replace function public.content_purge_expired_flags() returns integer
language sql volatile set search_path = ''
as $$
  with deleted as (
    delete from public.content_ai_flags where expires_at < now() returning 1
  )
  select count(*)::integer from deleted
$$;

revoke all on function public.content_begin_ai_call(uuid, uuid, uuid, text, integer)
  from public, anon, authenticated;
revoke all on function public.content_purge_expired_flags() from public, anon, authenticated;
grant execute on function public.content_begin_ai_call(uuid, uuid, uuid, text, integer)
  to service_role;
grant execute on function public.content_purge_expired_flags() to service_role;
