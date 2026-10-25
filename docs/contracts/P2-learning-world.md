# P2 Learning ↔ World contract

> PROPOSAL, not frozen. Code: `shared/src/contracts/learning-world.ts` and the learning
> events in `shared/src/world.ts`. Overview: [WORLD_INTEGRATION.md](../WORLD_INTEGRATION.md).
> You own mastery; World only reads it and reacts to your events.

## What World needs from you

1. **Mastery per topic** for a student. This drives house state and progress.
2. **An event every time mastery changes.** World then unlocks rewards and shows the
   transition.
3. **The Aprender tab** inside the house page.

## API (you implement)

| Method & path                                           | Request                                                                    | Response                                                         | Caller                    |
| ------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------- |
| `GET /learning/student/:studentId/mastery?topicIds=a,b` | —                                                                          | `StudentMasterySnapshot`                                         | World (`MasteryReadPort`) |
| `POST /learning/session`                                | `LearningSessionStartRequest` `{studentId, topicId, entryId?}`             | `LearningSessionStart` `{sessionId, topicId, strategy, resumed}` | `HouseTutorPanel`         |
| `POST /learning/attempt`                                | yours                                                                      | yours (+ the learning events it produced)                        | `HouseTutorPanel`         |
| `POST /learning/hint`                                   | `HintRequest` `{studentId, topicId, sessionId?, source: "lumen"\|"house"}` | `HintResponse` `{message, citationIds}`                          | Lumen / house page        |

```ts
TopicMastery = {
  topicId: string;
  mastery: number;               // 0..1, deterministic, from validated evidence only
  demonstratedConcepts?: number; // header "2 de 5 conceptos"
  totalConcepts?: number;
  nextAction?: string;           // header "Siguiente: …"
  updatedAt?: ISO datetime;
}
StudentMasterySnapshot = {
  studentId: string;
  topics: TopicMastery[];        // topics without evidence may be omitted (= 0)
  growth?: number;               // 0..1 planet growth; if absent World uses mean progress
}
```

How World turns your numbers into house states: `done` at mastery ≥ the topic's
`masteryThreshold` (P1), `in_progress` above 0, otherwise locked or available depending on
prerequisites. You never set a house state directly.

## Event sink (you call World)

`POST /api/world/events` with one `LearningEvent` (`learningEventSchema` in `world.ts`):

| type                    | extra fields                  | World effect                                                         |
| ----------------------- | ----------------------------- | -------------------------------------------------------------------- |
| `MasteryUpdated`        | `mastery`, `previousMastery?` | re-projects; may unlock `geometry-builder`; queues house transitions |
| `MisconceptionResolved` | `misconceptionId`             | `first-insight` badge + lantern celebration                          |
| `StrategyChanged`       | `fromStrategy`, `toStrategy`  | arms `strategy-switcher` for the next success                        |
| `RetentionCheckPassed`  | `conceptId?`                  | `retention-star` badge                                               |

Common fields: `id` (stable, unique per student), `studentId`, `topicId`, `occurredAt`,
`evidenceIds`.

Response: `LearningEventIngestResult {unlockedAchievements, transitions}`.

**Order matters:** store the new mastery first, then send the event, because World re-reads
mastery through your port when it handles the event. Duplicate ids are ignored. This route
is service-to-service; P4 adds auth before production.

Example:

```json
{
  "id": "evt-mastery-updated-2",
  "type": "MasteryUpdated",
  "studentId": "student-lucia",
  "topicId": "topic-geometry",
  "mastery": 0.85,
  "previousMastery": 0.6,
  "evidenceIds": ["attempt-checkpoint-3"],
  "occurredAt": "2026-10-24T15:20:00.000Z"
}
```

Result: Geometría `in_progress → done`, Estadística `locked → available`, and the
`geometry-builder` badge.

## Backend port (World calls it; you provide the real implementation)

```ts
interface MasteryReadPort {
  getStudentMastery(studentId: string, topicIds: string[]): Promise<StudentMasterySnapshot>;
}
```

Today: `MockMasteryPort`, seeded with `demoClassMastery`. Its `set()` only exists for mocks
and the demo driver. To go live, pass yours via `new WorldService({ ports: { mastery, … } })`.

## Frontend slot

- `<HouseTutorPanel studentId topicId entryId onProgress? />` is yours. Start a session with
  `entryId` (analytics only), run checkpoints and hints, and call `onProgress()` after a
  mastery change so the world refreshes when the student returns.
- A `LearningClient` with `startSession` and `requestHint`, Api and Mock versions, following
  the same pattern as `features/world/world-client.ts`.

## Rules you guarantee

- Mastery is deterministic, never decreases, and is never written by an LLM.
- Hints, prompt counts, house visits and time spent are not evidence.
- Every mastery change emits `MasteryUpdated` with a stable id.
- Hints never reveal answers. Lumen hints use `source: "lumen"`.

## Demo without you

`demoLearningScenario` (2 steps) plus `DemoWorldDriver` play your role through the same sink.
See `POST /api/demo/world/step` and `/world?presenter=1`.

## Contract tests

`backend/api/tests/world-integration.test.ts` covers:

- the state machine
- duplicate events
- house entries that are not evidence
- no re-lock after a prerequisite change
- the demo steps

Point the tests at your real port before you switch it in.
