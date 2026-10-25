import type { DiagnosticResult, DiagnosticSubmission, StrategyPosterior } from "../learning.js";
import { athenaDemoIds } from "./demo-identities.js";

/** Provisional ids live in one catalog until Daniela and Vianey freeze the shared concept ids. */
export const demoLearningIds = {
  concepts: {
    triangleArea: "math.geometry.triangle_area",
  },
  misconceptions: {
    triangleMissingHalf: "math.geometry.triangle_area.missing_half",
  },
  questions: {
    diagnosticTriangleArea: "00000000-0000-4000-8000-00000000d001",
    checkpointTriangleArea: "00000000-0000-4000-8000-00000000c001",
  },
} as const;

export const demoDiagnosticSubmission: DiagnosticSubmission = {
  studentId: athenaDemoIds.students.lucia,
  courseId: athenaDemoIds.course,
  topicId: athenaDemoIds.topics.geometry,
  answers: [
    {
      questionId: demoLearningIds.questions.diagnosticTriangleArea,
      answer: 24,
      confidence: 0.9,
    },
  ],
};

export const demoDiagnosticResult: DiagnosticResult = {
  attemptId: "00000000-0000-4000-8000-00000000da01",
  studentId: athenaDemoIds.students.lucia,
  courseId: athenaDemoIds.course,
  topicId: athenaDemoIds.topics.geometry,
  concepts: [
    {
      conceptId: demoLearningIds.concepts.triangleArea,
      conceptTitle: "Área de triángulos",
      score: 0,
      confidence: 0.9,
      status: "struggling",
      misconceptionIds: [demoLearningIds.misconceptions.triangleMissingHalf],
    },
  ],
  strengths: ["Reconoce base y altura"],
  struggles: ["Olvida dividir entre dos"],
  recommendation: {
    topicId: athenaDemoIds.topics.geometry,
    conceptId: demoLearningIds.concepts.triangleArea,
    reason: "Practicar la relación entre rectángulos y triángulos",
    suggestedStrategy: "worked_example",
  },
  completedAt: "2026-10-24T12:00:00.000Z",
};

export const demoStrategyPosteriors: StrategyPosterior[] = [
  {
    strategy: "worked_example",
    contextKey: "geometry:missing_half:foundation",
    alpha: 2,
    beta: 1,
    observations: 1,
  },
  {
    strategy: "visual_decomposition",
    contextKey: "geometry:missing_half:foundation",
    alpha: 3,
    beta: 1,
    observations: 2,
  },
  {
    strategy: "guided_questioning",
    contextKey: "geometry:missing_half:foundation",
    alpha: 1,
    beta: 1,
    observations: 0,
  },
];
