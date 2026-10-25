# Person 1 curriculum foundation — Phase 1

Offline, deterministic curriculum data and read ports for Person 2. No registered
HTTP endpoints, database writes, real uploads, embeddings, model calls, or student
mastery calculations. Existing world fixtures and teammate modules are untouched.

## Current scope: plain text only

Vianey (Person 1) provides the content foundation for Daniela (Person 2).
Mock lesson files are `.txt` under `shared/src/mocks/curriculum/content/`.
Typed fixtures mirror those files so frontend consumers need no filesystem access.
A test verifies that the TXT lesson text and fixture chunks remain synchronized.
Course/topic metadata stays in TypeScript. No file uploading or PDF processing is
part of the current milestone; PDF support can be considered later.

## Daniela's handoff

Vianey added the Mathematics curriculum from the proposal plus the agreed History
course: two courses, twelve topics, and seventeen cited text chunks. You can read
the catalog through `CurriculumTopicPort` and retrieve text through
`CurriculumContextPort`. These mocks work without API keys or database access.
They do not calculate student mastery or implement assessments.

The changes are on `feat/vianey-workspace`. After Vianey pushes that branch,
you can browse it on GitHub or inspect it in a separate local checkout:

```sh
git fetch origin
git worktree add --detach ../athena-vianey-preview origin/feat/vianey-workspace
```

Choose an unused destination folder. This leaves your current branch unchanged.
Then open `backend/modules/curriculum/README.md` inside that checkout and follow
the integration example below. To incorporate the code into your own branch,
coordinate the commit with Vianey first. We still need to agree concept IDs and
how curriculum topic IDs connect to the world demo.

## Files and ownership

- `shared/src/curriculum.ts`: Zod contracts, active-snapshot graph validation,
  citation-to-source validation, and generated-resource metadata contract.
- `shared/src/mocks/demo-curriculum.ts`: independent Mathematics and History catalog.
- `shared/src/mocks/curriculum/`: authored source text and provenance.
- `backend/modules/curriculum/src/ports.ts`: repository, topic catalog, retrieval,
  access-policy interfaces, and stable error codes.
- `src/mock-repository.ts`: private copied fixture state and a demo-only access policy.
- `src/retrieval-service.ts`: authorized catalog reads and lexical mock retrieval.

Public schemas and fixtures are available from `@athena/shared` after
`pnpm build:platform`. This backend module is not a workspace package. It uses
explicit relative shared-source imports so it can be tested without editing
workspace configuration, package exports, or API composition. Import its service
and ports by relative path from a future server consumer. Do not import this
server module into a browser.

## Minimal Person 2 integration

From a future file in `backend/modules/learning/src/`, imports would be:

```ts
import { CurriculumRetrievalService } from "../../curriculum/src/retrieval-service.js";
import {
  MockCurriculumRepository,
  MockCourseAccessPolicy,
} from "../../curriculum/src/mock-repository.js";
import type { CurriculumContextPort, CurriculumTopicPort } from "../../curriculum/src/ports.js";

const service = new CurriculumRetrievalService(
  new MockCurriculumRepository(),
  new MockCourseAccessPolicy(),
);
const topics: CurriculumTopicPort = service;
const context: CurriculumContextPort = service;

// Explicit demo identity only. Production must derive access on the server.
const access = { userId: "demo-student", courseIds: ["course-math-1"] };
const scope = { courseId: "course-math-1", curriculumVersion: 1 };
const course = await topics.getCourse(scope.courseId, access);
const orderedTopics = await topics.listTopics(scope, access);
const result = await context.retrieve(
  { ...scope, topicId: "topic-geometry", query: "base altura", limit: 2 },
  access,
);
```

`result` carries `courseId`, `topicId`, `curriculumVersion` and cited `chunks`.
`listSources({ ...scope, topicId }, access)` returns ready material metadata.
Each citation resolves to an actual section and exact excerpt in the authored
source chunks. Material storage keys are illustrative, not download URLs. There
are no fabricated PDF page references.

The mock access policy checks a caller-provided allowlist; it does not verify an
identity or enrollment. It is suitable for isolated tests and offline demos only.
The future composition layer must inject Person 4's trusted policy and identity
context before exposing HTTP routes. Request schemas reject claimed authorization
fields. This phase does not create auth or enrollment contracts for Person 4.

