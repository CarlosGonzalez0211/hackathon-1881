import {
  createStrategyContextKey,
  type DiagnosticResult,
  type DiagnosticSubmission,
  type StrategyPosterior,
  type TeachingStrategy,
} from "../learning.js";
import type {
  CurriculumConcept,
  CurriculumContextRequest,
  CurriculumContextResponse,
} from "../learning-curriculum.js";
import { athenaDemoIds } from "./demo-identities.js";

const rectangleAreaConceptId = "math.geometry.rectangle_area";
const triangleBaseHeightConceptId = "math.geometry.triangle_base_height";
const triangleAreaConceptId = "math.geometry.triangle_area";
const triangleMissingHalfMisconceptionId = "math.geometry.triangle_area.missing_half";

export const demoStrategyContextKeys = {
  triangleMisconceptionIntroductory: createStrategyContextKey({
    conceptId: triangleAreaConceptId,
    purpose: "misconception_repair",
    difficulty: 0.35,
    misconceptionId: triangleMissingHalfMisconceptionId,
  }),
  triangleMisconceptionDeveloping: createStrategyContextKey({
    conceptId: triangleAreaConceptId,
    purpose: "misconception_repair",
    difficulty: 0.6,
    misconceptionId: triangleMissingHalfMisconceptionId,
  }),
  baseHeightFoundationIntroductory: createStrategyContextKey({
    conceptId: triangleBaseHeightConceptId,
    purpose: "foundation",
    difficulty: 0.25,
  }),
  baseHeightFoundationDeveloping: createStrategyContextKey({
    conceptId: triangleBaseHeightConceptId,
    purpose: "foundation",
    difficulty: 0.55,
  }),
  rectangleFoundationIntroductory: createStrategyContextKey({
    conceptId: rectangleAreaConceptId,
    purpose: "foundation",
    difficulty: 0.3,
  }),
  triangleTransferAdvanced: createStrategyContextKey({
    conceptId: triangleAreaConceptId,
    purpose: "transfer",
    difficulty: 0.7,
    misconceptionId: triangleMissingHalfMisconceptionId,
  }),
  triangleExplanationDeveloping: createStrategyContextKey({
    conceptId: triangleAreaConceptId,
    purpose: "explanation",
    difficulty: 0.65,
    misconceptionId: triangleMissingHalfMisconceptionId,
  }),
  triangleRetentionDeveloping: createStrategyContextKey({
    conceptId: triangleAreaConceptId,
    purpose: "retention",
    difficulty: 0.65,
    misconceptionId: triangleMissingHalfMisconceptionId,
  }),
} as const;

/** Provisional ids live in one catalog until Daniela and Vianey freeze the shared concept ids. */
export const demoLearningIds = {
  concepts: {
    rectangleArea: rectangleAreaConceptId,
    triangleBaseHeight: triangleBaseHeightConceptId,
    triangleArea: triangleAreaConceptId,
  },
  misconceptions: {
    triangleMissingHalf: triangleMissingHalfMisconceptionId,
  },
  questions: {
    diagnosticTriangleArea: "00000000-0000-4000-8000-00000000d001",
    diagnosticTriangleBaseHeight: "00000000-0000-4000-8000-00000000d002",
    diagnosticTriangleAreaDistractors: "00000000-0000-4000-8000-00000000d003",
    checkpointTriangleArea: "00000000-0000-4000-8000-00000000c001",
    checkpointTriangleBaseHeight: "00000000-0000-4000-8000-00000000c002",
    checkpointRectangleArea: "00000000-0000-4000-8000-00000000c003",
    checkpointTriangleAreaTransfer: "00000000-0000-4000-8000-00000000c004",
    checkpointTriangleExplanation: "00000000-0000-4000-8000-00000000c005",
    retentionTriangleArea: "00000000-0000-4000-8000-00000000b001",
  },
  materials: {
    geometryNotes: "00000000-0000-4000-8000-00000000e001",
    luciaGeometryGuide: "00000000-0000-4000-8000-00000000e002",
  },
  chunks: {
    triangleAreaExplanation: "00000000-0000-4000-8000-00000000e101",
    triangleBaseHeight: "00000000-0000-4000-8000-00000000e102",
    triangleWorkedExample: "00000000-0000-4000-8000-00000000e103",
  },
} as const;

export const demoCurriculumConcepts: CurriculumConcept[] = [
  {
    conceptId: demoLearningIds.concepts.rectangleArea,
    courseId: athenaDemoIds.course,
    topicId: athenaDemoIds.topics.geometry,
    title: "Área de rectángulos",
    prerequisiteConceptIds: [],
    requiredForMastery: false,
    curriculumVersion: 1,
  },
  {
    conceptId: demoLearningIds.concepts.triangleBaseHeight,
    courseId: athenaDemoIds.course,
    topicId: athenaDemoIds.topics.geometry,
    title: "Base y altura de un triángulo",
    prerequisiteConceptIds: [],
    requiredForMastery: true,
    curriculumVersion: 1,
  },
  {
    conceptId: demoLearningIds.concepts.triangleArea,
    courseId: athenaDemoIds.course,
    topicId: athenaDemoIds.topics.geometry,
    title: "Área de triángulos",
    prerequisiteConceptIds: [
      demoLearningIds.concepts.rectangleArea,
      demoLearningIds.concepts.triangleBaseHeight,
    ],
    requiredForMastery: true,
    curriculumVersion: 1,
  },
];

