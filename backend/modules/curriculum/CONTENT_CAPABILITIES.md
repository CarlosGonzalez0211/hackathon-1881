# Learning formats and capability discovery

Person 1 proposes this versioned TypeScript contract for Daniela. It is local to
Curriculum; no shared contracts, Learning code, or World consumers are changed.
The format vocabulary reuses `shared/src/curriculum.ts`'s `learningFormatSchema`.
A recognized format is not a promise that content exists for a particular concept.

## Contract

`src/content-capabilities.ts` defines `CurriculumCapabilityPort`:

```ts
interface CurriculumCapabilityPort {
  getCapabilities(input: {
    courseId: string;
    topicId: string;
    conceptId: string;
    curriculumVersion: number;
    locale: "en" | "es";
  }): Promise<CurriculumCapabilityResponse>;
}
```

The response contains:

- `contractVersion: 1` (discovery contract version, separate from curriculum version).
- `courseId`, `topicId`, `conceptId`, `locale`: the requested identifiers and language.
- `curriculumVersion`: the active version when known.
- `formats`: every recognized format, once, in stable vocabulary order.

Each format entry contains:

```ts
{
  format: LearningFormat;
  available: boolean;
  availableRepresentations: ContentRepresentation[];
  sourceChunkIds: string[];
  generationAvailable: false;
  playableMediaAvailable: false;
  unavailableReason?: CapabilityUnavailableReason;
}
```

`unavailableReason` is present only when `available` is false. No URL, media file,
resource ID, or generated artifact is fabricated. Availability refers to existing
approved demo source content, not to an automatic conversion/generation service.
An available entry provides the source chunk IDs supporting that format.

## History topic discovery

Use `CurriculumTopicCapabilityService.getTopicCapabilities()` for History. This
additive contract requires course, topic, curriculum version, and locale; it does
not require or invent a concept ID. Geometry's `getCapabilities()` is unchanged.

From a future server consumer in `backend/modules/learning/src/`:

```ts
import { CurriculumTopicCapabilityService } from "../../curriculum/src/topic-capability-service.js";
import {
  MockCurriculumRepository,
  MockCourseAccessPolicy,
} from "../../curriculum/src/mock-repository.js";

const discovery = new CurriculumTopicCapabilityService(
  new MockCurriculumRepository(),
  new MockCourseAccessPolicy(),
  { userId: "demo-student", courseIds: ["course-history-1"] },
);
const english = await discovery.getTopicCapabilities({
  courseId: "course-history-1",
  topicId: "topic-comparing-rights",
  curriculumVersion: 1,
  locale: "en",
});
const spanish = await discovery.getTopicCapabilities({
  courseId: "course-history-1",
  topicId: "topic-comparing-rights",
  curriculumVersion: 1,
  locale: "es",
});
```

Both locales currently report these available outputs:

| Format    | Available representation | Resource lookup                                             |
| --------- | ------------------------ | ----------------------------------------------------------- |
| `text`    | `text_excerpt`           | `sourceChunkIds`; no generated text resource is implied     |
| `slides`  | `slide_outline`          | `resourceIds` from `HistoryResourceService.listResources()` |
| `podcast` | `script`                 | `resourceIds` from `HistoryResourceService.listResources()` |
| `music`   | `lyrics`                 | `resourceIds` from `HistoryResourceService.listResources()` |

The response has `contractVersion: 1`, the requested scope/locale, and every
recognized format. Each format has the existing availability fields plus
`resourceIds: string[]`. Source-text entries have no resource IDs. Responses do
not include `conceptId`, URLs, or playable media. Returned resource IDs refer to
the same language-specific resources listed by the reader; cited source IDs are
also language-specific. Generation and playable-media flags remain false.

This is resource-backed topic discovery: source-text availability is derived from
sources cited by the eligible authored resources. Topics without those resources
currently report `not_authored`, even if other raw topic-level text exists.
It does not replace general source-library listing or concept-level retrieval.

The reader validates access and citation integrity before discovery returns.
Formats with authored fixtures whose sources are missing/unready report
`no_approved_content`; formats with no authored resource report `not_authored`.
A different topic or course cannot borrow these resources. Invalid requests,
forbidden access, unknown topics, and stale versions throw the reader's explicit
`INVALID_INPUT`, `FORBIDDEN`, `NOT_FOUND`, and `VERSION_MISMATCH` errors. This new
topic interface uses those reader errors; the existing concept response behavior
is preserved. Source corruption is an error, not an available capability.

