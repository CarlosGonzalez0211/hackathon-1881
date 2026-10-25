# Curriculum IDs for Vianey and Daniela

Task 2: record the course/topic IDs already used by Person 1 and map Mathematics
to the UUID-shaped identifiers in Daniela's Learning fixtures. This document
records the integration boundary; it does not implement an adapter, rename any
stored IDs, or claim that all team contracts are finalized.

## Course IDs

Keep these Person 1 IDs stable for the current demo, curriculum version 1:

| Course                                                           | Curriculum / World ID | Learning alias                                                  | Instructor ID in Person 1 |
| ---------------------------------------------------------------- | --------------------- | --------------------------------------------------------------- | ------------------------- |
| Mathematics I                                                    | `course-math-1`       | `00000000-0000-4000-8000-000000000a01` (`athenaDemoIds.course`) | `prof-ruiz`               |
| Atlantic Revolutions: Rights, Citizenship, and Change, 1750–1850 | `course-history-1`    | None defined yet                                                | `prof-rivera`             |

Mathematics' instructor alias is `athenaDemoIds.professorRuiz`, currently
`00000000-0000-4000-8000-000000000001`. Identity and enrollment resolution must use
the platform boundary when real access is connected. This table grants no access.
Do not generate a new alias on every retrieval request.

## Mathematics topic IDs

The string IDs and orders below match the current World topic contract. Keep
them unchanged. The UUID aliases identify the corresponding Learning fixtures;
they do not replace World identifiers or require rewriting student mastery data.

| Order | Topic               | Curriculum / World ID     | Learning alias (`athenaDemoIds.topics`)                     |
| ----: | ------------------- | ------------------------- | ----------------------------------------------------------- |
|     0 | Fracciones          | `topic-fractions`         | `00000000-0000-4000-8000-000000000b01` (`fractions`)        |
|     1 | Geometría           | `topic-geometry`          | `00000000-0000-4000-8000-000000000b02` (`geometry`)         |
|     2 | Funciones           | `topic-functions`         | `00000000-0000-4000-8000-000000000b03` (`functions`)        |
|     3 | Estadística         | `topic-statistics`        | `00000000-0000-4000-8000-000000000b04` (`statistics`)       |
|     4 | Probabilidad        | `topic-probability`       | `00000000-0000-4000-8000-000000000b05` (`probability`)      |
|     5 | Pensamiento crítico | `topic-critical-thinking` | `00000000-0000-4000-8000-000000000b06` (`criticalThinking`) |

A future Learning-facing adapter should resolve these aliases into Person 1's
IDs before accessing the catalog or source chunks. It must validate that course,
topic, and curriculum version agree, enforce trusted access, and preserve the
response shape agreed with Daniela. Alias translation must not fall back to a
different course, silently invent content, or change World house assignments.

## History topic IDs

History is a separate course with its own order sequence. Orders are unique
within a course, not across the entire catalog. These topics must only be supplied
when `course-history-1` is requested. Adding History does not change the
Mathematics enrollment or the six Mathematics house slots.

| Order | Topic ID                    | Title                                  | Prerequisite topic IDs                                                             |
| ----: | --------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------- |
|     0 | `topic-historical-evidence` | Historical evidence and chronology     | None                                                                               |
|     1 | `topic-atlantic-context`    | Atlantic societies and political ideas | `topic-historical-evidence`                                                        |
|     2 | `topic-american-revolution` | American Revolution                    | `topic-atlantic-context`                                                           |
|     3 | `topic-french-revolution`   | French Revolution                      | `topic-atlantic-context`                                                           |
|     4 | `topic-haitian-revolution`  | Haitian Revolution                     | `topic-atlantic-context`, `topic-french-revolution`                                |
|     5 | `topic-comparing-rights`    | Comparing rights and citizenship       | `topic-american-revolution`, `topic-french-revolution`, `topic-haitian-revolution` |

No History UUID aliases or enrollments have been created. Its prerequisites
represent the authored demo teaching sequence, not historical causal claims.
History must use the same catalog and retrieval contracts as Mathematics.

## Prerequisite differences to resolve during integration

This task preserves code on both sides. It does not silently choose a replacement
graph or modify progression. The following differences were observed:

| Topic             | Person 1 local fixture   | World contract on `origin/main` |
| ----------------- | ------------------------ | ------------------------------- |
| Statistics        | Functions                | Geometry                        |
| Critical Thinking | Probability and Geometry | Functions and Probability       |

Daniela's inspected recommendation catalog also differs: it currently gives
Geometry no prerequisites and makes Functions depend on Geometry, while Person 1
and World make both depend on Fractions. Treat that catalog as a consumer mock,
not a reason to rewrite World or student mastery fixtures.

The safe integration target is one explicit graph supplied by Curriculum and
consumed through adapters. Preserve World's current demo behavior while the
owners reconcile these differences. No graph change is implemented here.

## Geometry concept catalog

The course/topic mapping above does not define concepts. The agreed Geometry
names already appear in Daniela's fixtures:

- `math.geometry.rectangle_area`
- `math.geometry.triangle_base_height`
- `math.geometry.triangle_area`

The misconception key is `math.geometry.triangle_area.missing_half`.
Person 1 supplies concept metadata and grounded content; Person 2 owns assessment,
mastery calculation, and misconception detection/resolution. The three concepts,
their prerequisites, and required-for-mastery flags are now defined in
`src/geometry-concept-catalog.ts`; see `GEOMETRY_CONCEPTS.md` for usage.
Concept-aware retrieval and the recorded Mathematics UUID translation are now
provided by the Person 1 adapter described in `CONCEPT_RETRIEVAL.md`.

## Evidence inspected

Snapshot reviewed on October 25, 2026:

- Person 1 commit: `495738f912f9c67ee15f823f8cea95ff2ed0de03`.
- `origin/main` at `789e39c`: `shared/src/contracts/curriculum-world.ts`,
  `shared/src/mocks/demo-identities.ts`, `docs/contracts/P1-curriculum-world.md`.
- `origin/feat/learning-grounded-tutor` at `edaf75f`:
  `shared/src/mocks/demo-identities.ts`, `shared/src/mocks/demo-learning.ts`,
  `shared/src/learning-curriculum.ts`, and
  `backend/modules/learning/src/recommendation-catalog.ts`.

These are inspected remote snapshots, not confirmation of Daniela's current
active branch. Fetch again before integrating. The remote contract documents
explicitly remain proposals subject to team agreement.

## How Daniela can use this

Use the existing Person 1 README for topic-level catalog/retrieval examples.
That service retains its existing shape. For Learning's concept-aware retrieval
contract and Mathematics UUID aliases, use `LearningCurriculumContextAdapter`
as shown in `CONCEPT_RETRIEVAL.md`. Access must be bound by the server caller.

The work is on `feat/vianey-workspace`. Commit `495738f` contains the foundation;
this ID document is included in the subsequent handoff work. Use `git log -1`
for the current handoff SHA. It is not available on GitHub until the branch is pushed.
