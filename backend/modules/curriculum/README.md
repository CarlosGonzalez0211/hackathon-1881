# Vianey → Daniela and World owner: curriculum content handoff

Vianey (Person 1) provides courses, topics, instructor materials, grounded content,
and resource availability. Daniela (Person 2) owns assessments, teaching strategy,
misconceptions, and student mastery. The content fixtures and service tests are deterministic offline mocks;
they need no credentials, database, or model provider. The connected browser
Material panel requires a valid Supabase session and a reachable API.

Current data: **2 courses, 12 topics, 18 source chunks, 3 Geometry concepts,
and 6 bilingual History resource fixtures** (three resources per language).
The instructor identities and teaching materials are explicitly authored demos.

## Team status — verified October 25, 2026

**Ready:** concept-aware Geometry retrieval, approved source text and citations,
question-ID hint retrieval, capability discovery, bilingual History resource
fixtures, World topic/HouseContent adapters, and authenticated curriculum read
routes. The API publishes all six History topics by default when materials are
ready; readers still need course access. Published does not mean enrolled or
visible in World's course navigation.

**Latest validation:** 120 tests passed: six tests invoking Daniela's actual
LearningService and 114 Person 1 regression tests. The integration runner fetched
sources from `origin/feat/learning-policy-freeze` at
`43062843460aefb3d10646f007f96607fa544e8c`, built them in a temporary directory,
and connected our adapter without changing her files. Type checking, lint, and
formatting checks passed for the integration work. Earlier Material-panel checks
passed eight frontend tests, 14 API route tests, frontend type checking, lint,
and the production frontend build; those counts overlap the checks above.

### For Daniela

- All three agreed Geometry concepts return correctly scoped evidence:
  `math.geometry.rectangle_area`, `math.geometry.triangle_base_height`, and
  `math.geometry.triangle_area`. Existing Mathematics UUID aliases still work.
- Lesson text and citations reach Learning's tutor unchanged. Follow-up messages
  retain the concept and cited evidence.
- Actual assessment question IDs work through `Hint for question <id>` retrieval.
  Learning rejects a question/concept mismatch before retrieval and rejects an
  invented citation chunk ID. Reading lessons or hints does not grant mastery.
- Unknown concepts, unavailable locales, unmatched queries, wrong versions, and
  unready materials stay unsupported; access denial remains an error.
- Geometry lessons currently exist in Spanish. Explicit English requests return
  `no_approved_content`. History resources are available in English and Spanish.

See [the actual service test guide](DANIELA_INTEGRATION.md) for reproduction.
These tests use her in-memory repositories, assessment bank, and deterministic
mock tutor. They do not verify live Gemini, deployed route wiring, persistence,
or a signed-in browser. Learning's follow-ups and hints do not forward a locale,
and its mock hints use generic wording; Daniela should validate language
continuity, concept-specific wording, and live-model answer leakage.

### For the World owner

The locally connected Material slot re-exports Person 1's
`CurriculumMaterialPanel`, preserving `topicId`, `studentId`, `cta`, `onStart`,
and `showStart`. HousePage keeps its separate start controls. The panel reads
`GET /api/topics/:topicId/sources`, renders TXT lessons and citations, and offers
English/Spanish selection, loading, retry, and sign-in states. History resources
are podcast scripts, mnemonic lyrics, and slide outlines, not playable media.

The slot uses the authenticated API even when other World clients use mocks.
It does not change World progression, house slots, Mathematics IDs, enrollment,
or course selection. See [the Material integration guide](../../../frontend/web/src/features/curriculum/MATERIAL_TAB.md).

### Remaining blockers and owners

| Owner                     | Next step                                                                                                                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Supabase / Platform owner | Enable Google or GitHub sign-in; both were disabled in the latest read-only check. Allow the localhost auth callback while preserving team settings. Verify the real account's profile and class enrollment. |
| Person 1 + Platform       | Agree on the History course UUID and add its explicit mapping. `classes.course_id` is UUID; `course-history-1` is not yet mapped. Preserve existing Mathematics IDs.                                         |
| World owner + Person 1    | Connect real enrollment and curriculum providers. World still constructs fixture providers; real profiles and History navigation are not wired by the Material-slot change.                                  |
| Daniela                   | Confirm follow-up/hint locale handling and concept-specific hints; test live-model grounding and answer leakage separately.                                                                                  |
| Vianey + owners           | Once sign-in and navigation work, test Mathematics TXT and History resources in the browser. Review pending changes before authorizing a commit or push.                                                     |

Local configuration checks confirmed Supabase accepted the configured keys and
that profile, class, and enrollment tables were reachable. The login page and
backend health returned 200; unauthenticated identity/material requests returned 401. No real signed-in Material-tab flow has been verified. Credentials stay in
Git-ignored local environment files and must not be copied into this handoff.
The Supabase owner should rotate the service-role key previously shared in chat.

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

Published on `main` through `e76cc04`: the Person 1 retrieval/hint fixes,
World adapters, authenticated read routes, History default publication, and the
prepared Material panel. Teammates can fetch that committed work.

**Still local and uncommitted:** the World Material-slot connection, its guide
updates, this README update, and the actual Daniela service integration runner,
tests, and guide. Teammates cannot pull those additions yet. Nothing in this
handoff authorizes committing or pushing.

The source prerequisite differences in `INTEGRATION_IDS.md` remain. The World
adapter preserves the shipped Mathematics graph through a compatibility view.
The local World edit is limited to the Material slot re-export; it does not wire
World's enrollment/topic providers or Daniela's production Learning routes.
The latest tests exercise an explicit test connection to her service.

Deferred work includes persistent content storage, instructor publishing,
course-management UI, and live resource generation. File uploads, PDF processing,
and embeddings remain outside the current TXT milestone. Person 1 does not own
assessment policy, mastery calculations, or World progression.
