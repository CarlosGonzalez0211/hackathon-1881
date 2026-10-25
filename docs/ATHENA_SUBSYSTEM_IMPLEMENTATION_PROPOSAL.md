# Athena Subsystem Implementation Proposal

## Document purpose

This document proposes how to implement Athena as four independently developed, end-to-end subsystems:

1. Curriculum and Content Intelligence.
2. Adaptive Learning and Assessment.
3. World, Progression, and Collaboration.
4. Analytics and Platform.

Each subsystem includes:

- Backend services and repository classes.
- Zod API contracts.
- Supabase/Postgres tables.
- Fastify routes.
- Frontend feature folders and API adapters.
- Contract-valid mock implementations.
- Tests and demo data.
- Events used during final integration.

This is an implementation proposal, not a claim that the described services are already complete.

## 1. Architectural approach

### 1.1 Monorepo organization

```text
frontend/
  brand/
  engine3d/
  web/
    src/
      app/
      features/
        curriculum/
        learning/
        world/
        analytics/
      lib/
        api/

backend/
  api/
    src/
      routes/
      plugins/
      app.ts
  modules/
    curriculum/
    learning/
    world/
    analytics/
    platform/

ai/
  gemini/
  rag/
  tutor/
  content-generation/

data/
  supabase/
    migrations/
    seeds/

shared/
  src/
    curriculum.ts
    learning.ts
    world.ts
    analytics.ts
    events.ts
    common.ts
    mocks/
```

### 1.2 Domain-service pattern

Every backend subsystem follows the same structure:

```text
routes -> service -> repository interface -> production repository
                         |
                         +-> mock repository
```

Routes handle HTTP concerns only:

- Identity and authorization context.
- Request parsing.
- Zod validation.
- Status codes.
- Response serialization.

Services contain domain rules. Repositories contain database or provider access.

### 1.3 Dependency injection

Fastify should register subsystem dependencies as plugins.

```ts
export interface AthenaServices {
  curriculum: CurriculumService;
  learning: LearningService;
  world: WorldService;
  analytics: AnalyticsService;
  auth: AuthService;
  events: DomainEventStore;
}

export interface ServiceOptions {
  mode: "real" | "mock";
  clock: Clock;
  idGenerator: IdGenerator;
}
```

The `Clock` and `IdGenerator` abstractions keep demo data and tests deterministic.

### 1.4 Mock-mode rules

Mock mode should be a complete alternate implementation, not scattered `if` statements.

```ts
export interface DataSource<TProduction, TMock> {
  real: TProduction;
  mock: TMock;
}
```

Recommended environment variables:

```text
ATHENA_DATA_MODE=mock|real
ATHENA_AI_MODE=mock|real
NEXT_PUBLIC_USE_MOCKS=true|false
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Behavior:

- `ATHENA_DATA_MODE=mock` uses in-memory or fixture repositories.
- `ATHENA_AI_MODE=mock` returns pre-authored grounded tutor outputs.
- Frontend mock mode imports shared fixtures directly.
- Frontend real mode calls Fastify.
- Both modes validate responses with the same Zod schemas.

### 1.5 Common contracts

```ts
import { z } from "zod";

export const idSchema = z.string().min(1);
export const isoDateSchema = z.string().datetime();
export const localeSchema = z.enum(["en", "es"]);
export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(25),
});

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
  traceId: z.string().optional(),
});
```

## 2. Shared demo dataset

All four subsystems should use one coherent fixture set.

### 2.1 Demo identities

```text
Professor: Prof. Elena Ruiz
Class: Matemáticas I - Grupo A
Primary student: Lucía Torres
Additional students: seven classmates
Locale: Spanish, with English enabled
```

### 2.2 Demo topics

| Slot | Topic               | Initial state for Lucía | Purpose                         |
| ---: | ------------------- | ----------------------- | ------------------------------- |
|    0 | Fracciones          | Completed, 100%         | Demonstrates mastered topic     |
|    1 | Geometría           | In progress, 40%        | Main adaptive-learning scenario |
|    2 | Funciones           | Available, 0%           | Recommended after Geometry      |
|    3 | Estadística         | Locked                  | Prerequisite demonstration      |
|    4 | Probabilidad        | Locked                  | Prerequisite demonstration      |
|    5 | Pensamiento crítico | Locked                  | Future cross-topic challenge    |

### 2.3 Main misconception

Lucía confuses the triangle-area formula with the rectangle-area formula. She calculates `base x height` instead of `(base x height) / 2`.

### 2.4 Two teaching strategies

1. `worked_example`: guided text with a solved example.
2. `visual_decomposition`: visual explanation showing a rectangle divided into two equal triangles.

### 2.5 Demo progression

```text
Geometry mastery: 0.40
First checkpoint: incorrect
Strategy changes to visual_decomposition
Second checkpoint: correct with reasoning
Geometry mastery: 0.60
Achievement: insight-lantern
House: in_progress stage 2
Planet growth: increases
Professor intervention status: resolved
```

### 2.6 Deterministic demo reset

Provide a protected development endpoint or local script:

```text
POST /api/demo/reset
```

It resets mock state to the exact opening scenario. This route must be unavailable in production unless explicitly protected and enabled.

# 3. Subsystem 1 - Curriculum and Content Intelligence

## 3.1 Responsibility

Person 1 owns everything related to professor-controlled academic material:

- Courses and topics.
- Topic prerequisites.
- Material upload and processing.
- Text extraction, chunking, and embeddings.
- Retrieval and citations.
- Generated formats, languages, and themes.

## 3.2 Shared Zod schemas

```ts
import { z } from "zod";

export const materialStatusSchema = z.enum([
  "uploaded",
  "extracting",
  "chunking",
  "embedding",
  "ready",
  "failed",
]);

export const courseSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  title: z.string().min(1),
  description: z.string(),
  locale: z.enum(["en", "es"]),
  activeVersion: z.number().int().positive(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const topicSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  title: z.string().min(1),
  description: z.string(),
  order: z.number().int().nonnegative(),
  prerequisiteTopicIds: z.array(z.string()),
  masteryThreshold: z.number().min(0).max(1),
});

export const materialSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  topicIds: z.array(z.string()),
  filename: z.string(),
  mimeType: z.string(),
  storagePath: z.string(),
  status: materialStatusSchema,
  curriculumVersion: z.number().int().positive(),
  uploadedBy: z.string(),
  uploadedAt: z.string().datetime(),
  error: z.string().optional(),
});

export const citationSchema = z.object({
  materialId: z.string(),
  materialTitle: z.string(),
  page: z.number().int().positive().optional(),
  section: z.string().optional(),
  chunkId: z.string(),
  excerpt: z.string(),
});

