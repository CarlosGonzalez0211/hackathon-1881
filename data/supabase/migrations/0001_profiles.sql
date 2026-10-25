-- 0001: identity foundation (Platform owner). Every other migration references profiles.
-- Not applied anywhere yet. Reserved ranges: 0100 curriculum, 0200 learning, 0300 world,
-- 0400+ platform/analytics (classes, enrollments, events, interventions).

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  -- Nullable so demo seed profiles can exist without an auth user.
  auth_user_id uuid unique references auth.users (id) on delete cascade,
  role text not null default 'student' check (role in ('student', 'professor', 'admin')),
  display_name text not null,
  locale text not null default 'es' check (locale in ('en', 'es')),
  accessibility_preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self on public.profiles
  for select to authenticated
  using (auth_user_id = auth.uid());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- Users may edit their own preferences but never their role. Roles are granted by the
-- service role only; the API uses the service role key and checks class membership itself.
revoke update on public.profiles from authenticated;
grant update (display_name, locale, accessibility_preferences) on public.profiles to authenticated;

-- New sign-ups always start as students. The role is deliberately not read from user metadata,
-- which a client can set.
create or replace function public.handle_new_user() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (auth_user_id, display_name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(split_part(new.email, '@', 1), ''),
      'Student'
    )
  );
  return new;
end;
$$;

-- Only the trigger needs this function. Without the revoke it is callable through the REST API
-- (/rest/v1/rpc/handle_new_user) by anyone; the trigger itself does not need the privilege.
revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
