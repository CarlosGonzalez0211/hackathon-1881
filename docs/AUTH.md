# Auth and roles

Supabase Auth proves who someone is. The `profiles` table says what they are. The API enforces it.

## How a request is authorized

1. The web app signs in with Supabase (Google or GitHub) and sends `Authorization: Bearer <access token>` on every API call.
2. The API asks Supabase Auth to verify the token (`auth.getUser`), so revoked sessions stop working.
3. It loads the caller's `profiles` row. **The role comes only from that row**, which only the service role can change. Roles in token or user metadata are never trusted.
4. It loads memberships: a professor's classes and enrolled students, a student's classes.
5. Modules check `app.platform.authorization` (`canAccessClass`, `canManageClass`, `canAccessCourse`, `canAccessStudent`) before returning data.

| Role      | Can see                                                                                       |
| --------- | --------------------------------------------------------------------------------------------- |
| student   | their classes and courses, and only themselves                                                |
| professor | their classes, those classes' courses and students, and class analytics for their own classes |
| admin     | everything                                                                                    |

Missing or invalid token: 401. Valid token but no profile: 403. Wrong role or class: 403.

## Modes

| `ATHENA_DATA_MODE` | Behavior                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| `mock` (default)   | Allow-all stub: every caller is the demo professor. Fixtures only. Never put real data behind it. |
| `real`             | Needs `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Startup fails if they are missing.          |

With `NODE_ENV=production`, mock mode refuses to start unless `ATHENA_ALLOW_MOCK=true`. Set that
only on a demo deployment that holds no real data; everything else sets `ATHENA_DATA_MODE=real`.

## Enrollment

Only the class's professor (or an admin) manages who is in a class:

- `GET /api/classes/:classId/enrollments` lists active students.
- `PUT /api/classes/:classId/enrollments/:studentId` enrolls (or re-enrolls) a student profile.
- `DELETE /api/classes/:classId/enrollments/:studentId` drops them; the row is kept as `dropped`.

Without a UI, from the terminal (needs the service role in the API's environment; the student has
to have signed in once so a profile exists):

```bash
pnpm --filter @athena/api enroll <class-id> <student-email>
pnpm --filter @athena/api enroll <class-id> <student-email> --drop
```

Changes apply on the student's next request. Only `student` profiles can be enrolled.

## Who may call the World and AI routes

World routes read through the same authorization as analytics: a student reads and writes only as
themself, a professor reads their class, and the Learning event sink and `/api/demo/world/*` are
admin only. In real mode World reads enrollment from `class_enrollments`; its curriculum and
mastery ports stay on mocks until Curriculum and Learning ship real ones, so real students see an
empty planet. `/api/ai/prompt` is staff only and limited to 10 calls a minute per caller.

Frontend: `NEXT_PUBLIC_USE_MOCKS=true` skips sign-in and uses the demo user.

## Setup checklist (needs your Supabase project)

1. Apply migrations in order: `0001_profiles.sql`, then `0400_classes.sql` (0100 curriculum comes between them once it exists).
2. Optional demo roster: run `seeds/0001_demo_class.sql` in the SQL editor.
3. Authentication > Providers: enable Google and GitHub with their client id and secret.
4. Authentication > URL Configuration: set Site URL to your deployed URL and add redirect URLs
   `http://localhost:3000/auth/callback` and `https://<your-domain>/auth/callback`.
5. Fill `.env` (never commit it): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and set `ATHENA_DATA_MODE=real`, `NEXT_PUBLIC_USE_MOCKS=false`.

## Making someone a professor

New sign-ups are always students. In the SQL editor (service role):

```sql
update public.profiles set role = 'professor' where auth_user_id = '<their auth.users id>';
```

To attach a real account to a demo profile instead:

```sql
update public.profiles set auth_user_id = '<auth.users id>' where id = '<demo profile id>';
```