export const retrievedContextSchema = z.object({
  courseId: z.string(),
  topicId: z.string(),
  curriculumVersion: z.number().int().positive(),
  chunks: z.array(
    z.object({
      text: z.string(),
      similarity: z.number(),
      citation: citationSchema,
    }),
  ),
});

export const learningFormatSchema = z.enum([
  "text",
  "worked_example",
  "visual_summary",
  "slides",
  "audio",
  "podcast",
  "music",
  "video",
  "reel",
]);

export const generatedResourceSchema = z.object({
  id: z.string(),
  topicId: z.string(),
  format: learningFormatSchema,
  locale: z.enum(["en", "es"]),
  theme: z.string().optional(),
  status: z.enum(["draft", "approved", "rejected"]),
  contentUrl: z.string().optional(),
  structuredContent: z.record(z.unknown()),
  citations: z.array(citationSchema),
});
```

## 3.3 Backend classes and interfaces

```ts
export interface CourseRepository {
  create(input: CreateCourseInput): Promise<Course>;
  getById(courseId: string): Promise<Course | null>;
  update(courseId: string, input: UpdateCourseInput): Promise<Course>;
  listByOwner(ownerId: string): Promise<Course[]>;
}

export interface TopicRepository {
  create(input: CreateTopicInput): Promise<Topic>;
  listByCourse(courseId: string): Promise<Topic[]>;
  update(topicId: string, input: UpdateTopicInput): Promise<Topic>;
  replacePrerequisites(topicId: string, prerequisiteIds: string[]): Promise<void>;
}

export interface MaterialRepository {
  create(input: CreateMaterialInput): Promise<Material>;
  updateStatus(id: string, status: MaterialStatus, error?: string): Promise<void>;
  getById(id: string): Promise<Material | null>;
  listReadyByTopic(topicId: string): Promise<Material[]>;
}

export interface MaterialStorage {
  upload(path: string, bytes: Uint8Array, contentType: string): Promise<void>;
  download(path: string): Promise<Uint8Array>;
  createSignedUrl(path: string): Promise<string>;
}

export interface DocumentExtractor {
  extract(input: Uint8Array, mimeType: string): Promise<ExtractedDocument>;
}

export interface ChunkingStrategy {
  chunk(document: ExtractedDocument): Promise<DocumentChunk[]>;
}

export interface EmbeddingProvider {
  embedDocuments(texts: string[]): Promise<number[][]>;
  embedQuery(text: string): Promise<number[]>;
}

export interface VectorRepository {
  upsert(chunks: EmbeddedChunk[]): Promise<void>;
  search(input: VectorSearchInput): Promise<RetrievedChunk[]>;
}

export interface ContentGenerator {
  generate(input: GenerateResourceInput): Promise<GeneratedLearningResource>;
}
```

Proposed service classes:

```ts
export class CourseService {
  constructor(
    private readonly courses: CourseRepository,
    private readonly topics: TopicRepository,
    private readonly auth: AuthorizationService,
  ) {}
}

export class MaterialIngestionService {
  constructor(
    private readonly materials: MaterialRepository,
    private readonly storage: MaterialStorage,
    private readonly extractor: DocumentExtractor,
    private readonly chunker: ChunkingStrategy,
    private readonly embeddings: EmbeddingProvider,
    private readonly vectors: VectorRepository,
    private readonly events: DomainEventStore,
  ) {}

  async ingest(materialId: string): Promise<void> {
    // Load -> extract -> chunk -> embed -> store -> mark ready -> emit event.
  }
}

export class CurriculumRetrievalService {
  constructor(
    private readonly vectors: VectorRepository,
    private readonly topics: TopicRepository,
    private readonly auth: AuthorizationService,
  ) {}

  async retrieve(input: RetrieveContextInput): Promise<RetrievedContext> {
    // Enforce user/course/topic access before retrieval.
  }
}

