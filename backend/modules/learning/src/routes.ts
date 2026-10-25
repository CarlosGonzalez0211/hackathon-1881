import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  athenaDemoIds,
  assessmentPurposeSchema,
  checkpointSubmissionSchema,
  demoLearningIds,
  diagnosticSubmissionSchema,
  hintSubmissionSchema,
  learningSessionMessageSubmissionSchema,
  learningSessionStartSchema,
  retentionCheckSubmissionSchema,
  studentLearningPreferencesUpdateSchema,
  studentMasterySnapshotSchema,
  teacherPriorityOverrideSchema,
  worldHintRequestSchema,
  worldHintResponseSchema,
  worldLearningSessionStartRequestSchema,
  worldLearningSessionStartSchema,
  type AssessmentQuiz,
  type CheckpointResult,
  type DiagnosticResult,
  type HintResult,
  type LearningSessionStartResult,
  type LearningSessionSummary,
  type LearningEvidenceSnapshot,
  type RetentionCheckResult,
  type StudentLearningState,
  type StudentLearningPreferences,
  type StudentMasterySnapshot,
  type TeacherPriorityOverride,
  type TopicRecommendation,
  type TutorMessage,
  type WorldHintResponse,
  type WorldLearningSessionStart,
} from "@athena/shared";
import { InMemoryAssessmentRepository, type AssessmentRepository } from "./assessment.js";
import { InMemoryLearningRepository, type LearningRepository } from "./repository.js";
import { LearningService } from "./service.js";
import {
  InMemoryRecommendationCatalog,
  type RecommendationCatalogPort,
} from "./recommendation-catalog.js";
import {
  MockMisconceptionClassifier,
  type MisconceptionClassifier,
} from "./misconception-classifier.js";
import type { CurriculumContextPort, TutorProvider } from "./ports.js";
import { MockCurriculumContextPort, MockTutorProvider } from "./tutor-adapters.js";
import { SubmissionCoordinator } from "./submission-coordinator.js";
import {
  connectLearningEventsToWorld,
  InMemoryWorldEventSink,
  LearningMasteryReadAdapter,
  type WorldEventSink,
} from "./world-bridge.js";

const studentParamsSchema = z.object({ studentId: z.string().min(1).max(200) });
const studentTopicParamsSchema = z.object({
  studentId: z.string().min(1).max(200),
  topicId: z.string().min(1).max(200),
});
const quizParamsSchema = z.object({ topicId: z.string().min(1).max(200) });
const quizQuerySchema = z.object({
  studentId: z.string().min(1).max(200),
  courseId: z.string().min(1).max(200),
  purpose: assessmentPurposeSchema.default("checkpoint"),
  limit: z.coerce.number().int().min(1).max(10).default(1),
});
const recommendationQuerySchema = z.object({ courseId: z.string().min(1).max(200) });
const masteryQuerySchema = z.object({
  topicIds: z
    .string()
    .optional()
    .transform((value) =>
      value
        ? value
            .split(",")
            .map((topicId) => topicId.trim())
            .filter(Boolean)
        : [],
    ),
});
const courseTopicParamsSchema = z.object({
  courseId: z.string().min(1).max(200),
  topicId: z.string().min(1).max(200),
});
const sessionParamsSchema = z.object({ sessionId: z.string().min(1).max(200) });

export interface LearningRoutesOptions {
  repository?: LearningRepository;
  assessments?: AssessmentRepository;
  recommendationCatalog?: RecommendationCatalogPort;
  misconceptionClassifier?: MisconceptionClassifier;
  curriculumContext?: CurriculumContextPort;
  tutorProvider?: TutorProvider;
  worldEventSink?: WorldEventSink;
  random?: () => number;
}