export const demoCurriculumContextRequest: CurriculumContextRequest = {
  studentId: athenaDemoIds.students.lucia,
  courseId: athenaDemoIds.course,
  topicId: athenaDemoIds.topics.geometry,
  conceptId: demoLearningIds.concepts.triangleArea,
  query: "¿Cómo se relacionan las áreas de un rectángulo y un triángulo?",
  curriculumVersion: 1,
  locale: "es",
  limit: 5,
};

export const demoCurriculumContextResponse: CurriculumContextResponse = {
  chunks: [
    {
      text: "Dos triángulos iguales forman un rectángulo con la misma base y altura. Por eso, el área de un triángulo es base por altura dividido entre dos.",
      conceptId: demoLearningIds.concepts.triangleArea,
      citation: {
        materialId: demoLearningIds.materials.luciaGeometryGuide,
        materialTitle: "Matemáticas I — Guía del estudiante: Geometría",
        section: "Triángulos y rectángulos",
        chunkId: demoLearningIds.chunks.triangleAreaExplanation,
        excerpt: "Dos triángulos iguales forman un rectángulo con la misma base y altura.",
      },
      relevanceScore: 1,
    },
    {
      text: "La base puede ser cualquier lado del triángulo. La altura correspondiente es la distancia perpendicular desde la base hasta el vértice opuesto; no siempre es un lado inclinado.",
      conceptId: demoLearningIds.concepts.triangleBaseHeight,
      citation: {
        materialId: demoLearningIds.materials.luciaGeometryGuide,
        materialTitle: "Matemáticas I — Guía del estudiante: Geometría",
        section: "Cómo identificar la base y la altura",
        chunkId: demoLearningIds.chunks.triangleBaseHeight,
        excerpt:
          "La altura correspondiente es la distancia perpendicular desde la base hasta el vértice opuesto.",
      },
      relevanceScore: 0.98,
    },
    {
      text: "Ejemplo: para un triángulo con base 10 y altura 6, multiplica 10 por 6 para obtener 60 y divide entre dos. El área es 30 unidades cuadradas.",
      conceptId: demoLearningIds.concepts.triangleArea,
      citation: {
        materialId: demoLearningIds.materials.luciaGeometryGuide,
        materialTitle: "Matemáticas I — Guía del estudiante: Geometría",
        section: "Ejemplo resuelto",
        chunkId: demoLearningIds.chunks.triangleWorkedExample,
        excerpt: "Multiplica 10 por 6 para obtener 60 y divide entre dos.",
      },
      relevanceScore: 0.96,
    },
  ],
  curriculumVersion: 1,
  unsupported: false,
};

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
      misconceptionCandidates: [],
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
    contextKey: demoStrategyContextKeys.triangleMisconceptionDeveloping,
    alpha: 2,
    beta: 1,
    observations: 1,
  },
  {
    strategy: "visual_decomposition",
    contextKey: demoStrategyContextKeys.triangleMisconceptionDeveloping,
    alpha: 3,
    beta: 1,
    observations: 2,
  },
  {
    strategy: "guided_questioning",
    contextKey: demoStrategyContextKeys.triangleMisconceptionDeveloping,
    alpha: 1,
    beta: 1,
    observations: 0,
  },
];

export interface DemoStudentLearningProfile {
  studentId: string;
  displayName: string;
  topicId: string;
  mastery: number;
  strengths: string[];
  struggles: string[];
  activeMisconceptionIds: string[];
  preferredStrategies: TeachingStrategy[];
  blockedStrategies: TeachingStrategy[];
  recommendedStrategy: TeachingStrategy;
  requiresCaptions: boolean;
  reducedMotion: boolean;
  recentAttempts: Array<{
    conceptId: string;
    correct: boolean;
    strategy: TeachingStrategy;
  }>;
}

/** Student-owned demo memory used to make mock tutoring visibly personal and deterministic. */
export const demoStudentLearningProfiles: Record<string, DemoStudentLearningProfile> = {
  [athenaDemoIds.students.lucia]: {
    studentId: athenaDemoIds.students.lucia,
    displayName: "Lucía Torres",
    topicId: athenaDemoIds.topics.geometry,
    mastery: 0.35,
    strengths: ["recognizes the base and perpendicular height"],
    struggles: ["remembering the divide-by-two step for triangle area"],
    activeMisconceptionIds: [demoLearningIds.misconceptions.triangleMissingHalf],
    preferredStrategies: ["visual_decomposition", "worked_example"],
    blockedStrategies: ["podcast"],
    recommendedStrategy: "visual_decomposition",
    requiresCaptions: true,
    reducedMotion: true,
    recentAttempts: [
      {
        conceptId: demoLearningIds.concepts.triangleArea,
        correct: false,
        strategy: "worked_example",
      },
      {
        conceptId: demoLearningIds.concepts.triangleBaseHeight,
        correct: true,
        strategy: "visual_decomposition",
      },
    ],
  },
  [athenaDemoIds.students.mateo]: {
    studentId: athenaDemoIds.students.mateo,
    displayName: "Mateo Herrera",
    topicId: athenaDemoIds.topics.geometry,
    mastery: 0.62,
    strengths: ["calculates rectangle area accurately"],
    struggles: ["explaining how a rectangle relates to two equal triangles"],
    activeMisconceptionIds: [],
    preferredStrategies: ["guided_questioning"],
    blockedStrategies: [],
    recommendedStrategy: "guided_questioning",
    requiresCaptions: false,
    reducedMotion: false,
    recentAttempts: [
      {
        conceptId: demoLearningIds.concepts.rectangleArea,
        correct: true,
        strategy: "practice_first",
      },
      {
        conceptId: demoLearningIds.concepts.triangleArea,
        correct: false,
        strategy: "worked_example",
      },
    ],
  },
};