export class LearningResourceGenerationService {
  constructor(
    private readonly retrieval: CurriculumRetrievalService,
    private readonly generator: ContentGenerator,
    private readonly resources: GeneratedResourceRepository,
  ) {}
}
```

## 3.4 Database schema proposal

```sql
create table courses (
  id uuid primary key,
  owner_id uuid not null references profiles(id),
  title text not null,
  description text not null default '',
  locale text not null check (locale in ('en', 'es')),
  active_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table topics (
  id uuid primary key,
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  description text not null default '',
  display_order integer not null,
  mastery_threshold numeric not null default 0.8,
  unique (course_id, display_order)
);

create table topic_prerequisites (
  topic_id uuid not null references topics(id) on delete cascade,
  prerequisite_topic_id uuid not null references topics(id) on delete cascade,
  primary key (topic_id, prerequisite_topic_id),
  check (topic_id <> prerequisite_topic_id)
);

create table materials (
  id uuid primary key,
  course_id uuid not null references courses(id) on delete cascade,
  filename text not null,
  mime_type text not null,
  storage_path text not null,
  status text not null,
  curriculum_version integer not null,
  uploaded_by uuid not null references profiles(id),
  uploaded_at timestamptz not null default now(),
  error text
);

create table material_topics (
  material_id uuid not null references materials(id) on delete cascade,
  topic_id uuid not null references topics(id) on delete cascade,
  primary key (material_id, topic_id)
);

create table material_chunks (
  id uuid primary key,
  material_id uuid not null references materials(id) on delete cascade,
  topic_id uuid not null references topics(id) on delete cascade,
  chunk_index integer not null,
  page_number integer,
  section_title text,
  content text not null,
  embedding extensions.vector(768),
  metadata jsonb not null default '{}'::jsonb,
  unique (material_id, chunk_index)
);

create table generated_resources (
  id uuid primary key,
  topic_id uuid not null references topics(id) on delete cascade,
  format text not null,
  locale text not null,
  theme text,
  status text not null default 'draft',
  content_url text,
  structured_content jsonb not null,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);
```

The vector dimension must match the selected embedding model and remain configurable in the migration plan.

## 3.5 Fastify routes

```text
POST   /api/courses
GET    /api/courses/:courseId
PATCH  /api/courses/:courseId
POST   /api/courses/:courseId/topics
GET    /api/courses/:courseId/topics
PATCH  /api/topics/:topicId
POST   /api/courses/:courseId/materials
GET    /api/materials/:materialId/status
GET    /api/topics/:topicId/sources
POST   /api/topics/:topicId/retrieve
POST   /api/topics/:topicId/resources
PATCH  /api/resources/:resourceId/status
```

## 3.6 Frontend proposal

```text
features/curriculum/
  api/curriculum-client.ts
  components/CourseForm.tsx
  components/TopicEditor.tsx
  components/PrerequisiteGraph.tsx
  components/MaterialUploader.tsx
  components/ProcessingStatus.tsx
  components/SourceLibrary.tsx
  components/SourceViewer.tsx
  components/ResourceGenerator.tsx
  components/GeneratedResourcePreview.tsx
  hooks/useCourse.ts
  hooks/useMaterialStatus.ts
```

Adapter:

```ts
export interface CurriculumClient {
  getCourse(courseId: string): Promise<Course>;
  listTopics(courseId: string): Promise<Topic[]>;
  uploadMaterial(input: UploadMaterialInput): Promise<Material>;
  getMaterialStatus(materialId: string): Promise<Material>;
  generateResource(input: GenerateResourceInput): Promise<GeneratedLearningResource>;
}
```

Provide `ApiCurriculumClient` and `MockCurriculumClient` implementations.

## 3.7 Mock-data proposal

Fixtures:

```ts
export const mockCourse: Course = {
  id: "course-math-1",
  ownerId: "prof-ruiz",
  title: "Matemáticas I",
  description: "Fundamentos de matemáticas universitarias",
  locale: "es",
  activeVersion: 1,
  createdAt: DEMO_NOW,
  updatedAt: DEMO_NOW,
};

export const mockGeometryMaterial: Material = {
  id: "material-geometry-notes",
  courseId: mockCourse.id,
  topicIds: ["topic-geometry"],
  filename: "Geometria-Unidad-2.pdf",
  mimeType: "application/pdf",
  storagePath: "demo/math-1/geometry.pdf",
  status: "ready",
  curriculumVersion: 1,
  uploadedBy: "prof-ruiz",
  uploadedAt: DEMO_NOW,
};
```

Mock retrieval should return two authored chunks supporting the triangle-area explanation, each with a citation. Do not generate random text during the presentation.

## 3.8 Tests

- Topic prerequisite cycle rejection.
- Unauthorized retrieval rejection.
- Material-status transitions.
- Citation metadata completeness.
- Retrieval restricted to course, topic, and curriculum version.
- Generated-resource citations all refer to approved chunks.
- Mock and real responses validate against identical schemas.

# 4. Subsystem 2 - Adaptive Learning and Assessment

## 4.1 Responsibility

Person 2 owns:

- Diagnostics.
- Tutor sessions.
- Teaching strategies.
- Hints and assessments.
- Misconceptions.
- Mastery evidence.
- Student memory.
- Recommendations and retention checks.

## 4.2 Shared Zod schemas

```ts
export const teachingStrategySchema = z.enum([
  "concise_text",
  "deep_explanation",
  "worked_example",
  "visual_decomposition",
  "guided_questioning",
  "practice_first",
  "audio_summary",
  "podcast",
  "mnemonic_music",
  "video",
  "reel",
]);

export const conceptResultSchema = z.object({
  conceptId: z.string(),
  conceptTitle: z.string(),
  score: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  status: z.enum(["mastered", "partial", "struggling", "unassessed"]),
  misconceptionIds: z.array(z.string()),
});

export const diagnosticResultSchema = z.object({
  attemptId: z.string(),
  studentId: z.string(),
  courseId: z.string(),
  concepts: z.array(conceptResultSchema),
  strengths: z.array(z.string()),
  struggles: z.array(z.string()),
  recommendation: z.object({
    topicId: z.string(),
    conceptId: z.string().optional(),
    reason: z.string(),
    suggestedStrategy: teachingStrategySchema,
  }),
});

export const tutorMessageSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  role: z.enum(["student", "tutor"]),
  content: z.string(),
  strategy: teachingStrategySchema.optional(),
  citations: z.array(citationSchema),
  unsupported: z.boolean().default(false),
  createdAt: z.string().datetime(),
});

export const checkpointAttemptSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  topicId: z.string(),
  conceptId: z.string(),
  questionId: z.string(),
  answer: z.unknown(),
  correct: z.boolean(),
  score: z.number().min(0).max(1),
  difficulty: z.number().min(0).max(1),
  strategy: teachingStrategySchema,
  misconceptionResolved: z.boolean(),
  submittedAt: z.string().datetime(),
});

export const masterySchema = z.object({
  studentId: z.string(),
  topicId: z.string(),
  mastery: z.number().min(0).max(1),
  demonstratedConceptIds: z.array(z.string()),
  evidenceIds: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  updatedAt: z.string().datetime(),
});
```

## 4.3 Backend classes and interfaces

```ts
export interface AssessmentRepository {
  getQuestions(topicId: string, purpose: "diagnostic" | "checkpoint"): Promise<Question[]>;
  saveAttempt(attempt: AssessmentAttempt): Promise<void>;
  listAttempts(studentId: string, topicId: string): Promise<AssessmentAttempt[]>;
}

export interface MasteryRepository {
  get(studentId: string, topicId: string): Promise<StudentTopicMastery | null>;
  save(value: StudentTopicMastery): Promise<void>;
}

export interface MisconceptionRepository {
  upsert(record: MisconceptionRecord): Promise<void>;
  listActive(studentId: string, topicId: string): Promise<MisconceptionRecord[]>;
  resolve(id: string, evidenceId: string): Promise<void>;
}

export interface LearningMemoryRepository {
  getProfile(studentId: string): Promise<StudentLearningProfile>;
  saveStrategyObservation(observation: StrategyObservation): Promise<void>;
}

export interface TutorProvider {
  respond(input: GroundedTutorInput): Promise<GroundedTutorOutput>;
}

export interface CurriculumContextPort {
  retrieve(input: RetrieveContextInput): Promise<RetrievedContext>;
}
```

Proposed classes:

```ts
export class DiagnosticService {
  constructor(
    private readonly assessments: AssessmentRepository,
    private readonly misconceptions: MisconceptionRepository,
    private readonly recommender: RecommendationService,
    private readonly events: DomainEventStore,
  ) {}
}

export class TutorSessionService {
  constructor(
    private readonly context: CurriculumContextPort,
    private readonly tutor: TutorProvider,
    private readonly sessions: TutorSessionRepository,
    private readonly strategy: TeachingStrategyService,
  ) {}
}

export class MasteryCalculationService {
  calculate(input: MasteryCalculationInput): MasteryCalculationResult {
    // Pure, deterministic function. No LLM call.
  }
}

export class TeachingStrategyService {
  select(input: StrategySelectionInput): TeachingStrategy {
    // Preference influences initial choice; evidence controls later changes.
  }
}

export class RecommendationService {
  constructor(
    private readonly topics: CurriculumTopicPort,
    private readonly mastery: MasteryRepository,
    private readonly misconceptions: MisconceptionRepository,
  ) {}
}

