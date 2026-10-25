# P1 Curriculum ↔ World contract

> PROPOSAL, not frozen. Code: `shared/src/contracts/curriculum-world.ts`. Overview:
> [WORLD_INTEGRATION.md](../WORLD_INTEGRATION.md). You own the producer side and may add
> fields; World reads only what is listed here. Breaking changes need World's review.

## What World needs from you

1. **Which topics are published, in what order, with which prerequisites.** These become
   houses.
2. **What a student sees inside a house** (the Material tab).
3. **Publishing rules** that keep the world consistent.

## API (you implement)

All routes are under `/api`, with zod validation on both sides using the shared schemas.

| Method & path                                  | Request                           | Response                   | Errors                                         | Caller                        |
| ---------------------------------------------- | --------------------------------- | -------------------------- | ---------------------------------------------- | ----------------------------- |
| `GET /courses/:courseId/topics?published=true` | —                                 | `CurriculumTopicSummary[]` | 404 unknown course, 403 no access              | World (`CurriculumTopicPort`) |
| `GET /topics/:topicId/sources`                 | —                                 | `HouseContent`             | 403 not enrolled **or** topic unpublished, 404 | House page Material tab       |
| `POST /topics/:topicId/publish`                | `TopicPublishRequest` `{publish}` | `CurriculumTopicSummary`   | 409 no `ready` material, 403 not the owner     | Your professor UI             |
| `POST /courses/:courseId/materials`            | multipart (yours)                 | `Material` (proposal 3.2)  | —                                              | Your professor UI             |

```ts
CurriculumTopicSummary = {
  id: string; courseId: string; title: string;
  order: number;                 // int ≥ 0, UNIQUE per course → house slot
  prerequisiteTopicIds: string[];// no cycles
  masteryThreshold: number;      // 0..1, e.g. 0.8 → "done" at this mastery
  published: boolean;
}

HouseContent = {
  topicId; courseId; title;
  summary?: string;              // short professor intro
  materials: { id; title; filename; mimeType;
               status: "uploaded"|"extracting"|"chunking"|"embedding"|"ready"|"failed";
               url?: string;      // short-lived signed URL
               pageCount?: number }[];
  resources: { id; format: LearningFormat; title; url?; body? }[]; // approved only
  updatedAt: ISO datetime;
}
```

Example (from `demoHouseContent["topic-geometry"]`):

```json
{
  "topicId": "topic-geometry",
  "courseId": "course-math-1",
  "title": "Geometría",
  "summary": "Áreas y perímetros de figuras planas…",
  "materials": [
    {
      "id": "material-geometry-notes",
      "title": "Unidad 2: Geometría",
      "filename": "Geometria-Unidad-2.pdf",
      "mimeType": "application/pdf",
      "status": "ready",
      "pageCount": 18
    }
  ],
  "resources": [
    {
      "id": "resource-triangle-area",
      "format": "visual_summary",
      "title": "Un triángulo es medio rectángulo",
      "body": "…"
    }
  ],
  "updatedAt": "2026-10-24T15:00:00.000Z"
}
```

## Backend port (World calls it; you provide the real implementation)

```ts
// backend/modules/world/src/ports.ts
interface CurriculumTopicPort {
  listTopics(courseId: string): Promise<CurriculumTopicSummary[]>; // [] for unknown course
}
```

Today: `MockCurriculumTopicPort` (mock-ports.ts), seeded with `demoCurriculumTopics`. To go
live, pass your implementation in `new WorldService({ ports: { curriculum, … } })` (a direct
repository call or an HTTP client). Nothing in World or the engine changes.

## Frontend slot

- `frontend/web/src/features/world/house-content-client.ts` defines `CurriculumContentClient`
  `{ getHouseContent(topicId) }`, with Api and Mock implementations chosen by
  `NEXT_PUBLIC_USE_MOCKS`.
- The `<HouseContentPanel topicId studentId cta onStart />` internals are yours: PDF viewer,
  citations, generated resources. Keep the props. `onStart` switches to the Aprender tab.

## Events (you emit; World and Analytics consume)

`curriculumEventSchema`:

- `TopicPublished {id, courseId, topicId, occurredAt}`
- `TopicUnpublished`
- `MaterialProcessed {materialId, topicIds, status: ready|failed}`

World projects on every read, so these only trigger refreshes and analytics. No event bus
is needed for the demo.

## Rules you guarantee

- `order` is unique per course; reordering moves houses, so avoid it after students start.
- Prerequisite graph has no cycles; prerequisites reference topics of the same course.
- Publishing requires at least one `ready` material.
- `sources` enforces access server-side. World never requests content for a locked house,
  but that is UX, not security.
- Only `ready` materials and `approved` resources are returned to students.

## Contract tests

- `shared/tests/world-integration.test.ts`: fixtures parse, the prerequisite graph is acyclic.
- `backend/api/tests/world-integration.test.ts`: slot = order, unpublished topics absent,
  overflow.

Run the same tests against your real port before you switch it in.
