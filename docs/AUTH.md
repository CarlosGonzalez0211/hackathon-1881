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