export class LearningService {
  constructor(
    private readonly diagnostic: DiagnosticService,
    private readonly tutor: TutorSessionService,
    private readonly masteryCalculator: MasteryCalculationService,
    private readonly mastery: MasteryRepository,
    private readonly recommender: RecommendationService,
    private readonly events: DomainEventStore,
  ) {}
}
```

## 4.4 Deterministic mastery proposal

An example calculation:

```ts
export function calculateMastery(input: {
  previous: number;
  attempts: CheckpointAttempt[];
  requiredConceptIds: string[];
}): MasteryCalculationResult {
  const weightedScore = weightedAverage(
    input.attempts.map((a) => ({
      value: a.score,
      weight: 0.5 + a.difficulty * 0.5,
    })),
  );

  const coverage = conceptCoverage(input.attempts, input.requiredConceptIds);
  const resolvedBonus = input.attempts.some((a) => a.misconceptionResolved) ? 0.1 : 0;
  const evidenceScore = clamp(weightedScore * 0.7 + coverage * 0.2 + resolvedBonus, 0, 1);

  return {
    previous: input.previous,
    next: Math.max(input.previous, roundToHundredth(evidenceScore)),
    evidenceIds: input.attempts.map((a) => a.id),
  };
}
```

The final weights should be reviewed by the team and exposed as teacher-configurable policy later. The implementation must remain deterministic and tested.

## 4.5 Database schema proposal

```sql
create table concepts (
  id uuid primary key,
  topic_id uuid not null references topics(id) on delete cascade,
  title text not null,
  description text not null,
  display_order integer not null
);

create table assessment_questions (
  id uuid primary key,
  topic_id uuid not null references topics(id) on delete cascade,
  concept_id uuid not null references concepts(id) on delete cascade,
  purpose text not null,
  difficulty numeric not null,
  prompt jsonb not null,
  answer_key jsonb not null,
  explanation jsonb not null,
  active boolean not null default true
);

create table assessment_attempts (
  id uuid primary key,
  student_id uuid not null references profiles(id),
  question_id uuid not null references assessment_questions(id),
  topic_id uuid not null references topics(id),
  concept_id uuid not null references concepts(id),
  purpose text not null,
  answer jsonb not null,
  correct boolean not null,
  score numeric not null,
  strategy text,
  misconception_resolved boolean not null default false,
  submitted_at timestamptz not null default now()
);

create table student_topic_mastery (
  student_id uuid not null references profiles(id),
  topic_id uuid not null references topics(id),
  mastery numeric not null check (mastery between 0 and 1),
  confidence numeric not null check (confidence between 0 and 1),
  demonstrated_concepts jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (student_id, topic_id)
);

create table misconceptions (
  id uuid primary key,
  student_id uuid not null references profiles(id),
  topic_id uuid not null references topics(id),
  concept_id uuid not null references concepts(id),
  code text not null,
  description text not null,
  status text not null check (status in ('active', 'resolved')),
  identified_by_evidence_id uuid,
  resolved_by_evidence_id uuid,
  identified_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table tutor_sessions (
  id uuid primary key,
  student_id uuid not null references profiles(id),
  topic_id uuid not null references topics(id),
  curriculum_version integer not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create table tutor_messages (
  id uuid primary key,
  session_id uuid not null references tutor_sessions(id) on delete cascade,
  role text not null,
  content text not null,
  strategy text,
  citations jsonb not null default '[]'::jsonb,
  unsupported boolean not null default false,
  created_at timestamptz not null default now()
);

create table strategy_observations (
  id uuid primary key,
  student_id uuid not null references profiles(id),
  topic_id uuid not null references topics(id),
  concept_id uuid not null references concepts(id),
  strategy text not null,
  before_score numeric,
  after_score numeric,
  misconception_resolved boolean not null default false,
  observed_at timestamptz not null default now()
);
```

## 4.6 Fastify routes

```text
POST /api/learning/diagnostic
GET  /api/learning/diagnostic/:attemptId
POST /api/learning/session
POST /api/learning/session/:sessionId/messages
POST /api/learning/hint
GET  /api/learning/quiz/:topicId
POST /api/learning/attempt
GET  /api/learning/student/:studentId/state
GET  /api/learning/student/:studentId/recommendation
POST /api/learning/retention-check
```

## 4.7 Frontend proposal

```text
features/learning/
  api/learning-client.ts
  components/StudentDashboard.tsx
  components/DiagnosticFlow.tsx
  components/DiagnosticResult.tsx
  components/TopicRoadmap.tsx
  components/TutorSession.tsx
  components/CitationDrawer.tsx
  components/StrategySwitcher.tsx
  components/WorkedExample.tsx
  components/VisualExplanation.tsx
  components/Checkpoint.tsx
  components/MasteryEvidence.tsx
  components/RetentionCheck.tsx
  hooks/useLearningState.ts
  hooks/useTutorSession.ts
```

```ts
export interface LearningClient {
  submitDiagnostic(input: DiagnosticSubmission): Promise<DiagnosticResult>;
  startSession(input: StartSessionInput): Promise<LearningSession>;
  sendMessage(input: TutorMessageInput): Promise<TutorMessage>;
  requestHint(input: HintRequest): Promise<TutorMessage>;
  submitAttempt(input: AttemptSubmission): Promise<CheckpointResult>;
  getStudentState(studentId: string): Promise<StudentLearningState>;
}
```

Implement `ApiLearningClient` and `MockLearningClient`.

## 4.8 Mock-data proposal

Mock diagnostic:

```ts
export const mockDiagnosticResult: DiagnosticResult = {
  attemptId: "diagnostic-lucia-1",
  studentId: "student-lucia",
  courseId: "course-math-1",
  concepts: [
    {
      conceptId: "concept-triangle-area",
      conceptTitle: "Área de triángulos",
      score: 0.4,
      confidence: 0.9,
      status: "struggling",
      misconceptionIds: ["misconception-missing-half"],
    },
  ],
  strengths: ["Reconoce base y altura"],
  struggles: ["Olvida dividir entre dos"],
  recommendation: {
    topicId: "topic-geometry",
    conceptId: "concept-triangle-area",
    reason: "Practicar la relación entre rectángulos y triángulos",
    suggestedStrategy: "worked_example",
  },
};
```

Mock tutor responses should include:

1. A grounded worked example with a citation.
2. A hint that does not reveal the final answer.
3. A strategy-change message.
4. A visual-decomposition response.
5. An unsupported-answer fallback.

Mock state should change after the second checkpoint so the presentation demonstrates real UI transitions without relying on a live model.

## 4.9 Tests

- Mastery calculation is deterministic.
- Prompt count does not affect mastery.
- Hints do not count as evidence.
- Incorrect attempt activates or preserves a misconception.
- Correct explanatory attempt can resolve it.
- Tutor response requires citations unless marked unsupported.
- Retrieval remains inside the authorized topic.
- Strategy change follows evidence, not a fixed learning-style label.
- Recommendation respects prerequisites.

# 5. Subsystem 3 - World, Progression, and Collaboration

## 5.1 Responsibility

Person 3 owns:

- Student planets and topic houses.
- World state and unlocks.
- Rewards, badges, achievements, and collectibles.
- Quests and Easter eggs.
- NPC interactions and Lumen.
- Team challenges and shared milestones.
- The Athena 3D engine and asset pipeline.

## 5.2 Shared Zod schemas

```ts
export const houseStatusSchema = z.enum(["locked", "available", "in_progress", "done"]);

export const houseStateSchema = z.object({
  topicId: z.string(),
  title: z.string(),
  slot: z.number().int().nonnegative(),
  status: houseStatusSchema,
  progress: z.number().min(0).max(1),
  demonstratedConcepts: z.number().int().nonnegative(),
  totalConcepts: z.number().int().positive(),
  nextAction: z.string().optional(),
});

export const planetStateSchema = z.object({
  studentId: z.string(),
  growth: z.number().min(0).max(1),
  stage: z.number().int().min(0),
  theme: z.literal("athena-default"),
  houses: z.array(houseStateSchema),
  activeAchievementIds: z.array(z.string()),
});

export const achievementSchema = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  rarity: z.enum(["common", "uncommon", "rare", "legendary"]),
  unlockedAt: z.string().datetime(),
  evidenceIds: z.array(z.string()),
});

