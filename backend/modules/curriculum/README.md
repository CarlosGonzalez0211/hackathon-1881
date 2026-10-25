# Vianey → Daniela: curriculum content handoff

Vianey (Person 1) provides courses, topics, instructor materials, grounded content,
and resource availability. Daniela (Person 2) owns assessments, teaching strategy,
misconceptions, and student mastery. These are deterministic offline mocks;
no credentials, database, or model provider is needed.

Current data: **2 courses, 12 topics, 18 source chunks, 3 Geometry concepts,
and 6 bilingual History resource fixtures** (three resources per language).
The instructor identities and teaching materials are explicitly authored demos.

## Start here

| You need                                     | Use                                                       | Details                                                             |
| -------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------- |
| Ordered courses/topics and source metadata   | `CurriculumRetrievalService` and its catalog ports        | Topic-level catalog section below                                   |
| Geometry concept definitions                 | `geometryConceptCatalog`                                  | [Concept guide](GEOMETRY_CONCEPTS.md)                               |
| Cited concept-aware context                  | `LearningCurriculumContextAdapter.retrieve()`             | [Retrieval guide](CONCEPT_RETRIEVAL.md)                             |
| Formats available for a Geometry concept     | `CurriculumCapabilityService.getCapabilities()`           | [Capability guide](CONTENT_CAPABILITIES.md)                         |
| History formats available in English/Spanish | `CurriculumTopicCapabilityService.getTopicCapabilities()` | [Capability guide](CONTENT_CAPABILITIES.md#history-topic-discovery) |
| Actual History scripts, lyrics, outlines     | `HistoryResourceService.listResources()`                  | [History guide](HISTORY_RESOURCES.md)                               |
| String IDs and Learning UUID aliases         | Explicit identity mapping                                 | [ID agreement](INTEGRATION_IDS.md)                                  |

The code examples below are sequential parts of **one server-side example**.
Imports use the built `@athena/curriculum` workspace package. They do not
require editing Learning now. Do not import these server modules into the browser.

## 1. Set up the mock dependencies

```ts
import { MockCurriculumRepository, MockCourseAccessPolicy } from "@athena/curriculum";
import { geometryConceptCatalog } from "@athena/curriculum";
import { LearningCurriculumContextAdapter } from "@athena/curriculum";
import { CurriculumCapabilityService } from "@athena/curriculum";
import { CurriculumTopicCapabilityService } from "@athena/curriculum";
import { HistoryResourceService } from "@athena/curriculum";
import { CurriculumRetrievalService } from "@athena/curriculum";

const repository = new MockCurriculumRepository();
const policy = new MockCourseAccessPolicy();
const access = {
  userId: "demo-student",
  courseIds: ["course-math-1", "course-history-1"],
};
```

This allowlist is only for the offline demo. Production composition must supply
trusted identity/enrollment data and Person 4's access policy. Never accept course
grants or the user identity from a request body. Readers check access before
revealing source content or availability.

## 2. Geometry concepts and IDs

All three concepts use `course-math-1`, `topic-geometry`, curriculum version `1`.

| Immutable concept ID                 | Title                         | Prerequisite concepts                   | Required for mastery     |
| ------------------------------------ | ----------------------------- | --------------------------------------- | ------------------------ |
| `math.geometry.rectangle_area`       | Área de rectángulos           | None                                    | No: supporting knowledge |
| `math.geometry.triangle_base_height` | Base y altura de un triángulo | None                                    | Yes                      |
| `math.geometry.triangle_area`        | Área de triángulos            | Rectangle area and triangle base/height | Yes                      |

The misconception reference is `math.geometry.triangle_area.missing_half`.
It is not a fourth concept; Daniela owns its detection and resolution.
The catalog supplies metadata, not student scores or a mastery calculation.

```ts
const concepts = geometryConceptCatalog;
const mathScope = {
  courseId: "course-math-1",
  topicId: "topic-geometry",
  curriculumVersion: 1,
};
```

The adapter also accepts Daniela's existing Mathematics UUID aliases:

- Course: `00000000-0000-4000-8000-000000000a01`.
- Geometry: `00000000-0000-4000-8000-000000000b02`.

Aliases do not rename source citations or change World house assignments.
History remains `course-history-1`; it has no concept catalog or UUID aliases yet.

## 3. Retrieve grounded Geometry content

```ts
const context = new LearningCurriculumContextAdapter(repository, policy, access);
const triangle = await context.retrieve({
  ...mathScope,
  conceptId: "math.geometry.triangle_area",
  query: "¿Cómo se relacionan las áreas de un rectángulo y un triángulo?",
  locale: "es",
  limit: 5,
});
if (!triangle.unsupported) {
  const evidence = triangle.chunks.map(({ text, citation }) => ({ text, citation }));
  // Pass this grounded evidence to your tutor provider.
  console.log(evidence);
} else {
  console.log(triangle.unsupportedReason);
}
```

Request: `courseId`, `topicId`, `conceptId`, `query`, `curriculumVersion`, optional
`locale`, optional `limit` (1–10, default 5). Query is nonblank and at most 2,000
characters. Authorization is bound in the constructor, not included in the request.

Supported response: `{ unsupported: false, curriculumVersion, chunks }`, with
nonempty chunks containing `text`, `conceptId`, `citation`, and `relevanceScore`.

Each citation contains `materialId`, `materialTitle`, `chunkId`, `excerpt`, and
`section`. These TXT mocks have no PDF page or download URL. Use the returned IDs;
they differ from Daniela's earlier mock material/chunk IDs.

Unsupported response: `{ unsupported: true, curriculumVersion, chunks: [],
unsupportedReason }`. Reasons are `concept_not_found`, `no_approved_content`,
`insufficient_evidence`, or `curriculum_version_mismatch`. The mismatch response
reports the active version. Invalid input and access denial throw `CurriculumError`
with `INVALID_INPUT` or `FORBIDDEN`; provider/citation corruption is not hidden.

All three Geometry concepts now have cited Spanish content, including a dedicated
base-and-perpendicular-height lesson. Explicit English Geometry requests return
`no_approved_content`. There is no silent translation or general-knowledge fallback.
Matching uses deterministic lexical coverage, not embeddings or factual confidence.
A valid concept can still return `insufficient_evidence` for an unmatched query.

The complete triangle request/response is in
[`fixtures/triangle-area-context.json`](fixtures/triangle-area-context.json).
The adapter was checked against Daniela's actual Zod contract from
`origin/feat/learning-grounded-tutor` at `edaf75f`; this is a snapshot, not a
promise that future contract changes are already integrated.

## 4. Discover available Geometry formats

```ts
const conceptDiscovery = new CurriculumCapabilityService(repository, policy, access);
const geometryFormats = await conceptDiscovery.getCapabilities({
  ...mathScope,
  conceptId: "math.geometry.triangle_area",
  locale: "es",
});
const availableGeometryFormats = geometryFormats.formats.filter((f) => f.available);
// text + worked_example, both as text_excerpt.
```

Every recognized format is listed. Read `available`, `availableRepresentations`,
`sourceChunkIds`, and `unavailableReason`; do not assume a recognized format exists.
The current formats are `text`, `worked_example`, `visual_summary`, `slides`,
`audio`, `podcast`, `music`, `video`, and `reel`. No live generation is implemented.

## 5. Discover History resources in either language

History covers Atlantic revolutions, with topics on evidence, Atlantic context,
American, French, and Haitian revolutions, and comparison of rights/citizenship.
The rich resources currently target **`topic-comparing-rights`** only.

```ts
const topicDiscovery = new CurriculumTopicCapabilityService(repository, policy, access);
const historyScope = {
  courseId: "course-history-1",
  topicId: "topic-comparing-rights",
  curriculumVersion: 1,
};
const englishFormats = await topicDiscovery.getTopicCapabilities({
  ...historyScope,
  locale: "en",
});
const spanishFormats = await topicDiscovery.getTopicCapabilities({
  ...historyScope,
  locale: "es",
});
```

This topic-level contract needs no `conceptId`. Both locales currently expose:

| Format    | Available representation | How to read                                   |
| --------- | ------------------------ | --------------------------------------------- |
| `text`    | `text_excerpt`           | Source chunks identified by `sourceChunkIds`  |
| `podcast` | `script`                 | Authored resource identified by `resourceIds` |
| `music`   | `lyrics`                 | Authored resource identified by `resourceIds` |
| `slides`  | `slide_outline`          | Authored resource identified by `resourceIds` |

Topic responses include `contractVersion: 1`, scope, locale, and format entries.
They add `resourceIds` to the availability fields. Text entries have no generated
resource ID. Source text is discovered from sources cited by the eligible resources;
this is not a complete listing of all raw materials in every History topic.

Unready/missing sources hide the affected formats with `no_approved_content`.
Unauthored formats use `not_authored`. The reader throws `INVALID_INPUT`,
`FORBIDDEN`, `NOT_FOUND`, or `VERSION_MISMATCH` for invalid requests, access denial,
unknown scopes, or stale versions. Geometry concept response behavior is unchanged.

## 6. Read History scripts, lyrics, and slide outlines

```ts
const resourceReader = new HistoryResourceService(repository, policy, access);
const englishResources = await resourceReader.listResources({ ...historyScope, locale: "en" });
const spanishResources = await resourceReader.listResources({ ...historyScope, locale: "es" });
const podcastIds = spanishFormats.formats.find((f) => f.format === "podcast")!.resourceIds;
const spanishPodcast = spanishResources.find((r) => podcastIds.includes(r.id));
```

Each language has three resources. `structuredContent` contains a title,
representation, `provenance: authored_demo`, `playable: false`, and blocks.
Academic blocks contain exact source excerpts with citations; creative hosting
questions and mnemonic refrains are labeled separately. Resource-level citations
aggregate the factual block citations. Mock approval does not imply real professor
review. Corrupted citations are rejected rather than served.

These are **scripts, lyrics, and outlines**: no playable audio/video, rendered deck,
or fabricated media URL exists. Both capability interfaces keep
`generationAvailable` and `playableMediaAvailable` false.
Readable copies: [`fixtures/history-resources/`](fixtures/history-resources/).

## 7. Topic-level catalog and raw text

The original `CurriculumRetrievalService` remains available for ordered topics,
material metadata, and general topic-level retrieval:

```ts
const catalog = new CurriculumRetrievalService(repository, policy);
const course = await catalog.getCourse(mathScope.courseId, access);
const orderedTopics = await catalog.listTopics(mathScope, access);
const materials = await catalog.listSources(mathScope, access);
const historyText = await catalog.retrieve(
  { ...historyScope, query: "1776 1789 1791", limit: 5 },
  access,
);
```

This older topic interface takes access per call, accepts limits 1–20, and returns
`{ courseId, topicId, curriculumVersion, chunks }` with `similarity` scores. Unmatched
queries produce an empty array. It is **not** the same wire contract as the
Learning adapter above. Use the concept adapter when implementing Daniela's
`CurriculumContextPort`.

## Files, setup, and verification

- Shared course/material/citation contracts: `shared/src/curriculum.ts`.
- Source catalog: `shared/src/mocks/demo-curriculum.ts`.
- TXT source lessons: `shared/src/mocks/curriculum/content/`.
- Person 1 services and adapter: this module's `src/`.
- Curriculum tests: this module's `tests/` and `shared/tests/curriculum-contracts.test.ts`.

Use Node 22 and pnpm 9.15.9. After installing dependencies, run from repository root:

```sh
pnpm build:platform
pnpm test
pnpm --filter @athena/api exec tsx --test "$PWD"/backend/modules/curriculum/tests/*.test.ts
pnpm exec tsc -p backend/modules/curriculum/tsconfig.tests.json
pnpm lint
pnpm format:check
```

The last implementation check passed **114 curriculum module tests**. The existing
root test command also covers shared contracts and API smoke tests. The explicit
module command is necessary: existing CI has not been changed to include it.

Curriculum now builds as the `@athena/curriculum` workspace package introduced
by main. Shared contracts and fixtures are imported through `@athena/shared`;
the module no longer compiles shared source files outside its package root.
`tsconfig.json` builds `src/` into `dist/`, and `tsconfig.tests.json` checks both
source and tests without emitting. The existing module registry now calls our implemented `curriculumRoutes`,
which registers the two read endpoints documented in `API_ROUTES.md`.

## World curriculum API routes

Person 1 now serves `GET /api/courses/:courseId/topics` and
`GET /api/topics/:topicId/sources` through the existing module registry, using
Platform identity/authorization and unchanged World response schemas.
See [the route guide](API_ROUTES.md) for filters, locale, errors, mock-auth/data
limits, and tests. History is published by default for authorized course readers.

## World-facing topic adapter

`WorldCurriculumTopicAdapter` now implements World's `listTopics(courseId)` shape
inside Person 1. Its default Mathematics output preserves the shipped IDs, six
house slots, and World prerequisite behavior through an explicit demo compatibility
view. History stays separate and is published by default. Publication requires
ready material. No running World wiring is changed.

See [the World adapter guide](WORLD_ADAPTER.md) for the publication manifest,
remaining prerequisite differences, and actual WorldService integration tests.
`WorldHouseContentAdapter` now supplies the existing `HouseContent` shape with
TXT source cards and bilingual History resource bodies; see
[the HouseContent guide](HOUSE_CONTENT.md). UI wiring and publishing endpoints remain separate tasks; the two authenticated
read routes are now described in `API_ROUTES.md`.

## Daniela contract integration check

`tests/learning-handoff.test.ts` checks our adapter against exact copies of the
consumer Zod schemas from the latest published Learning branch inspected:
`origin/feat/learning-policy-freeze` at `4306284`. The copies and their checksums
are isolated under `tests/fixtures/daniela-contract/`; production schemas and
Learning implementation files are unchanged.

```sh
pnpm --filter @athena/api exec tsx --test ../modules/curriculum/tests/learning-handoff.test.ts
```

This verifies all three Geometry concepts, UUID aliases, citation grounding, the
four unsupported reason codes, and the evidence shape consumed by Learning.
It does not run the full Learning service. The exact query
`Hint for question <id>` now selects approved concept-scoped evidence without
trying to match the question ID as lesson text. All scope, locale, version, and
access checks still apply. Daniela remains responsible for validating the question
and turning evidence into a hint that does not reveal the answer. See the fixture
README for the test scope and refresh instructions.

## Git sharing and remaining integration

Work is on `feat/vianey-workspace`. Commit `0036ff9` is the published merge of main
and package-build compatibility fixes. The subsequent Learning handoff tests,
hint retrieval fix, World adapters, authenticated read routes, and API-backed
Material panel are **pending local changes** until Vianey approves a commit and
push. Daniela and the World owner cannot fetch these pending additions yet.

After publication, inspect the branch without switching an existing checkout:

```sh
git fetch origin
git worktree add --detach ../athena-vianey-preview origin/feat/vianey-workspace
```

Use an unused destination folder. These commands only preview committed,
published work; they do not include the current pending local changes.

The prerequisite differences in `INTEGRATION_IDS.md` still exist in the source
fixtures. The new World adapter preserves the shipped Mathematics demo graph
through an explicit compatibility projection. No World mock, student progress,
house assignment, or authoritative source fixture was rewritten.

Person 1 now provides the two read routes, but the running World mock and
Daniela's Learning implementation have not been switched to the new adapters.
The API-backed frontend panel is ready under
`frontend/web/src/features/curriculum/`; see
[its integration guide](../../../frontend/web/src/features/curriculum/MATERIAL_TAB.md).
The user requested that World files stay unchanged, so the Material slot re-export
has not been applied. A real authenticated browser session has not been verified.
History also remains unpublished by default and requires authorized course access before showing its resources.

The most recently fetched main advanced to `9f53ff1` after the published merge.
That update is not included here. Review/synchronize it separately before final
cross-team integration; these tests cover this feature branch and pending work.

Deferred Person 1 work includes persistent storage, publishing workflows,
production authorization integration, course-management UI, and live resource
generation. File uploads, PDF processing, and embeddings remain outside the
current TXT milestone. No assessment, mastery, World progression, or analytics
implementation is added here.
