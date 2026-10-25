# Adaptive Learning and Assessment

Subsystem 2 implements evidence-driven diagnostics, checkpoint evaluation, knowledge estimation,
teaching-strategy selection, deterministic mastery, recommendations and retention scheduling.

## Implemented foundation

- `POST /api/learning/diagnostic`
- `POST /api/learning/attempt`
- `GET /api/learning/quiz/:topicId`
- `GET /api/learning/student/:studentId/state`
- Bayesian Knowledge Tracing as an advisory estimate
- guarded contextual Thompson sampling primitives
- deterministic mastery calculation that excludes hinted attempts
- prerequisite-filtered recommendation ranking
- spaced-retention scheduling
- deterministic adaptive question selection using required-concept coverage, active misconceptions,
  knowledge-adjusted difficulty, transfer practice and recent-question avoidance
- in-memory repositories and a deterministic assessment catalog
- domain events for diagnostics, misconceptions, checkpoints, mastery and strategy changes

## Integration boundaries

`CurriculumContextPort` is the seam for Vianey's authorized, cited retrieval implementation.
`TutorProvider` is the seam for grounded Gemini output. Neither provider may write mastery.

The Learning-side consumer contract lives in `shared/src/learning-curriculum.ts`. It validates
stable concept keys, concept-to-topic mappings, curriculum-version filters, cited context chunks,
and explicit unsupported responses. P1 remains authoritative for the catalog and retrieval
implementation; this contract is provisional until Daniela and Vianey approve it together.

The concept ids and three-concept Geometry fixture in `shared/src/mocks/demo-learning.ts` are
intentionally centralized and provisional until Daniela and Vianey freeze the shared catalog. The
generic `/api/ai/prompt` endpoint remains a developer demo and must not be used as the tutor.

The quiz route returns only learner-safe question fields. Answer keys and misconception-answer maps
remain inside the backend assessment repository.