export const questStateSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  topicId: z.string().optional(),
  title: z.string(),
  status: z.enum(["available", "active", "completed"]),
  objectives: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      current: z.number(),
      required: z.number(),
    }),
  ),
});

export const teamChallengeStateSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  topicId: z.string(),
  title: z.string(),
  memberIds: z.array(z.string()),
  status: z.enum(["available", "active", "completed"]),
  sharedProgress: z.number().min(0).max(1),
  achievementId: z.string().optional(),
});
```

## 5.3 Backend classes and interfaces

```ts
export interface PlanetRepository {
  get(studentId: string): Promise<PlanetStateRecord | null>;
  save(record: PlanetStateRecord): Promise<void>;
  listByClass(classId: string): Promise<PlanetStateRecord[]>;
}

export interface AchievementRepository {
  listDefinitions(): Promise<AchievementDefinition[]>;
  hasUnlock(studentId: string, code: string, sourceEventId: string): Promise<boolean>;
  unlock(record: AchievementUnlock): Promise<void>;
  listByStudent(studentId: string): Promise<Achievement[]>;
}

export interface QuestRepository {
  listForStudent(studentId: string): Promise<QuestState[]>;
  saveState(state: QuestState): Promise<void>;
}

export interface TeamRepository {
  create(input: CreateTeamInput): Promise<Team>;
  get(teamId: string): Promise<Team | null>;
  listMemberships(studentId: string): Promise<Team[]>;
}
```

Proposed classes:

```ts
export class WorldProjectionService {
  project(input: {
    studentId: string;
    topics: Topic[];
    mastery: StudentTopicMastery[];
    achievements: Achievement[];
  }): PlanetState {
    // Pure projection from authoritative academic state.
  }
}

export class ProgressionService {
  constructor(
    private readonly planets: PlanetRepository,
    private readonly achievements: AchievementService,
    private readonly quests: QuestService,
    private readonly events: DomainEventStore,
  ) {}

  async handleMasteryUpdated(event: MasteryUpdated): Promise<void> {
    // Update world projection, evaluate rewards, emit world changes.
  }
}

export class AchievementService {
  constructor(private readonly repository: AchievementRepository) {}

  async evaluate(event: DomainEvent): Promise<Achievement[]> {
    // Idempotent unlock evaluation.
  }
}

export class EasterEggService {
  constructor(
    private readonly discoveries: EasterEggRepository,
    private readonly achievements: AchievementService,
  ) {}

  async discover(input: EasterEggDiscoveryInput): Promise<EasterEggDiscoveryResult> {
    // Validate location/state and prevent duplicate rewards.
  }
}