/** Registers inside the root `/api` prefix after platform services are installed. */
export async function learningRoutes(app: FastifyInstance, options: LearningRoutesOptions = {}) {
  const repository = options.repository ?? new InMemoryLearningRepository();
  const assessments = options.assessments ?? new InMemoryAssessmentRepository();
  const service = new LearningService(
    repository,
    assessments,
    app.platform.authorization,
    app.platform.events,
    app.platform.clock,
    app.platform.ids,
    options.recommendationCatalog ?? new InMemoryRecommendationCatalog(),
    options.misconceptionClassifier ?? new MockMisconceptionClassifier(),
    options.curriculumContext ?? new MockCurriculumContextPort(),
    options.tutorProvider ?? new MockTutorProvider(),
    options.random,
  );
  const masteryReadPort = new LearningMasteryReadAdapter(repository, assessments);
  const submissionCoordinator = new SubmissionCoordinator();
  const unsubscribeWorldEvents = connectLearningEventsToWorld(
    app.platform.events,
    options.worldEventSink ?? new InMemoryWorldEventSink(),
  );
  app.addHook("onClose", async () => {
    unsubscribeWorldEvents();
  });

  app.post<{ Reply: DiagnosticResult }>("/learning/diagnostic", async (request) =>
    service.submitDiagnostic(request.auth, diagnosticSubmissionSchema.parse(request.body)),
  );
  app.post<{ Reply: CheckpointResult }>("/learning/attempt", async (request) => {
    const input = checkpointSubmissionSchema.parse(request.body);
    const run = () =>
      submissionCoordinator.runSerial(`learning:${input.studentId}:${input.topicId}`, () =>
        service.submitCheckpoint(request.auth, input),
      );
    return input.submissionId
      ? submissionCoordinator.runOnce(`checkpoint:${input.studentId}:${input.submissionId}`, run)
      : run();
  });
  app.get<{ Reply: AssessmentQuiz }>("/learning/quiz/:topicId", async (request) => {
    const params = quizParamsSchema.parse(request.params);
    const query = quizQuerySchema.parse(request.query);
    return service.getQuiz(request.auth, { ...query, topicId: params.topicId });
  });
  app.post<{ Reply: RetentionCheckResult }>("/learning/retention-check", async (request) => {
    const input = retentionCheckSubmissionSchema.parse(request.body);
    const run = () =>
      submissionCoordinator.runSerial(`learning:${input.studentId}:${input.topicId}`, () =>
        service.submitRetentionCheck(request.auth, input),
      );
    return input.submissionId
      ? submissionCoordinator.runOnce(`retention:${input.studentId}:${input.submissionId}`, run)
      : run();
  });
  app.get<{ Reply: StudentLearningState }>("/learning/student/:studentId/state", async (request) =>
    service.getStudentState(request.auth, studentParamsSchema.parse(request.params).studentId),
  );
  app.get<{ Reply: StudentMasterySnapshot }>(
    "/learning/student/:studentId/mastery",
    async (request) => {
      const studentId = studentParamsSchema.parse(request.params).studentId;
      const { topicIds } = masteryQuerySchema.parse(request.query);
      await service.getStudentState(request.auth, studentId);
      return studentMasterySnapshotSchema.parse(
        await masteryReadPort.getStudentMastery(studentId, topicIds),
      );
    },
  );
  app.get<{ Reply: LearningEvidenceSnapshot }>(
    "/learning/student/:studentId/topics/:topicId/evidence",
    async (request) => {
      const params = studentTopicParamsSchema.parse(request.params);
      return service.getLearningEvidenceSnapshot(request.auth, params.studentId, params.topicId);
    },
  );
  app.put<{ Reply: StudentLearningPreferences }>(
    "/learning/student/:studentId/preferences",
    async (request) =>
      service.updateLearningPreferences(
        request.auth,
        studentParamsSchema.parse(request.params).studentId,
        studentLearningPreferencesUpdateSchema.parse(request.body),
      ),
  );
  app.get<{ Reply: TopicRecommendation }>(
    "/learning/student/:studentId/recommendation",
    async (request) => {
      const studentId = studentParamsSchema.parse(request.params).studentId;
      const query = recommendationQuerySchema.parse(request.query);
      return service.getRecommendation(request.auth, studentId, query.courseId);
    },
  );
  app.put<{ Reply: TeacherPriorityOverride }>(
    "/learning/course/:courseId/topics/:topicId/priority",
    async (request) => {
      const params = courseTopicParamsSchema.parse(request.params);
      const input = teacherPriorityOverrideSchema.parse(request.body);
      return service.setTeacherPriority(
        request.auth,
        params.courseId,
        params.topicId,
        input.priority,
      );
    },
  );
  app.post<{ Reply: LearningSessionStartResult | WorldLearningSessionStart }>(
    "/learning/session",
    async (request) => {
      const richRequest = learningSessionStartSchema.safeParse(request.body);
      if (richRequest.success) {
        return service.startLearningSession(request.auth, richRequest.data);
      }
      const compactRequest = worldLearningSessionStartRequestSchema.parse(request.body);
      const started = await service.startLearningSession(request.auth, {
        studentId: compactRequest.studentId,
        courseId: athenaDemoIds.course,
        topicId: compactRequest.topicId,
        conceptId: demoLearningIds.concepts.triangleArea,
        objective: "Learn the selected topic from approved course material",
        strategy: "worked_example",
        curriculumVersion: 1,
      });
      return worldLearningSessionStartSchema.parse({
        sessionId: started.session.id,
        topicId: started.session.topicId,
        strategy: started.session.strategy,
        resumed: false,
      });
    },
  );
  app.post<{ Reply: TutorMessage }>("/learning/session/:sessionId/messages", async (request) => {
    const params = sessionParamsSchema.parse(request.params);
    const input = learningSessionMessageSubmissionSchema.parse(request.body);
    return service.sendSessionMessage(request.auth, params.sessionId, input.content);
  });
  app.get<{ Reply: LearningSessionSummary }>(
    "/learning/session/:sessionId/summary",
    async (request) =>
      service.getSessionSummary(request.auth, sessionParamsSchema.parse(request.params).sessionId),
  );
  app.post<{ Reply: HintResult | WorldHintResponse }>("/learning/hint", async (request) => {
    const richRequest = hintSubmissionSchema.safeParse(request.body);
    if (richRequest.success) return service.requestHint(request.auth, richRequest.data);
    const compactRequest = worldHintRequestSchema.parse(request.body);
    const hint = await service.requestHint(request.auth, {
      studentId: compactRequest.studentId,
      courseId: athenaDemoIds.course,
      topicId: compactRequest.topicId,
      conceptId: demoLearningIds.concepts.triangleArea,
      questionId: demoLearningIds.questions.checkpointTriangleArea,
      strategy: "guided_questioning",
      curriculumVersion: 1,
      sessionId: compactRequest.sessionId,
    });
    return worldHintResponseSchema.parse({
      message: hint.message.content,
      citationIds: hint.message.citations.map((citation) => citation.chunkId),
    });
  });
}
