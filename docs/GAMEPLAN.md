# Gameplan

Product: gamified, personalized learning. Each student has a small **planet** (their world). Each **house** on it is a **topic** from the professor's course. The professor sees a **solar system**: one planet per student in a class. It is a learning tool, not a grading tool.

One planet component, two modes: `surface` (student walks around) and `orbit` (professor sees many planets). Both read the same `PlanetState`.

## Rules that let 4 people work alone

1. **Own your folders. Touch nothing else.** If you need a change elsewhere, ask the owner or open a tiny PR.
2. **The contract is frozen** after Phase 0. Changing `packages/shared` needs a heads-up in chat first.
3. **Build against mocks.** Nobody waits for anybody. Flip to real endpoints at the integration checkpoint.
4. **One branch per person** (`feat/<name>-<area>`), small PRs, merge to `main` at least hourly, rebase before opening.

## Ownership

| Person         | Area                             | Owns (only edit these)                                                                                                                                                                        |
| -------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1 (Guillermo) | Planet + houses (3D)             | `apps/web/src/components/planet/**`, `apps/web/src/app/(student)/world/**`                                                                                                                    |
| P2             | Professor galaxy + analytics UI  | `apps/web/src/app/(professor)/**`, `apps/web/src/components/professor/**`                                                                                                                     |
| P3             | Learning engine (inside a house) | `apps/api/src/routes/learning/**`, `apps/api/src/ai/**`, `apps/web/src/components/house/**`                                                                                                   |
| P4             | Data + platform                  | `supabase/**`, `apps/api/src/db/**`, `apps/api/src/routes/{planet,analytics,auth}/**`, `apps/web/src/app/(auth)/**`, `apps/web/src/lib/supabase.ts`, `packages/shared/**` (contract), deploys |

## The contract (Phase 0, 30 min, all four together, P4 types it up)

Put in `packages/shared/src/` as zod schemas + types:

- `PlanetState`: `studentId`, `theme` (palette, character), `growth` (0..1), `houses: HouseState[]`
- `HouseState`: `topicId`, `title`, `slot` (position on planet), `status` (`locked | available | in_progress | done`), `progress` (0..1)
- `AiEvent`: `studentId`, `topicId`, `kind` (`chat | podcast | video | summary | hint | quiz_answer`), `at`, `meta`
- `ClassSummary`: per-topic progress, AI-usage counts by `kind`, per-student rows
- Fixtures in `packages/shared/src/mocks.ts`: `mockPlanet`, `mockClassPlanets` (8 students at different stages), `mockSummary`

Endpoints (all under `/api`):

| Endpoint                        | Returns                               | Built by |
| ------------------------------- | ------------------------------------- | -------- |
| `GET /planet/:studentId`        | `PlanetState`                         | P4       |
| `GET /class/:classId/planets`   | `PlanetState[]`                       | P4       |
| `GET /analytics/class/:classId` | `ClassSummary`                        | P4       |
| `POST /analytics/chat`          | AI answer about the class             | P3       |
| `POST /learning/session`        | tutor reply grounded in topic content | P3       |
| `GET /learning/quiz/:topicId`   | quiz questions                        | P3       |
| `POST /learning/hint`           | cat/NPC hint, never the answer        | P3       |
| `POST /learning/generate`       | podcast / video / summary             | P3       |
| `POST /events`                  | logs an `AiEvent`                     | P4       |

Flag `NEXT_PUBLIC_USE_MOCKS=true` makes the web app read fixtures instead of calling the API.

Component hand-offs:

- P1 exports `<Planet state={PlanetState} mode="surface" | "orbit" onHouseClick onPlanetClick />`
- P3 exports `<HouseSession topicId studentId />` (opened when a student enters a house)

## Per person: build order and "done"

### P1 Planet + houses

1. Move the existing build into `components/planet/`, wrapped as a client component (`"use client"`, dynamic import, `ssr: false`).
2. Drive it from `PlanetState`: house count, slots, status visuals (locked / available / in progress / done), growth, theme.
3. `mode="orbit"`: cheap version for many planets at once (no walking, low detail).
4. Entering a house opens `<HouseSession>` (stub until P3 ships).
5. Onboarding: theme and character picker. NPC cat with achievement and hint hook.
6. Polish: loading screen, mobile fallback, 2D topic list for keyboard / screen-reader users.

Done = 60 fps on a laptop with 8 orbiting planets, works on mobile, no console errors.

### P2 Professor galaxy

1. Classroom solar system layout with placeholder circles, then swap in P1's `<Planet mode="orbit">`.
2. Click a planet to open the student panel: progress per house, AI-usage mix, assessment.
3. Class analytics: topic progress, AI-usage by `kind`, "progress with AI" not "AI usage".
4. Chat with the AI about the class (calls `/analytics/chat`).
5. Polish: empty and loading states, class switcher, clean narrative for the demo.

Done = a professor can answer "who is stuck and how are they using AI?" in under 30 seconds.

### P3 Learning engine

1. Content ingest: professor uploads a topic (text / PDF), chunk and embed (Gemini embeddings, pgvector in Supabase).
2. `/learning/session`: answers only from the topic content (RAG), explained in the student's learning style, with pop-culture / Minecraft / story analogies on top.
3. Quiz generation, then `/learning/hint` (hints only, never answers).
4. `/learning/generate`: summary first, then podcast script, video if time.
5. Feedback text per student and per class (`/analytics/chat`).
6. Every call logs an `AiEvent`. `<HouseSession>` UI: chat, quiz, generate buttons, progress.

Done = refuses off-topic questions, never leaks quiz answers, every call logged.

### P4 Data + platform

1. Supabase schema and migrations: users (student / professor), classes, topics, houses, progress, ai_events, achievements, topic content + embeddings. Row-level security per role.
2. Auth: login, role routing (student to world, professor to galaxy), Google / GitHub sign-in.
3. `buildPlanetState()`: progress and events in, `PlanetState` out. Endpoints from the table above.
4. Seed script: one demo class, 8 students, different stages, realistic AI events.
5. Env vars on Vercel, keep `main` deployable, check preview deploys on every PR.
6. Demo prep: script and backup video.

Done = a fresh clone plus `pnpm seed` gives a working demo class.

## Checkpoints

- **Phase 0 (30 min):** contract, fixtures and folder ownership agreed. Nobody codes features yet.
- **Phase 1:** everyone builds against mocks.
- **Integration checkpoint (agree a time, ~2/3 through the night):** flip `NEXT_PUBLIC_USE_MOCKS=false`. P4 and P3 endpoints go live, P1 and P2 hook them up. Fix contract mismatches together.
- **Phase 3:** polish and the demo run-through. Feature freeze 1 hour before.

## Cut list

Out: Class Wrapped (stretch, only if everything else is done), team presentations, anything not in the tables above.
Light: collaboration (a tag for working with a partner), no live multiplayer.