export class TeamChallengeService {
  constructor(
    private readonly teams: TeamRepository,
    private readonly challenges: TeamChallengeRepository,
    private readonly learning: CollaborativeEvidencePort,
    private readonly events: DomainEventStore,
  ) {}
}
```

## 5.4 Database schema proposal

```sql
create table planet_states (
  student_id uuid primary key references profiles(id),
  growth numeric not null check (growth between 0 and 1),
  stage integer not null default 0,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

create table achievement_definitions (
  id uuid primary key,
  code text not null unique,
  title text not null,
  description text not null,
  icon text not null,
  rarity text not null,
  rule jsonb not null
);

create table achievement_unlocks (
  id uuid primary key,
  achievement_id uuid not null references achievement_definitions(id),
  student_id uuid not null references profiles(id),
  source_event_id uuid not null,
  evidence_ids jsonb not null default '[]'::jsonb,
  unlocked_at timestamptz not null default now(),
  unique (achievement_id, student_id, source_event_id)
);

create table quest_definitions (
  id uuid primary key,
  topic_id uuid references topics(id),
  title text not null,
  description text not null,
  objectives jsonb not null,
  reward jsonb not null
);

create table student_quests (
  student_id uuid not null references profiles(id),
  quest_id uuid not null references quest_definitions(id),
  status text not null,
  progress jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (student_id, quest_id)
);

create table easter_egg_definitions (
  id uuid primary key,
  code text not null unique,
  world_location jsonb not null,
  availability_rule jsonb not null,
  reward jsonb not null
);

create table easter_egg_discoveries (
  easter_egg_id uuid not null references easter_egg_definitions(id),
  student_id uuid not null references profiles(id),
  discovered_at timestamptz not null default now(),
  primary key (easter_egg_id, student_id)
);

create table study_teams (
  id uuid primary key,
  class_id uuid not null references classes(id),
  name text not null,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

create table team_members (
  team_id uuid not null references study_teams(id) on delete cascade,
  student_id uuid not null references profiles(id),
  joined_at timestamptz not null default now(),
  primary key (team_id, student_id)
);

create table team_challenges (
  id uuid primary key,
  team_id uuid not null references study_teams(id),
  topic_id uuid not null references topics(id),
  definition jsonb not null,
  status text not null,
  progress jsonb not null,
  started_at timestamptz,
  completed_at timestamptz
);
```

## 5.5 Fastify routes

```text
GET  /api/planet/:studentId
GET  /api/class/:classId/planets
GET  /api/world/:studentId
POST /api/world/interactions
GET  /api/students/:studentId/achievements
GET  /api/students/:studentId/quests
POST /api/easter-eggs/:code/discover
POST /api/teams
GET  /api/teams/:teamId
POST /api/teams/:teamId/challenges
POST /api/teams/:teamId/challenges/:challengeId/attempt
```

## 5.6 Frontend and 3D proposal

```text
features/world/
  api/world-client.ts
  components/WorldExplorer.tsx
  components/TopicList.tsx
  components/HouseMarker.tsx
  components/OrbitExplorer.tsx
  components/AchievementToast.tsx
  components/AchievementGallery.tsx
  components/QuestPanel.tsx
  components/EasterEggDiscovery.tsx
  components/TeamHub.tsx
  components/TeamChallenge.tsx

frontend/engine3d/
  athena-assets/
  scripts/build-athena-assets.mjs
  src/assets/athena-manifest.ts
  src/loaders/athena-gltf-loader.ts
  src/materials/athena-toon-material.ts
  src/scenes/surface.ts
  src/scenes/orbit.ts
  src/systems/achievements.ts
  src/systems/quests.ts
  src/systems/easter-eggs.ts
  src/systems/teams.ts
```

```ts
export interface WorldClient {
  getPlanet(studentId: string): Promise<PlanetState>;
  getClassPlanets(classId: string): Promise<PlanetState[]>;
  listAchievements(studentId: string): Promise<Achievement[]>;
  listQuests(studentId: string): Promise<QuestState[]>;
  discoverEasterEgg(code: string): Promise<EasterEggDiscoveryResult>;
  getTeam(teamId: string): Promise<TeamState>;
}
```

3D engine API remains state-driven:

```ts
export interface AthenaWorldEngine {
  updatePlanet(state: PlanetState): void;
  updateQuests(quests: QuestState[]): void;
  showAchievement(achievement: Achievement): void;
  showEasterEgg(result: EasterEggDiscoveryResult): void;
  setAccessibility(settings: WorldAccessibilitySettings): void;
  dispose(): void;
}
```

The engine must not fetch academic data or compute mastery.

## 5.7 Badge and icon proposal

The supplied asset kit contains learning-state, quest, emote, UI, NPC, and Athena brand icons, but no complete dedicated badge-icon collection.

Person 3 owns game-specific badge and achievement icons. Person 1 owns shared icon sizing, labeling, focus, and accessibility primitives.

Proposed initial badge set:

| Code                | Name                   | Trigger                       | Visual concept           |
| ------------------- | ---------------------- | ----------------------------- | ------------------------ |
| `first-insight`     | Primera luz            | First misconception resolved  | Insight lantern          |
| `geometry-builder`  | Constructor geométrico | Geometry mastery threshold    | Compass and triangle     |
| `strategy-switcher` | Nueva perspectiva      | Success after strategy change | Rotating prism           |
| `retention-star`    | Conocimiento duradero  | Passed retention check        | Star inside a clock ring |
| `team-spark`        | Chispa de equipo       | First team challenge          | Four connected lights    |
| `world-explorer`    | Explorador             | First Easter egg              | Map and glowing path     |

Each badge must include:

- SVG icon.
- Short and long label.
- Accessible description.
- Rarity.
- Unlock rule.
- Evidence IDs.
- 2D presentation.
- Optional 3D world celebration.

## 5.8 Mock-data proposal

```ts
export const mockLuciaPlanet: PlanetState = {
  studentId: "student-lucia",
  growth: 0.31,
  stage: 1,
  theme: "athena-default",
  houses: [
    {
      topicId: "topic-fractions",
      title: "Fracciones",
      slot: 0,
      status: "done",
      progress: 1,
      demonstratedConcepts: 4,
      totalConcepts: 4,
    },
    {
      topicId: "topic-geometry",
      title: "Geometría",
      slot: 1,
      status: "in_progress",
      progress: 0.4,
      demonstratedConcepts: 2,
      totalConcepts: 5,
      nextAction: "Practicar el área de triángulos",
    },
  ],
  activeAchievementIds: [],
};
```

After the successful checkpoint, the mock repository emits a deterministic `MasteryUpdated` event. The mock world client returns:

- Geometry progress `0.60`.
- Planet growth `0.35`.
- `first-insight` unlocked.
- An active lantern transformation.
- Resolved intervention marker.

The class-orbit fixture contains eight planets at different growth stages.

## 5.9 Tests

- World projection is deterministic from topics and mastery.
- Locked topics respect prerequisites.
- Duplicate domain events do not duplicate achievements.
- Easter-egg discovery is idempotent.
- Rewards require validated source events.
- Team challenge requires authorized membership.
- Engine state updates do not trigger academic writes.
- World and 2D list show identical topic states.
- Engine disposal removes loops, listeners, workers, audio, and canvases.
- Asset validation rejects unresolved runtime paths.

# 6. Subsystem 4 - Analytics and Platform

## 6.1 Responsibility

Person 4 owns:

- Authentication and identity.
- Student and professor roles.
- Classes and enrollment.
- Authorization.
- Analytics and educator insights.
- Intervention tools.
- Events, health, observability, exports, and Class Wrapped.

## 6.2 Shared Zod schemas

```ts
export const roleSchema = z.enum(["student", "professor", "admin"]);

export const authContextSchema = z.object({
  userId: z.string(),
  role: roleSchema,
  classIds: z.array(z.string()),
  courseIds: z.array(z.string()),
});

export const aiUsageSchema = z.object({
  chat: z.number().int().nonnegative(),
  podcast: z.number().int().nonnegative(),
  video: z.number().int().nonnegative(),
  reel: z.number().int().nonnegative(),
  summary: z.number().int().nonnegative(),
  hint: z.number().int().nonnegative(),
  quizAnswer: z.number().int().nonnegative(),
});

export const topicAnalyticsSchema = z.object({
  topicId: z.string(),
  title: z.string(),
  averageMastery: z.number().min(0).max(1),
  masteredStudents: z.number().int().nonnegative(),
  strugglingStudents: z.number().int().nonnegative(),
  commonMisconceptions: z.array(
    z.object({ code: z.string(), label: z.string(), studentCount: z.number() }),
  ),
});

export const interventionSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  topicId: z.string(),
  severity: z.enum(["low", "medium", "high"]),
  reason: z.string(),
  recommendedAction: z.string(),
  status: z.enum(["open", "acknowledged", "resolved"]),
});

export const classSummarySchema = z.object({
  classId: z.string(),
  courseId: z.string(),
  topics: z.array(topicAnalyticsSchema),
  aiUsage: aiUsageSchema,
  interventions: z.array(interventionSchema),
  students: z.array(
    z.object({
      studentId: z.string(),
      displayName: z.string(),
      growth: z.number().min(0).max(1),
      averageMastery: z.number().min(0).max(1),
      openInterventions: z.number().int().nonnegative(),
    }),
  ),
});
```

## 6.3 Backend classes and interfaces

```ts
export interface IdentityProvider {
  verify(accessToken: string): Promise<VerifiedIdentity>;
}