See `HISTORY_RESOURCES.md` for authored text and citations. Shared exports, HTTP
routes, and UI wiring remain separate integration work.

## Formats and representations

`learningFormatDefinitions` records the recognized vocabulary and potential
representations. Potential representations are distinct from a response's
`availableRepresentations`, which lists only existing outputs.

| Format           | Potential representation             | Available now for Geometry concept discovery            |
| ---------------- | ------------------------------------ | ------------------------------------------------------- |
| `text`           | `text_excerpt`                       | Spanish source text for all three Geometry concepts     |
| `worked_example` | `text_excerpt`                       | Triangle-area calculation in the existing formula chunk |
| `visual_summary` | `outline`                            | No authored visual-summary outline                      |
| `slides`         | `slide_outline`, `presentation_file` | Neither exists                                          |
| `audio`          | `script`, `playable_audio`           | Neither exists                                          |
| `podcast`        | `script`, `playable_audio`           | Neither exists                                          |
| `music`          | `lyrics`, `playable_audio`           | Neither exists                                          |
| `video`          | `script`, `playable_video`           | Neither exists                                          |
| `reel`           | `script`, `playable_video`           | Neither exists                                          |

The rectangle decomposition is currently source text; it is not advertised as a
visual asset. A script is not playable audio/video, lyrics are not an audio track,
and a slide outline is not a presentation file. Future implementations must
report the representation actually available and preserve grounded citations.
Timelines, study guides, and storytelling can later be structured text resources;
this task does not introduce additional format enum values or claim those
resources have been authored.

## Using discovery from Daniela's server module

For a future file in `backend/modules/learning/src/`:

```ts
import { CurriculumCapabilityService } from "../../curriculum/src/capability-service.js";
import {
  MockCurriculumRepository,
  MockCourseAccessPolicy,
} from "../../curriculum/src/mock-repository.js";

const capabilities = new CurriculumCapabilityService(
  new MockCurriculumRepository(),
  new MockCourseAccessPolicy(),
  { userId: "demo-student", courseIds: ["course-math-1"] },
);
const result = await capabilities.getCapabilities({
  courseId: "course-math-1",
  topicId: "topic-geometry",
  conceptId: "math.geometry.triangle_area",
  curriculumVersion: 1,
  locale: "es",
});
const available = result.formats.filter((format) => format.available);
// text + worked_example, both as text_excerpt; no generation or playable media.
```

Use `LearningCurriculumContextAdapter.retrieve()` for the cited source content.
Discovery returns all eligible source IDs without a query; retrieval returns the
matching subset for the student's query. Discovery is not a guarantee that every
query will match. A `worked_example` entry refers specifically to the cited
existing calculation; there is no new format-rendering or download endpoint.

Trusted server access is bound at construction, not accepted from the request.
The same explicit Mathematics course/topic aliases used by retrieval are accepted.
History has no concept catalog yet, so History concept requests report
`concept_not_found`; its existing topic-level text retrieval is unchanged.

## Availability rules and errors

The service checks authorization before disclosing existence, then requires the
requested active version, a cataloged concept in the exact course/topic, ready
materials, explicitly approved concept-to-chunk bindings, and the requested source
locale. It does not silently translate or borrow another concept's content.

Unavailable reasons are:

- `concept_not_found`: no concept in the requested course/topic.
- `curriculum_version_mismatch`: request does not match the active version.
- `no_approved_content`: no eligible source in that scope and locale.
- `insufficient_evidence`: mapped source is marked insufficient for explanation.
- `not_authored`: content for that format has not been authored.

Malformed requests throw `CurriculumError("INVALID_INPUT", ...)`; denied access
throws `FORBIDDEN`. Missing or unavailable media remains an explicit unavailable
format, not a fabricated playable resource. English Geometry content is currently
unavailable. Production authorization and publishing workflows remain separate.

## Verification

```sh
pnpm --filter @athena/api exec tsx --test ../modules/curriculum/tests/capability-service.test.ts
pnpm --filter @athena/api exec tsx --test ../modules/curriculum/tests/topic-capability-service.test.ts
pnpm exec tsc -p backend/modules/curriculum/tsconfig.json
```

Tests cover vocabulary consistency, truthful availability, discovery-to-retrieval
source consistency, all three Geometry concepts, locales, stale versions, UUID
aliases, unapproved/unready sources, access checks, request validation, and copies.
After branch synchronization, the team can agree on shared Zod validation and
exports without creating a competing schema or changing another owner's files
in this task. No HTTP route, generation provider, upload, or PDF support is added.
