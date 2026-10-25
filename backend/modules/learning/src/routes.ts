import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  assessmentPurposeSchema,
  checkpointSubmissionSchema,
  diagnosticSubmissionSchema,
  type AssessmentQuiz,
  type CheckpointResult,
  type DiagnosticResult,
  type StudentLearningState,
} from "@athena/shared";
import { InMemoryAssessmentRepository, type AssessmentRepository } from "./assessment.js";
import { InMemoryLearningRepository, type LearningRepository } from "./repository.js";
import { LearningService } from "./service.js";

const studentParamsSchema = z.object({ studentId: z.string().min(1).max(200) });
const quizParamsSchema = z.object({ topicId: z.string().min(1).max(200) });
const quizQuerySchema = z.object({
  studentId: z.string().min(1).max(200),
  courseId: z.string().min(1).max(200),
  purpose: assessmentPurposeSchema.default("checkpoint"),
  limit: z.coerce.number().int().min(1).max(10).default(1),
});

export interface LearningRoutesOptions {
  repository?: LearningRepository;
  assessments?: AssessmentRepository;
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
  app.get<{ Reply: StudentLearningState }>("/learning/student/:studentId/state", async (request) =>
    service.getStudentState(request.auth, studentParamsSchema.parse(request.params).studentId),
  );
}