export interface ProfileRepository {
  get(userId: string): Promise<Profile | null>;
  save(profile: Profile): Promise<void>;
}

export interface ClassRepository {
  create(input: CreateClassInput): Promise<Class>;
  get(classId: string): Promise<Class | null>;
  listByUser(userId: string): Promise<Class[]>;
  listStudents(classId: string): Promise<Profile[]>;
}

export interface DomainEventStore {
  append(event: DomainEvent): Promise<void>;
  list(input: EventQuery): Promise<DomainEvent[]>;
}

export interface AnalyticsReadRepository {
  getClassSummary(classId: string): Promise<ClassSummary>;
  getStudentAnalytics(studentId: string): Promise<StudentAnalytics>;
  getTopicAnalytics(classId: string, topicId: string): Promise<TopicAnalytics>;
}
```

Proposed classes:

```ts
export class AuthService {
  constructor(
    private readonly identity: IdentityProvider,
    private readonly profiles: ProfileRepository,
    private readonly classes: ClassRepository,
  ) {}

  async authenticate(token: string): Promise<AuthContext> {}
}

export class AuthorizationService {
  canAccessClass(context: AuthContext, classId: string): boolean {}
  canAccessCourse(context: AuthContext, courseId: string): boolean {}
  canAccessStudent(context: AuthContext, studentId: string): boolean {}
}

export class AnalyticsProjectionService {
  constructor(
    private readonly events: DomainEventStore,
    private readonly readRepository: AnalyticsReadRepository,
  ) {}

  async project(event: DomainEvent): Promise<void> {
    // Update analytics read models.
  }
}

export class InterventionService {
  evaluate(input: InterventionEvaluationInput): InterventionRecommendation[] {
    // Deterministic rules produce candidate interventions.
  }
}

export class EducatorInsightService {
  constructor(
    private readonly analytics: AnalyticsReadRepository,
    private readonly generator: StructuredInsightGenerator,
  ) {}
}

