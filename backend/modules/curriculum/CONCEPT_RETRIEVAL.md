# Concept-aware retrieval for Daniela

Person 1 now supplies `LearningCurriculumContextAdapter`, with Learning's
one-argument `retrieve(input)` method. It wraps the existing topic-level service;
it does not replace or modify Daniela's implementation.

## Quick start

From a future server consumer in `backend/modules/learning/src/`:

```ts
import { LearningCurriculumContextAdapter } from "@athena/curriculum";
import { MockCurriculumRepository, MockCourseAccessPolicy } from "@athena/curriculum";

const context = new LearningCurriculumContextAdapter(
  new MockCurriculumRepository(),
  new MockCourseAccessPolicy(),
  { userId: "demo-student", courseIds: ["00000000-0000-4000-8000-000000000a01"] },
);
const result = await context.retrieve({
  courseId: "00000000-0000-4000-8000-000000000a01",
  topicId: "00000000-0000-4000-8000-000000000b02",
  conceptId: "math.geometry.triangle_area",
  query: "¿Cómo se relacionan las áreas de un rectángulo y un triángulo?",
  curriculumVersion: 1,
  locale: "es",
  limit: 5,
});
```

Bind access from trusted server identity/enrollment data, never a request body.
The mock policy only checks an explicit allowlist; it is not production auth.
The bound allowlist is copied so later caller mutation cannot expand access.

## Identity and contract compatibility

- Both the existing string curriculum IDs and Daniela's recorded Mathematics
  UUID aliases are accepted. Aliases resolve before content access. The six topic
  aliases and Mathematics course alias are explicit; unknown IDs never fall back.
- Course grants also accept the explicit course alias. No student identity,
  enrollment, mastery fixture, World assignment, or source citation ID is rewritten.
- Request fields match `CurriculumContextRequest`: course, topic, concept, query,
  version, optional `en|es` locale, and optional limit (1–10; default 5).
- Local input validation additionally rejects extra fields, including claimed
  authorization. Query text is trimmed and limited to 2,000 characters.
- Supported responses contain `unsupported: false`, active curriculum version,
  and nonempty chunks with `text`, `conceptId`, `citation`, and `relevanceScore`.
- Citation fields are `materialId`, `materialTitle`, `chunkId`, `excerpt`, and
  `section` for these TXT sources. They point to actual existing source chunks;
  no PDF page, fictitious URL, or Learning fixture source ID is invented.
- Chunk IDs/material IDs are authoritative Person 1 IDs, not aliases for Daniela's
  earlier mock citation IDs. Consumers must use returned citations rather than
  hardcoding mock material or chunk IDs.

The local branch does not yet contain `shared/src/learning-curriculum.ts`.
Person 1 therefore uses structural types and a local request validator rather
than modifying shared schemas. During this task, the actual consumer Zod schemas
from `origin/feat/learning-grounded-tutor` at `edaf75f` were loaded into a temporary
directory. All three concept definitions and six request/response scenarios
validated against them. This is compatibility with that inspected snapshot,
not a guarantee about future contract changes. After branch synchronization,
reuse the shared schemas instead of maintaining parallel validation.

## Concept-to-source mappings

`src/geometry-source-map.ts` explicitly marks authored demo chunks as approved
for each concept; readiness alone is insufficient. This is mock approval metadata,
not a real instructor approval workflow.

| Concept                              | Source sections                           | Current behavior                                  |
| ------------------------------------ | ----------------------------------------- | ------------------------------------------------- |
| `math.geometry.rectangle_area`       | Descomposición visual                     | Returns the rectangle decomposition chunk         |
| `math.geometry.triangle_base_height` | Base y altura perpendicular               | Returns the dedicated base/height lesson chunk    |
| `math.geometry.triangle_area`        | Área de triángulos; Descomposición visual | Returns grounded formula and decomposition chunks |

Only approved mapped chunks from ready materials in the exact course, topic,
version, and requested locale qualify. Existing scoring is deterministic lexical
query coverage, not semantic similarity or a measure of factual confidence.
The limit is applied after concept filtering. No external model or embeddings
are used.

The Geometry sources are currently Spanish. An explicit English request returns
no approved content rather than silently translating or substituting another
locale. With no locale specified, matching authored source text is returned.
History remains available through topic-level retrieval; this task does not add
History concepts or silently reuse Geometry concepts for History.

## Unsupported results and errors

Unsupported results always have `chunks: []`, `unsupported: true`, the active
curriculum version when known, and one of these reasons:

| Reason                        | Meaning                                                                                      |
| ----------------------------- | -------------------------------------------------------------------------------------------- |
| `concept_not_found`           | No concept in the requested course/topic/version scope                                       |
| `no_approved_content`         | No mapped ready source chunk in the requested scope and locale                               |
| `insufficient_evidence`       | Available material does not explain the concept adequately, or no lexical query match exists |
| `curriculum_version_mismatch` | Requested version is not active; response reports the active version                         |

Malformed requests throw `CurriculumError` with `INVALID_INPUT`. Access denial
throws `FORBIDDEN` before course/concept existence or source data is disclosed.
Access and internal provider failures are not disguised as unsupported content.
The adapter does not answer using general model knowledge.

## Deterministic handoff fixture

`fixtures/triangle-area-context.json` contains the complete request and expected
response with two real source citations. A test verifies it matches a fresh
adapter response. It contains mock teaching content and no credentials or
playable media.

## Verification from repository root

```sh
pnpm --filter @athena/api exec tsx --test ../modules/curriculum/tests/learning-context-adapter.test.ts
pnpm exec tsc -p backend/modules/curriculum/tsconfig.tests.json
```

No routes, World publishing, shared exports, file uploads, or PDF processing are
added. This adapter must be composed into Learning separately after the owners
reconcile branches and contracts.
