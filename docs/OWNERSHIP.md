# Ownership and seams

Four people work in parallel. Edit only your own paths; anything else goes through its owner.

|                | P1 Curriculum + demo                              | P2 Learning                | P3 World                   | P4 Platform + analytics                                 |
| -------------- | ------------------------------------------------- | -------------------------- | -------------------------- | ------------------------------------------------------- |
| Backend module | `backend/modules/curriculum`                      | `backend/modules/learning` | `backend/modules/world`    | `backend/modules/platform`, `backend/modules/analytics` |
| Shared schema  | `shared/src/curriculum.ts`                        | `shared/src/learning.ts`   | `shared/src/world.ts`      | `shared/src/{common,events,platform,analytics}.ts`      |
| Fixtures       | `mocks/demo-{identities,scenarios,curriculum}.ts` | `mocks/demo-learning.ts`   | world demo data            | `mocks/demo-{analytics,events}.ts`                      |
| Frontend       | `features/curriculum`                             | `features/learning`        | `features/world`, engine3d | `features/{auth,classes,analytics}`                     |
| Migrations     | `0100–0199`                                       | `0200–0299`                | `0300–0399`                | `0001`, `0400+`                                         |

## Seams that already exist

- **Module registry**: `backend/api/src/plugins.ts` has one line per module. Edit only your entry.
  Modules register inside `/api` and read shared services from `app.platform`.
- **Platform services** (`@athena/platform`): `app.platform.events` (idempotent in-memory event
  store with `subscribe`), `.auth`, `.authorization` (both allow-all stubs for now), `.clock`,
  `.ids`. The caller is `request.auth`. Pass overrides to `createApp({ platform })` in tests.
- **Domain events** (`shared/src/events.ts`): append through `app.platform.events`; events carry
  ids and facts and have stable ids, so handlers can be idempotent.
- **Fixed demo ids**: `athenaDemoIds` in `shared/src/mocks/demo-identities.ts` (UUID-shaped).
  Older fixtures still use string ids; reconcile before the integration checkpoint.
- **Feature clients**: `features/<name>/api/<name>-client.ts` exports an interface, a Mock and an
  Api implementation, and a `get<Name>Client()` chosen by `NEXT_PUBLIC_USE_MOCKS`.

## Rules

- `shared/src/common.ts` and `events.ts` are frozen once the team agrees; changes need a heads-up.
- Keep every module compiling against the stubs so CI stays green for everyone.
- `pnpm-lock.yaml` conflicts: rebase, then run `pnpm install`. Do not resolve by hand.
- Contracts are proposals, not frozen (see CLAUDE.md).