export class ClassWrappedService {
  constructor(private readonly analytics: AnalyticsReadRepository) {}
}
```

## 6.4 Database schema proposal

```sql
create table profiles (
  id uuid primary key,
  auth_user_id uuid unique,
  role text not null check (role in ('student', 'professor', 'admin')),
  display_name text not null,
  locale text not null default 'es',
  accessibility_preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table classes (
  id uuid primary key,
  course_id uuid not null references courses(id),
  professor_id uuid not null references profiles(id),
  title text not null,
  term text,
  created_at timestamptz not null default now()
);

create table class_enrollments (
  class_id uuid not null references classes(id) on delete cascade,
  student_id uuid not null references profiles(id),
  status text not null default 'active',
  enrolled_at timestamptz not null default now(),
  primary key (class_id, student_id)
);

create table domain_events (
  id uuid primary key,
  event_type text not null,
  aggregate_type text not null,
  aggregate_id uuid not null,
  actor_id uuid,
  class_id uuid,
  course_id uuid,
  student_id uuid,
  payload jsonb not null,
  occurred_at timestamptz not null,
  recorded_at timestamptz not null default now()
);

create index domain_events_class_idx on domain_events(class_id, occurred_at);
create index domain_events_student_idx on domain_events(student_id, occurred_at);
create index domain_events_type_idx on domain_events(event_type, occurred_at);

create table ai_usage_events (
  id uuid primary key,
  student_id uuid not null references profiles(id),
  class_id uuid not null references classes(id),
  topic_id uuid references topics(id),
  kind text not null,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create table interventions (
  id uuid primary key,
  student_id uuid not null references profiles(id),
  class_id uuid not null references classes(id),
  topic_id uuid not null references topics(id),
  severity text not null,
  reason text not null,
  recommended_action text not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table analytics_snapshots (
  id uuid primary key,
  class_id uuid not null references classes(id),
  snapshot_type text not null,
  data jsonb not null,
  generated_at timestamptz not null default now()
);
```

Use Supabase row-level security so students can access themselves, professors can access their classes, and service-role operations remain server-only.

## 6.5 Fastify routes

```text
GET  /api/auth/me
POST /api/classes
GET  /api/classes/:classId
GET  /api/classes/:classId/students
POST /api/classes/:classId/enrollments
GET  /api/analytics/class/:classId
GET  /api/analytics/class/:classId/topics/:topicId
GET  /api/analytics/students/:studentId
GET  /api/analytics/class/:classId/interventions
PATCH /api/interventions/:interventionId
POST /api/analytics/chat
GET  /api/analytics/class/:classId/export
GET  /api/analytics/class/:classId/wrapped
GET  /api/health
GET  /api/readiness
```

## 6.6 Frontend proposal

```text
features/auth/
  components/SignIn.tsx
  components/RoleGate.tsx
  hooks/useAuth.ts

features/classes/
  components/ClassSelector.tsx
  components/EnrollmentManager.tsx

features/analytics/
  api/analytics-client.ts
  components/EducatorDashboard.tsx
  components/TopicHeatmap.tsx
  components/StudentTable.tsx
  components/StudentDetail.tsx
  components/MisconceptionTrends.tsx
  components/InterventionQueue.tsx
  components/StrategyEffectiveness.tsx
  components/AiUsagePanel.tsx
  components/TeamAnalytics.tsx
  components/ClassWrapped.tsx
  components/ExportControls.tsx
```

```ts
export interface AnalyticsClient {
  getCurrentUser(): Promise<AuthContext>;
  getClassSummary(classId: string): Promise<ClassSummary>;
  getStudentAnalytics(studentId: string): Promise<StudentAnalytics>;
  getTopicAnalytics(classId: string, topicId: string): Promise<TopicAnalytics>;
  listInterventions(classId: string): Promise<InterventionRecommendation[]>;
  updateIntervention(id: string, status: InterventionStatus): Promise<void>;
  getClassWrapped(classId: string): Promise<ClassWrappedSummary>;
}
```

Implement `ApiAnalyticsClient` and `MockAnalyticsClient`.

## 6.7 Mock-data proposal

The class fixture contains eight students with intentionally varied states:

| Student | Average mastery | Open intervention              | Demonstration purpose      |
| ------- | --------------: | ------------------------------ | -------------------------- |
| Lucía   |             58% | Geometry, resolved during demo | Main story                 |
| Mateo   |             82% | None                           | High-progress planet       |
| Sofía   |             71% | Functions                      | Moderate progress          |
| Diego   |             45% | Fractions                      | Needs intervention         |
| Valeria |             63% | None                           | Strategy comparison        |
| Andrés  |             38% | Geometry and Fractions         | High-priority intervention |
| Camila  |             76% | None                           | Audio-format preference    |
| Nicolás |             54% | Statistics                     | Team challenge participant |

The mock summary should include:

- A Geometry misconception shared by three students.
- Worked examples effective for four students.
- Visual decomposition effective for Lucía and Valeria.
- AI usage totals that do not correlate directly with mastery.
- Two open interventions and one resolved intervention.
- One active study team.

After Lucía completes the checkpoint, the mock analytics client returns an updated snapshot showing:

- Geometry mastery increased.
- The misconception marked resolved for Lucía.
- Intervention status changed to resolved.
- Visual strategy effectiveness incremented.
- AI usage increased without independently changing mastery.

## 6.8 Tests

- Students cannot access another student's private analytics.
- Professors can access only enrolled classes.
- AI usage never changes mastery aggregates.
- Intervention rules are deterministic.
- Analytics reflect source tables and domain events consistently.
- Duplicate events do not double-count metrics.
- Auth context is required for protected routes.
- Mock and real analytics validate against the same schemas.

# 7. Domain events and integration

## 7.1 Event schema

```ts
export const domainEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  aggregateType: z.string(),
  aggregateId: z.string(),
  actorId: z.string().optional(),
  classId: z.string().optional(),
  courseId: z.string().optional(),
  studentId: z.string().optional(),
  occurredAt: z.string().datetime(),
  payload: z.record(z.unknown()),
});
```

## 7.2 Integration flow

```text
MaterialUploaded
  -> Curriculum processes and emits MaterialProcessed

DiagnosticCompleted
  -> Learning identifies misconception and recommendation

CheckpointCompleted
  -> Learning calculates mastery and emits MasteryUpdated

MasteryUpdated
  -> World recalculates houses, planet, rewards, and quests
  -> Analytics updates class and student read models

AchievementUnlocked
  -> Frontend shows reward
  -> Analytics records achievement trend

TeamChallengeCompleted
  -> World grants shared reward
  -> Analytics records collaborative evidence
```

## 7.3 Integration rules

- Events contain IDs and facts, not duplicated complete domain objects.
- Consumers fetch authoritative state when necessary.
- Handlers are idempotent.
- Every state-changing event has a stable event ID.
- Mock events use the same schemas as real events.
- Frontend refreshes authoritative API state after important events.

# 8. Demo and presentation architecture

## 8.1 Demo modes

### Fully mocked

- Frontend imports shared fixtures.
- No API, Supabase, or Gemini required.
- Used as emergency presentation fallback.

### Mock AI with real application data

- Supabase and Fastify are real.
- Tutor uses authored responses.
- Best mode for a stable end-to-end presentation.

### Fully live

- Real Supabase data.
- Real document ingestion.
- Real retrieval and Gemini calls.
- Used when credentials and networking are stable.

The presenter should be able to switch modes through environment variables without changing feature code.

## 8.2 Mock state machine

```text
DEMO_INITIAL
  -> DIAGNOSTIC_COMPLETE
  -> WORKED_EXAMPLE_SHOWN
  -> FIRST_CHECKPOINT_FAILED
  -> VISUAL_STRATEGY_SHOWN
  -> SECOND_CHECKPOINT_PASSED
  -> MASTERY_UPDATED
  -> WORLD_TRANSFORMED
  -> ANALYTICS_UPDATED
```

Each state should have a fixture snapshot. This permits jumping to any point during development and guarantees deterministic presentation behavior.

## 8.3 Demo fixture modules

```text
shared/src/mocks/demo-identities.ts
shared/src/mocks/demo-curriculum.ts
shared/src/mocks/demo-learning.ts
shared/src/mocks/demo-world.ts
shared/src/mocks/demo-analytics.ts
shared/src/mocks/demo-events.ts
shared/src/mocks/demo-scenarios.ts
```

## 8.4 Presenter controls

In development or demo mode, provide a hidden presenter panel or query parameter with:

- Reset demo.
- Jump to scenario state.
- Toggle mock/live AI.
- Toggle mock/live data.
- Trigger achievement.
- Trigger world transformation.
- Simulate provider failure.

These controls must never appear in production unless explicitly enabled.

# 9. Testing strategy

## 9.1 Unit tests

- Domain services.
- Mastery calculation.
- Prerequisite logic.
- Achievement rules.
- Intervention rules.
- Contract parsing.

## 9.2 Repository contract tests

Run the same behavior tests against:

- Mock repository.
- Supabase repository.

This prevents mock mode from drifting away from production behavior.

## 9.3 API integration tests

Use Fastify injection for:

- Validation failures.
- Authorization.
- Success responses.
- Provider failures.
- Idempotency.

## 9.4 Frontend tests

- Component states using fixture snapshots.
- Keyboard navigation.
- Screen-reader labels.
- Reduced motion.
- Color-independent state presentation.
- Mock and real adapter response parsing.

## 9.5 End-to-end golden-path test

```text
Upload or select material
-> complete diagnostic
-> open recommended topic
-> receive cited explanation
-> fail checkpoint
-> switch strategy
-> pass checkpoint
-> update mastery
-> transform world
-> update professor analytics
```

# 10. Integration checklist

## Contracts

- [ ] Every API request and response has a Zod schema.
- [ ] Mock and real responses use the same schema.
- [ ] Cross-subsystem events are versioned.
- [ ] Breaking contract changes receive affected-owner review.

## Curriculum

- [ ] Material access is authorized before retrieval.
- [ ] Every generated academic resource has citations.
- [ ] Curriculum versions are recorded in tutor sessions.

## Learning

- [ ] AI cannot directly update mastery.
- [ ] Hints and prompt volume do not count as evidence.
- [ ] Strategy changes are recorded with before/after results.

## World

- [ ] Rewards are idempotent.
- [ ] House and planet state match learning state.
- [ ] Every 3D operation has a 2D alternative.
- [ ] Easter eggs do not grant academic mastery.

## Analytics and platform

- [ ] Role and class membership protect every route.
- [ ] AI usage is displayed separately from mastery.
- [ ] Events are not double-counted.
- [ ] Demo controls are disabled in production.

# 11. Reference files

- Main project plan: `ATHENA_HACKATHON_PLAN.md`
- Project proposal: `C:\Users\danic\Downloads\Athena.pdf`
- Athena asset package: `C:\Users\danic\OneDrive\Documents\1881\3D assets codebase review.zip`
- Repository architecture: `C:\Users\danic\OneDrive\Documents\1881\docs\ARCHITECTURE.md`
- Repository contracts: `C:\Users\danic\OneDrive\Documents\1881\docs\CONTRACTS.md`
- Challenge guidebook: <https://www.1881ventures.org/guidebook>
