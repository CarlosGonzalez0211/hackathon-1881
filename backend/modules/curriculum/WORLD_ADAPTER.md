# World-facing curriculum topic adapter

`WorldCurriculumTopicAdapter` is a Person 1 implementation of World's existing
read-only `listTopics(courseId): Promise<CurriculumTopicSummary[]>` shape.
It is exported by `@athena/curriculum`. No World, Learning, engine, API composition,
shared contract, or source curriculum fixture is edited by this task.

## Example

A future trusted server composition layer can construct:

```ts
import {
  WorldCurriculumTopicAdapter,
  MockCurriculumRepository,
  MockCourseAccessPolicy,
} from "@athena/curriculum";

const curriculum = new WorldCurriculumTopicAdapter(
  new MockCurriculumRepository(),
  new MockCourseAccessPolicy(),
  { userId: "demo-student", courseIds: ["course-math-1"] },
);
const topics = await curriculum.listTopics("course-math-1");
```

The `curriculum` object can later replace World's injected mock curriculum port.
Actual application wiring is not changed here. The mock access policy is an
explicit offline allowlist, not authentication; real composition must bind trusted
access through Platform. Access is checked before repository reads. Unknown
courses return `[]` when the caller is authorized to perform that lookup;
unauthorized lookups still throw `FORBIDDEN`. Invalid IDs throw `INVALID_INPUT`.

## Preserving the Mathematics demo

The default adapter output exactly matches the existing shared
`demoCurriculumTopics`: six topics with the same string IDs, titles, orders 0–5,
thresholds, prerequisites, and publication state when their materials are ready.
World continues to own house slot assignment, progress projection, entry gates,
mastery-driven unlocks, and overflow handling. The adapter writes none of these.

Two underlying Person 1 prerequisites still differ from the shipped World demo:

| Topic             | Source curriculum      | Default World compatibility view |
| ----------------- | ---------------------- | -------------------------------- |
| Statistics        | Functions              | Geometry                         |
| Critical Thinking | Probability + Geometry | Functions + Probability          |

With `preserveMathematicsDemo: true` (default), the adapter explicitly uses the
existing World demo prerequisites for its known Mathematics topics. It reads those
prerequisites from the shared fixture rather than creating another copied graph.
No source fixture, World fixture, concept prerequisite, student mastery, or house
assignment is rewritten. This is a temporary demo compatibility projection,
not agreement that the two authoritative graphs have been unified.

`preserveMathematicsDemo: false` exposes the underlying Person 1 graph. Do not use
that option in the existing demo until the owners agree on progression changes.
Ordering and thresholds always come from the requested course's topic records;
adding another course does not overwrite the Mathematics order sequence.

## Publication behavior

`publishedTopicIds` is an explicit mock publication manifest. It defaults to the
published Mathematics topic IDs in the shipped World fixture plus the six History topic IDs. A topic is marked
published only when its ID is in the manifest **and** it has at least one ready
material in the active course/version. Draft topics are returned with
`published: false`; World already filters them.

History topics are returned only when History is requested and are published by
default for authorized readers. A custom manifest can restrict publication. Ready content is still
required. No enrollment or default world is switched to History.

Publication intent is copied at construction, and each read rechecks material
readiness. This is not a professor publishing endpoint or a persisted approval
workflow. No events are emitted. Source ingestion and publication APIs remain
separate tasks.

The output is validated with the existing shared summary schema. Duplicate IDs,
duplicate orders, missing prerequisite references, and prerequisite cycles throw
rather than pass an invalid graph to World. Sources and returned arrays are not
mutated. Topics ordered 6 and above use World's existing overflow support; the
adapter does not add 3D slots.

## Tests and scope

```sh
pnpm build:platform
pnpm --filter @athena/api exec tsx --test ../modules/curriculum/tests/world-curriculum-adapter.test.ts
pnpm exec tsc -p backend/modules/curriculum/tsconfig.tests.json
```

Tests use the actual built World package from its sibling `dist/` directory,
without adding a production dependency or modifying its implementation. They
check structural port compatibility, exact Mathematics summaries, all demo
planet projections, real WorldService class views/layouts/house entries and
Geometry-to-Statistics progression, publication readiness, History isolation,
overflow, denied access, graph integrity, and copies.

This adapter only supplies topic summaries. Person 1's `WorldHouseContentAdapter`
now supplies the companion content projection; see `HOUSE_CONTENT.md`. Material-tab
wiring, authenticated routes, publishing controls, and replacing the running
World mock are subsequent integration steps. Those changes need their own scoped
review; this task does not imply the UI is connected to Person 1 yet.
