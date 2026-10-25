# Geometry concept catalog

Vianey supplies concept metadata. Daniela uses it to connect questions, tutoring,
and mastery evidence. This catalog performs no assessment or mastery calculation.

## Stable definitions

Every row belongs to course `course-math-1`, topic `topic-geometry`, curriculum
version `1`. Learning's UUID aliases are recorded in `INTEGRATION_IDS.md`; no ID
translation is implemented in this task.

| Immutable concept ID                 | Title                         | Prerequisite concept IDs                                             | Required for mastery |
| ------------------------------------ | ----------------------------- | -------------------------------------------------------------------- | -------------------- |
| `math.geometry.rectangle_area`       | Área de rectángulos           | None                                                                 | No                   |
| `math.geometry.triangle_base_height` | Base y altura de un triángulo | None                                                                 | Yes                  |
| `math.geometry.triangle_area`        | Área de triángulos            | `math.geometry.rectangle_area`, `math.geometry.triangle_base_height` | Yes                  |

Rectangle area supports the explanation of triangle area, but is not an
independently required Geometry mastery target in Daniela's current fixtures.
That does not remove it as a prerequisite concept. Daniela owns how supporting
knowledge and assessed evidence affect mastery; this catalog specifies no scoring
formula or additional assessment gate.

The prerequisite graph is:

```text
math.geometry.rectangle_area ────────┐
                                    ├──> math.geometry.triangle_area
math.geometry.triangle_base_height ─┘
```

The misconception reference is `math.geometry.triangle_area.missing_half`.
It names the missing division by two discussed in the existing demo lesson.
It is not a fourth concept. Detection, student records, and resolution belong to
Person 2.

## Using the catalog

`src/geometry-concept-catalog.ts` exports:

- `geometryConceptCatalog`: the three definitions, in prerequisite-first order.
- `GEOMETRY_CONCEPT_IDS`: the agreed stable strings.
- `GEOMETRY_MISCONCEPTION_ID`: the agreed shared vocabulary reference.
- `CurriculumConceptDefinition`: the read-only metadata shape.

For a future consumer in `backend/modules/learning/src/`:

```ts
import { geometryConceptCatalog } from "../../curriculum/src/geometry-concept-catalog.js";
```

The catalog and its nested prerequisite arrays are frozen. Persist the identifiers;
do not derive them from a translated title or generate them again per request.
A future semantic change should be handled through curriculum versioning rather
than silently reusing an identifier for a different idea.

Field names match Daniela's proposed `CurriculumConcept` shape inspected on
`origin/feat/learning-grounded-tutor` at `edaf75f`. No duplicate Zod schema or shared
barrel export is introduced. After branch synchronization, the team can connect
the catalog to that consumer schema and its UUID mapping through an adapter.

## Scope of this task

The current TXT Geometry lesson contains the triangle formula, perpendicular
height, rectangle decomposition, and a dedicated TXT section explaining how to
select a base and identify its perpendicular height. That section is mapped to
`math.geometry.triangle_base_height` without changing the original two chunk IDs.

This catalog defines the concepts, their prerequisites, and mastery requirement
metadata. The subsequent Person 1 adapter now provides concept-to-chunk mappings,
concept-aware retrieval, and unsupported-content responses; see
`CONCEPT_RETRIEVAL.md`. World publishing integration and a general concept catalog
API remain separate tasks. No student progress, History topics, World house assignments,
shared contracts, or teammate implementation files are changed.

## Verification from repository root

```sh
pnpm --filter @athena/api exec tsx --test ../modules/curriculum/tests/geometry-concept-catalog.test.ts
pnpm exec tsc -p backend/modules/curriculum/tsconfig.json
```