## Retrieval behavior

- Authorization precedes repository access.
- Input requires course, topic, active version, and a nonblank query of at most
  2,000 characters. Limit defaults to 5 and must be an integer from 1 to 20.
- Scope is checked on topics, materials, and chunks. Only ready materials qualify.
- Query tokens are case/accent normalized. Common English/Spanish stop words are
  ignored. Scores are the fraction of query tokens found in a chunk's section/text.
- Only positive matches are returned, highest score first; chunk ID breaks ties.
  These are mock lexical coverage scores, not embedding similarity or confidence.
- Unmatched queries return `chunks: []`. Person 2 must handle unsupported answers
  rather than substituting general model knowledge. Cross-language translation and
  semantic search are not implemented.
- Stable domain errors: `INVALID_INPUT`, `FORBIDDEN`, `NOT_FOUND`, `VERSION_MISMATCH`.
  Future routes own their HTTP mapping. Provider/contract corruption throws rather
  than returning invented sources.
- Repository constructor and reads copy fixture objects. Mutating returned data
  does not affect subsequent reads.

## Demo courses

Mathematics uses `course-math-1`, fictional Prof. Elena Ruiz (`prof-ruiz`), six
ordered topics and threshold 0.8. `topic-geometry` has two Spanish source chunks:
triangle area with a worked calculation, and rectangle decomposition. Person 2
owns diagnostics, checkpoints, strategies, mastery, and student availability.
Functions depends on Fractions, not Geometry: recommending it after Geometry does
not make Geometry a hard prerequisite. The existing `topic-1`…`topic-6` world IDs
are preserved; no automatic mapping or world integration is supplied.

History uses `course-history-1`, fictional Prof. Ana Rivera (`prof-rivera`), and six
topics: evidence, Atlantic context, American Revolution, French Revolution,
Haitian Revolution, and comparison of rights. Prerequisites express this demo's
teaching sequence, not a historical causal claim. Notes, slide text, contextual
readings, and a timeline are authored plain-text fixtures with section locators;
selected sections are available in English and Spanish. The 1750–1850 survey title
is an instructional frame; current snippets focus on the revolutionary period,
not comprehensive coverage of that century.

All materials are explicitly `authored_demo`: fictional instructor attribution is
not a real professor's approval, upload, or archival document. External references
record fact-checking provenance; tutor citations point to the teaching fixtures,
not to fictitious primary sources. Facts were checked against:

- [National Archives: Declaration transcription](https://www.archives.gov/founding-docs/declaration-transcript)
- [Office of the Historian: French Revolution](https://history.state.gov/milestones/1784-1800/french-rev)
- [Office of the Historian: Haitian Revolution](https://history.state.gov/milestones/1784-1800/haitian-rev)

The two historical overviews are retired publications, as their pages disclose.
Source text is paraphrased; external references are not fetched at runtime.

## Coordination and deferred work

- Agree concept IDs/catalog ownership with Person 2 before authoring assessment
  questions. This phase intentionally adds no concepts table or mastery logic.
- The dataset models one active curriculum snapshot per course. Historical version
  storage, publishing, invalidation, and concurrent edits need a later agreement.
- IDs are demo strings. Production UUID mapping belongs to the migration plan.
- Generated-resource contracts cover supported formats, locale, theme, approval
  status and required citations. They do not yet implement semantic claim checking,
  scripts/lyrics, audio files, presentations, or generation providers. A nonempty
  citation array alone is not proof of grounding.
- Podcast/music scripts, summaries, slide outlines and study guides follow after
  this foundation, with claim-level source checks and clearly identified demos.
- CRUD, material-state transitions, ingestion, extraction, embeddings, production
  repositories, RLS, API registration and professor UI are later phases.
- Do not replace the generic prompt endpoint with a tutor without separate review.

## Verification from repository root

```sh
pnpm test
pnpm --filter @athena/api exec tsx --test ../modules/curriculum/tests/retrieval.test.ts
pnpm exec tsc -p backend/modules/curriculum/tsconfig.json
pnpm typecheck
pnpm lint
```

The new shared tests are picked up by the existing root test command. Backend
module tests run explicitly so no root script changes are needed. The local
`tsconfig.json` also checks the module tests using the existing API Node types.
Existing CI is not modified to invoke these module-specific commands.
