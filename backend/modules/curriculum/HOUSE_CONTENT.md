# World HouseContent adapter

`WorldHouseContentAdapter` supplies the exact method shape of World's existing
`CurriculumContentClient`: `getHouseContent(topicId): Promise<HouseContent>`.
It is exported by `@athena/curriculum` and validates every response against the
existing `houseContentSchema`. No shared schema, World component, client, route,
engine code, house assignment, or student progress is changed.

## Server-side example: Mathematics

```ts
import {
  WorldHouseContentAdapter,
  MockCurriculumRepository,
  MockCourseAccessPolicy,
} from "@athena/curriculum";

const content = new WorldHouseContentAdapter(
  new MockCurriculumRepository(),
  new MockCourseAccessPolicy(),
  { userId: "demo-student", courseIds: ["course-math-1"] },
  { courseId: "course-math-1", locale: "es" },
);
const geometry = await content.getHouseContent("topic-geometry");
```

The one-argument method is preserved by binding course, language, trusted access,
and publication options at construction. This is a server-side adapter, not a
browser authentication mechanism. Production composition must use Platform's
identity/enrollment policy rather than the offline mock allowlist.

The default publication manifest and Mathematics compatibility behavior are the
same as `WorldCurriculumTopicAdapter`; see `WORLD_ADAPTER.md`. The six existing
Mathematics houses have ready TXT material and inline text resources. Geometry
has its original formula/decomposition plus the base-and-height lesson.

## Server-side example: History

```ts
const history = new WorldHouseContentAdapter(
  new MockCurriculumRepository(),
  new MockCourseAccessPolicy(),
  { userId: "demo-student", courseIds: ["course-history-1"] },
  {
    courseId: "course-history-1",
    locale: "en",
    publishedTopicIds: ["topic-comparing-rights"],
  },
);
const comparison = await history.getHouseContent("topic-comparing-rights");
```

Use `locale: "es"` for Spanish. History is published by default for authorized course readers. A trusted server
may override the publication manifest to hide topics.
This does not change enrollment or replace Mathematics topics in the running
world. Both languages return one source card plus the podcast script, mnemonic
lyrics, and slide outline for the comparison topic.

## Contract mapping

| HouseContent field              | Person 1 source                                                                    |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| `topicId`, `courseId`, `title`  | Authorized topic/course metadata                                                   |
| `materials`                     | Ready `text/plain` materials with matching source chunks in the requested language |
| `resources` with `format: text` | Exact TXT source chunks plus inline source references                              |
| Other `resources`               | Approved History resources, rendered as plain text bodies                          |
| `updatedAt`                     | Latest included material upload/course update timestamp; deterministic in mocks    |

World's material shape has no inline text field and the existing panel displays
resource bodies. Therefore each TXT chunk becomes a source text card with a stable
`resource-source-<chunkId>` ID. That card contains the exact source text and its
material title/ID, section, and chunk ID. It is a direct source view, not a claim
that a new AI-generated resource exists. No text is added to unsupported material
fields, and no signed/download URL is invented.

History resource IDs and formats are preserved. Each body includes its actual
representation (`script`, `lyrics`, `slide_outline`), demo/no-media label,
original blocks, and source references with exact cited excerpts. The existing
contract has no structured citation field, so references are inline in `body`.
For structured citations or capability metadata, continue using Person 1's
existing reader/discovery contracts.

No resource has a fabricated URL. Materials have no fake PDF page count. Podcast
and music text are not playable audio, and slide outlines are not presentation
files. `summary` is omitted because we have no separate instructor-authored topic
introductory summary. Titles and source content are not silently translated.

## Access, publishing, and missing content

- Access is checked before topic lookup or publication metadata is disclosed.
- Unknown or cross-course topics throw `NOT_FOUND`.
- Unpublished topics or topics without ready material throw `FORBIDDEN`.
- Blank IDs or invalid bound locale/course throw `INVALID_INPUT`.
- Source chunks must match the active course/topic/version, ready TXT material,
  and requested locale. Citations are validated before returning content.
- When the topic is published but no source exists in that language, `materials`
  and `resources` are empty. The contract has no unsupported-language field;
  capability discovery can explain availability separately.
- Missing cited chunks hide stale History resources. Changed text that invalidates
  their citations throws rather than displays unsupported academic claims.
- Results are deterministic copies; reads do not publish topics or write progress.

Publication and source checks are content access rules. World still owns its
mastery-based entry gate. This adapter does not duplicate or override that gate.

## Verification and next boundary

```sh
pnpm build:platform
pnpm --filter @athena/api exec tsx --test ../modules/curriculum/tests/house-content-adapter.test.ts
pnpm exec tsc -p backend/modules/curriculum/tsconfig.tests.json
```

The tests validate the exact World wire shape, real TXT text, both History
languages, citations and media labeling, all six Mathematics topics, publication,
access denial, source readiness, course isolation, missing languages/chunks,
corrupt citations, invalid input, and copy isolation.

The adapter now backs the authenticated `GET /api/topics/:topicId/sources`
route; see `API_ROUTES.md`. It is not yet connected to the running World browser
mock. World UI/client wiring is a separate
scoped integration step; no frontend file is edited here.
