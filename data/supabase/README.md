# Supabase platform

Migrations, policies and seeds live here. Applied to the Athena project so far: 0001, 0001b, 0400, 0401 and (2026-10-25) 0500–0504.

## Migration number ranges

Each owner writes files only inside their own range, so filenames never collide. Order matters
because of foreign keys: `profiles` (0001) first, then `courses`/`topics` (0100), then everything
that references them.

| Range       | Owner                  | Contents                                           |
| ----------- | ---------------------- | -------------------------------------------------- |
| `0001`      | Platform               | `profiles`, sign-up trigger                        |
| `0100–0199` | Curriculum             | courses, topics, prerequisites, materials, chunks  |
| `0200–0299` | Learning               | concepts, questions, attempts, mastery, sessions   |
| `0300–0399` | World                  | planet state, achievements, quests, teams          |
| `0400–0499` | Platform and analytics | classes, enrollments, domain events, interventions |
| `0500–0599` | Content                | class material, chunks (pgvector), AI calls, flags |

Only one person (Platform) applies migrations to the shared project. Everyone else works in mock
mode or a local Supabase. Server service-role credentials stay in the backend only.

## Rules

- Roles are never taken from client-writable metadata. New users are students.
- Ids are `uuid`. Fixtures use the fixed ids in `shared/src/mocks/demo-identities.ts`.
