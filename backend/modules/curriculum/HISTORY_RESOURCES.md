# Authored History learning resources

Six deterministic mock resources support `course-history-1`, topic
`topic-comparing-rights`, curriculum version 1. They use the existing English and
Spanish comparative chronology TXT material; no course/topic IDs or source text
were changed.

| Format  | English                                     | Spanish                                      | Actual representation                             |
| ------- | ------------------------------------------- | -------------------------------------------- | ------------------------------------------------- |
| Podcast | Three revolutions: chronology and questions | Tres revoluciones: cronología y preguntas    | Two-host text script                              |
| Music   | Chronology memory refrain                   | Estribillo de la cronología                  | Original mnemonic lyrics                          |
| Slides  | Slide outline: comparing revolutions        | Guion de diapositivas: comparar revoluciones | Five factual slide blocks and a discussion prompt |

Readable TXT copies are in `fixtures/history-resources/`. The typed versions are
in `src/history-resource-catalog.ts`, validated against the existing shared
`generatedResourceSchema`. They are authored examples, not live model outputs.

## Grounding

Every academic block contains an exact excerpt from a source chunk and its own
citation. The resource-level citation list aggregates those block citations.
Citations include material ID/title, source section, chunk ID, and exact excerpt.
There are no invented URLs, primary-source documents, or page numbers.

The material is explicitly an authored teaching fixture attributed to a fictional
demo instructor. Resource `status: approved` means approved within this mock
scenario; it does not claim a real professor reviewed these examples.

The factual content covers the three revolutions' timeline, overlapping dates,
and comparison of claims about rights with evidence. Creative hosting questions
and original mnemonic refrains are marked `framing`; they add no historical facts.
These intentionally short samples remain within the supplied source evidence.
They do not claim to cover the entire 1750–1850 survey.

## Media honesty

Each resource has `structuredContent` with:

- `title`, `representation`, `provenance: authored_demo`, and `playable: false`.
- `blocks`, each containing `kind`, `label`, `body`, and citations.

Podcasts are `script`, music is `lyrics`, and slides are `slide_outline`.
There are no audio tracks, videos, presentation files, download URLs, or generation
providers. Generation and media rendering remain unavailable.

## Accessing resources

A future server consumer in `backend/modules/learning/src/` can use:

```ts
import { HistoryResourceService } from "@athena/curriculum";
import { MockCurriculumRepository, MockCourseAccessPolicy } from "@athena/curriculum";

const resources = new HistoryResourceService(
  new MockCurriculumRepository(),
  new MockCourseAccessPolicy(),
  { userId: "demo-student", courseIds: ["course-history-1"] },
);
const spanish = await resources.listResources({
  courseId: "course-history-1",
  topicId: "topic-comparing-rights",
  curriculumVersion: 1,
  locale: "es",
});
// Three resources: podcast script, mnemonic lyrics, and slide outline.
```

Bind access from trusted server context. The mock policy is an offline allowlist,
not authentication. Resources are returned only if all cited sources are present,
in the correct scope/locale, and ready. Source changes that invalidate citations
throw rather than return stale teaching content. Results are copied.

History resources are topic-level: no History concepts are invented. The existing
Geometry concept discovery contract remains unchanged. Use
`CurriculumTopicCapabilityService.getTopicCapabilities()` to discover History
formats by topic and locale, then `listResources()` to read the returned resource
IDs. See `CONTENT_CAPABILITIES.md` for examples. Shared exports, HTTP routes, and
World UI wiring remain separate integration tasks.

## Verification

```sh
pnpm --filter @athena/api exec tsx --test ../modules/curriculum/tests/history-resources.test.ts
pnpm exec tsc -p backend/modules/curriculum/tsconfig.tests.json
```

Tests verify all six resources, block-level source evidence, TXT synchronization,
locale/scope/version isolation, source readiness, citation corruption, access
checks, and input validation. Mathematics and teammate implementations are intact.
