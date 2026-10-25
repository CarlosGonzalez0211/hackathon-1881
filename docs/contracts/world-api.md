# World API (owned by World)

> PROPOSAL, not frozen. Schemas: `shared/src/world-integration.ts`, `shared/src/world.ts`.
> Implementation: `backend/modules/world` (in-memory; persistence pending P4).
> Client: `frontend/web/src/features/world/world-client.ts`.

All routes are under `/api`. Errors: 400 zod validation, 403 forbidden, 404 unknown
student/topic/course/class, 409 conflict. The body is `{ "error": string }`.

## Student world

| Method & path                         | Request                                    | Response                       | Notes                                                                                                                                 |
| ------------------------------------- | ------------------------------------------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /world/:studentId`               | —                                          | `WorldView`                    | Projected planet + `overflowTopics` + `pendingTransitions` + achievements, quests, Easter eggs, accessibility, `activeCelebrationIds` |
| `GET /planet/:studentId`              | —                                          | `PlanetState`                  | Same projection, planet only                                                                                                          |
| `GET /class/:classId/planets`         | —                                          | `PlanetState[]`                | One per enrolled student (orbit)                                                                                                      |
| `POST /world/houses/enter`            | `HouseEntryRequest` `{studentId, topicId}` | `HouseEntryResult`             | Server-side gate; logs a cosmetic `house_opened` visit                                                                                |
| `POST /world/interactions`            | `WorldInteraction`                         | `WorldInteractionResult` (201) | `transition_seen` / `celebration_seen` acknowledge; never evidence                                                                    |
| `GET /courses/:courseId/world-layout` | —                                          | `WorldLayout`                  | Which topic sits in which slot, plus overflow                                                                                         |
| `POST /world/events`                  | `LearningEvent`                            | `LearningEventIngestResult`    | Learning → World sink. **Service-to-service**: protect it before production                                                           |

Existing proposal 5.5 routes are unchanged: achievements, quests, Easter eggs, teams.

`HouseEntryResult`:

```ts
| { granted: true; entryId; mode: "enter" | "resume" | "review"; house: HouseState;
    courseId; mastery?: TopicMastery }
| { granted: false; reason: "locked" | "not_published"; house?: HouseState;
    missingPrerequisites: { topicId; title; status; slot? }[] }
```

`HouseTransition`: `{ id, studentId, topicId, title, slot, from: status | "absent", to,
causeEventId?, at }`. It is queued when a projection differs from what the student last saw,
and cleared by `transition_seen` with `targetId = id`.

## Presenter only (absent when `NODE_ENV=production`)

| Method & path            | Body                           | Response                            |
| ------------------------ | ------------------------------ | ----------------------------------- |
| `POST /demo/world/step`  | `{studentId?}` (default Lucía) | `{step: string \| null, remaining}` |
| `POST /demo/world/reset` | —                              | 204                                 |

## Engine ↔ React boundary (`frontend/engine3d/src/events.ts`)

The engine speaks in slots, never topics.

```ts
type EngineEvent =
  | { type: "house_focus"; slot: number | null }
  | { type: "house_activate"; slot: number }
  | { type: "house_transition_played"; slot: number }
  | { type: "npc_activate"; npcId: string } // pending
  | { type: "anchor_discovered"; locationId: string }; // pending

interface EngineCommands {
  update(state: PlanetState): void; // exists: drives house model + crossfade
  setPaused(paused: boolean): void; // exists
  setMuted(muted: boolean): void; // exists
  focusHouse?(slot: number): void; // requested
}
```

`house_activate` is only valid in reach: `ProjectedHouse.inReach` (the house's interaction
radius, measured to the anchor or the door) gates both the E key and marker clicks.

Today `surface.ts` emits `onHouseClick(HouseState)` (E key / marker), and `WorldExplorer`
maps it to `activate({slot})`. Emitting `EngineEvent` from the engine is a request to its
owner; nothing is blocked meanwhile.

## Web routes

| Route                                | Renders                                                           |
| ------------------------------------ | ----------------------------------------------------------------- |
| `/world`                             | 3D world + 2D topic list (`WorldExplorer`) inside `WorldProvider` |
| `/world/house/[topicId]` (soft nav)  | `HousePage` overlay over the paused world (`@house/(.)house`)     |
| `/world/house/[topicId]` (hard load) | standalone `HousePage`                                            |
| `/world?presenter=1`                 | adds the presenter panel (dev only)                               |

Mock mode (`NEXT_PUBLIC_USE_MOCKS`, default `true`) runs `WorldService` in the browser on mock
ports. API mode calls these routes.
