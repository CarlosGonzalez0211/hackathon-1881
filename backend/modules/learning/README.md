# Adaptive Learning and Assessment

Subsystem 2 implements evidence-driven diagnostics, checkpoint evaluation, knowledge estimation,
teaching-strategy selection, deterministic mastery, recommendations and retention scheduling.

## Implemented foundation

- `POST /api/learning/diagnostic`
- `POST /api/learning/attempt`
- `GET /api/learning/quiz/:topicId`
- `POST /api/learning/retention-check`
- `GET /api/learning/student/:studentId/state`
- `GET /api/learning/student/:studentId/mastery?topicIds=a,b`
- `PUT /api/learning/student/:studentId/preferences`
- `GET /api/learning/student/:studentId/recommendation`
- `PUT /api/learning/course/:courseId/topics/:topicId/priority`
- `POST /api/learning/session`
- `POST /api/learning/session/:sessionId/messages`
- `GET /api/learning/session/:sessionId/summary`
- `POST /api/learning/hint`
- Bayesian Knowledge Tracing as an advisory estimate
- guarded contextual Thompson sampling primitives
- student strategy overrides, accessibility blocks, explanations and repeated-failure intervention
- deterministic mastery calculation that excludes hinted attempts
- prerequisite-filtered recommendation ranking
- explainable recommendations with professor priority overrides
- spaced-retention scheduling
- deterministic adaptive question selection using required-concept coverage, active misconceptions,
  knowledge-adjusted difficulty, transfer practice and recent-question avoidance
- in-memory repositories and a deterministic assessment catalog
- server-only Supabase/PostgREST assessment and learning repositories
- domain events for diagnostics, misconceptions, checkpoints, mastery and strategy changes
- World-compatible mastery reads, compact tutor requests and idempotent learning-event delivery
- structured review-required misconception candidates when deterministic patterns do not match

## Integration boundaries

`CurriculumContextPort` is the seam for Vianey's authorized, cited retrieval implementation.
`TutorProvider` is the seam for grounded Gemini output. Neither provider may write mastery.

Tutor orchestration enforces course/topic/concept/version filters, explicit abstention, citation
membership, source/version recording, and hint prompts that never receive an answer key. The mock
and injected Gemini-shaped providers share the same interface and require no credentials in tests.

The Learning-side consumer contract lives in `shared/src/learning-curriculum.ts`. It validates
stable concept keys, concept-to-topic mappings, curriculum-version filters, cited context chunks,
and explicit unsupported responses. P1 remains authoritative for the catalog and retrieval
implementation; this contract is provisional until Daniela and Vianey approve it together.

The concept ids and three-concept Geometry fixture in `shared/src/mocks/demo-learning.ts` are
intentionally centralized and provisional until Daniela and Vianey freeze the shared catalog. The
generic `/api/ai/prompt` endpoint remains a developer demo and must not be used as the tutor.

The quiz route returns only learner-safe question fields. Answer keys and misconception-answer maps
remain inside the backend assessment repository.

`data/supabase/migrations/0200_learning.sql` owns Daniela's database range. It enables RLS and
revokes direct browser access by default; Carlos must review final production policies before a
shared project applies the migration. `SupabaseLearningRestClient` requires a backend-only
service-role key and can be replaced by a test driver through the same interface.

## World integration

`LearningMasteryReadAdapter` implements World's read-only `MasteryReadPort`. Requested topics with
no evidence return mastery `0`; stored mastery remains deterministic and owned by Learning.

The session and hint routes accept both Daniela's full request contracts and the compact World
contracts. Compact requests currently resolve to the shared Geometry demo course, concept and
assessment identifiers. Replace that resolver with Vianey's approved topic-to-concept catalog when
the cross-owner concept IDs are frozen.

`connectLearningEventsToWorld` maps mastery, misconception resolution, strategy-change and
retention events to the World schema. `HttpWorldEventSink` retries the same stable event body, and
World is expected to ignore duplicate IDs. Configure that HTTP sink at composition time when the
World module is available in the target environment; the default in-memory sink keeps local tests
and isolated development credential-free.
