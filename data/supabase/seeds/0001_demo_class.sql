-- Demo roster for Matemáticas I – Grupo A. Run in the Supabase SQL editor (service role).
-- Ids match shared/src/mocks/demo-identities.ts. Demo profiles have no auth user, so nobody can
-- sign in as them; link a real account with: update public.profiles set auth_user_id = '<uuid>' ...
-- Safe to run more than once.

insert into public.profiles (id, auth_user_id, role, display_name, locale) values
  ('00000000-0000-4000-8000-000000000001', null, 'professor', 'Prof. Elena Ruiz', 'es'),
  ('00000000-0000-4000-8000-000000000101', null, 'student', 'Lucía Torres', 'es'),
  ('00000000-0000-4000-8000-000000000102', null, 'student', 'Mateo Herrera', 'es'),
  ('00000000-0000-4000-8000-000000000103', null, 'student', 'Sofía Castro', 'es'),
  ('00000000-0000-4000-8000-000000000104', null, 'student', 'Diego Navarro', 'es'),
  ('00000000-0000-4000-8000-000000000105', null, 'student', 'Valeria Soto', 'es'),
  ('00000000-0000-4000-8000-000000000106', null, 'student', 'Andrés Vega', 'es'),
  ('00000000-0000-4000-8000-000000000107', null, 'student', 'Camila Rojas', 'es'),
  ('00000000-0000-4000-8000-000000000108', null, 'student', 'Nicolás Pardo', 'es')
on conflict (id) do nothing;

insert into public.classes (id, course_id, professor_id, title, term) values
  (
    '00000000-0000-4000-8000-000000000c01',
    '00000000-0000-4000-8000-000000000a01',
    '00000000-0000-4000-8000-000000000001',
    'Matemáticas I – Grupo A',
    '2026-2'
  )
on conflict (id) do nothing;

insert into public.class_enrollments (class_id, student_id)
select '00000000-0000-4000-8000-000000000c01', id
from public.profiles
where id between '00000000-0000-4000-8000-000000000101' and '00000000-0000-4000-8000-000000000108'
on conflict do nothing;
