import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  assessmentPurposeSchema,
  checkpointSubmissionSchema,
  diagnosticSubmissionSchema,
  hintSubmissionSchema,
  learningSessionMessageSubmissionSchema,
  learningSessionStartSchema,
  retentionCheckSubmissionSchema,
  studentLearningPreferencesUpdateSchema,
  teacherPriorityOverrideSchema,
  type AssessmentQuiz,
  type CheckpointResult,
  type DiagnosticResult,
  type HintResult,
  type LearningSessionStartResult,
  type LearningSessionSummary,
  type RetentionCheckResult,
  type StudentLearningState,
  type StudentLearningPreferences,
  type TeacherPriorityOverride,
  type TopicRecommendation,
  type TutorMessage,
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

const studentParamsSchema = z.object({ studentId: z.string().min(1).max(200) });
const quizParamsSchema = z.object({ topicId: z.string().min(1).max(200) });
const quizQuerySchema = z.object({
  studentId: z.string().min(1).max(200),
  courseId: z.string().min(1).max(200),
  purpose: assessmentPurposeSchema.default("checkpoint"),
  limit: z.coerce.number().int().min(1).max(10).default(1),
});
const recommendationQuerySchema = z.object({ courseId: z.string().min(1).max(200) });
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
  random?: () => number;
}

/** Registers inside the root `/api` prefix after platform services are installed. */
export async function learningRoutes(app: FastifyInstance, options: LearningRoutesOptions = {}) {
  const service = new LearningService(
    options.repository ?? new InMemoryLearningRepository(),
    options.assessments ?? new InMemoryAssessmentRepository(),
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

  app.post<{ Reply: DiagnosticResult }>("/learning/diagnostic", async (request) =>
    service.submitDiagnostic(request.auth, diagnosticSubmissionSchema.parse(request.body)),
  );
  app.post<{ Reply: CheckpointResult }>("/learning/attempt", async (request) =>
    service.submitCheckpoint(request.auth, checkpointSubmissionSchema.parse(request.body)),
  );
  app.get<{ Reply: AssessmentQuiz }>("/learning/quiz/:topicId", async (request) => {
    const params = quizParamsSchema.parse(request.params);
    const query = quizQuerySchema.parse(request.query);
    return service.getQuiz(request.auth, { ...query, topicId: params.topicId });
  });
  app.post<{ Reply: RetentionCheckResult }>("/learning/retention-check", async (request) =>
    service.submitRetentionCheck(request.auth, retentionCheckSubmissionSchema.parse(request.body)),
  );
  app.get<{ Reply: StudentLearningState }>("/learning/student/:studentId/state", async (request) =>
    service.getStudentState(request.auth, studentParamsSchema.parse(request.params).studentId),
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
  app.post<{ Reply: LearningSessionStartResult }>("/learning/session", async (request) =>
    service.startLearningSession(request.auth, learningSessionStartSchema.parse(request.body)),
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
  app.post<{ Reply: HintResult }>("/learning/hint", async (request) =>
    service.requestHint(request.auth, hintSubmissionSchema.parse(request.body)),
  );
}
