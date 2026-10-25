-- 0400: classes and enrollments (Platform owner). Depends on 0001 (profiles).
-- Not applied anywhere yet. All writes go through the API with the service role; clients only read.

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  -- Becomes a foreign key to courses(id) once the curriculum migration (0100) exists.
  course_id uuid not null,
  professor_id uuid not null references public.profiles (id),
  title text not null,
  term text,
  created_at timestamptz not null default now()
);

create table if not exists public.class_enrollments (
  class_id uuid not null references public.classes (id) on delete cascade,
  student_id uuid not null references public.profiles (id),
  status text not null default 'active' check (status in ('active', 'dropped')),
  enrolled_at timestamptz not null default now(),
  primary key (class_id, student_id)
);

create index if not exists classes_professor_idx on public.classes (professor_id);
create index if not exists class_enrollments_student_idx on public.class_enrollments (student_id);

-- Policies need to ask "who am I" and "do I teach / attend this class". Policies on classes and
-- class_enrollments would otherwise reference each other and recurse, so the checks live in
-- security definer functions that bypass RLS with a pinned search_path.
create or replace function public.current_profile_id() returns uuid
language sql stable security definer set search_path = ''
as $$
  select id from public.profiles where auth_user_id = auth.uid()
$$;

create or replace function public.teaches_class(target_class uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.classes
    where id = target_class and professor_id = public.current_profile_id()
  )
$$;

create or replace function public.attends_class(target_class uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.class_enrollments
    where class_id = target_class
      and student_id = public.current_profile_id()
      and status = 'active'
  )
$$;

revoke all on function public.current_profile_id() from public, anon;
revoke all on function public.teaches_class(uuid) from public, anon;
revoke all on function public.attends_class(uuid) from public, anon;
grant execute on function public.current_profile_id() to authenticated;
grant execute on function public.teaches_class(uuid) to authenticated;
grant execute on function public.attends_class(uuid) to authenticated;

alter table public.classes enable row level security;
alter table public.class_enrollments enable row level security;

drop policy if exists classes_select_members on public.classes;
create policy classes_select_members on public.classes
  for select to authenticated
  using (professor_id = public.current_profile_id() or public.attends_class(id));

-- A student sees only their own enrollment rows, never classmates. Professors see their roster.
drop policy if exists class_enrollments_select on public.class_enrollments;
create policy class_enrollments_select on public.class_enrollments
  for select to authenticated
  using (student_id = public.current_profile_id() or public.teaches_class(class_id));
