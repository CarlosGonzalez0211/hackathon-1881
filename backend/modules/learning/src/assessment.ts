import {
  athenaDemoIds,
  demoLearningIds,
  demoStrategyContextKeys,
  type AssessmentPurpose,
} from "@athena/shared";

export interface AssessmentQuestion {
  id: string;
  purpose: AssessmentPurpose;
  topicId: string;
  conceptId: string;
  conceptTitle: string;
  prompt: string;
  format: "numeric" | "multiple_choice" | "short_text";
  choices?: string[];
  difficulty: number;
  requiredForMastery: boolean;
  transfer: boolean;
  answerKey: unknown;
  partialCreditAnswers?: Readonly<Record<string, number>>;
  rubricFeatures?: readonly AssessmentRubricFeature[];
  passingScore?: number;
  misconceptionAnswers: Readonly<Record<string, string>>;
  targetMisconceptionIds: readonly string[];
  strategyContextKey: string;
}

export interface AssessmentRubricFeature {
  id: string;
  phrases: readonly string[];
  weight: number;
  missingMisconceptionId?: string;
}

export interface ScoredAnswer {
  question: AssessmentQuestion;
  correct: boolean;
  score: number;
  misconceptionId?: string;
}

export interface AssessmentRepository {
  grade(questionId: string, answer: unknown): Promise<ScoredAnswer | null>;
  listByTopic(topicId: string, purpose: AssessmentPurpose): Promise<AssessmentQuestion[]>;
  listRequiredConceptIds(topicId: string): Promise<string[]>;
}

export class InMemoryAssessmentRepository implements AssessmentRepository {
  private readonly questions = new Map<string, AssessmentQuestion>([
    [
      demoLearningIds.questions.diagnosticTriangleArea,
      {
        id: demoLearningIds.questions.diagnosticTriangleArea,
        purpose: "diagnostic",
        topicId: athenaDemoIds.topics.geometry,
        conceptId: demoLearningIds.concepts.triangleArea,
        conceptTitle: "Área de triángulos",
        prompt: "Un triángulo tiene base 6 y altura 4. ¿Cuál es su área?",
        format: "numeric",
        difficulty: 0.35,
        requiredForMastery: true,
        transfer: false,
        answerKey: 12,
        misconceptionAnswers: {
          "24": demoLearningIds.misconceptions.triangleMissingHalf,
        },
        targetMisconceptionIds: [demoLearningIds.misconceptions.triangleMissingHalf],
        strategyContextKey: demoStrategyContextKeys.triangleMisconceptionIntroductory,
      },
    ],
    [
      demoLearningIds.questions.checkpointTriangleArea,
      {
        id: demoLearningIds.questions.checkpointTriangleArea,
        purpose: "checkpoint",
        topicId: athenaDemoIds.topics.geometry,
        conceptId: demoLearningIds.concepts.triangleArea,
        conceptTitle: "Área de triángulos",
        prompt: "Un triángulo tiene base 10 y altura 6. ¿Cuál es su área?",
        format: "numeric",
        difficulty: 0.6,
        requiredForMastery: true,
        transfer: false,
        answerKey: 30,
        partialCreditAnswers: { "15": 0.5 },
        misconceptionAnswers: {
          "60": demoLearningIds.misconceptions.triangleMissingHalf,
        },
        targetMisconceptionIds: [demoLearningIds.misconceptions.triangleMissingHalf],
        strategyContextKey: demoStrategyContextKeys.triangleMisconceptionDeveloping,
      },
    ],
    [
      demoLearningIds.questions.diagnosticTriangleAreaDistractors,
      {
        id: demoLearningIds.questions.diagnosticTriangleAreaDistractors,
        purpose: "diagnostic",
        topicId: athenaDemoIds.topics.geometry,
        conceptId: demoLearningIds.concepts.triangleArea,
        conceptTitle: "Área de triángulos",
        prompt: "Un triángulo tiene base 8 y altura 6. ¿Cuál opción muestra su área?",
        format: "multiple_choice",
        choices: ["48", "24", "14", "28"],
        difficulty: 0.4,
        requiredForMastery: true,
        transfer: false,
        answerKey: "24",
        misconceptionAnswers: {
          "48": demoLearningIds.misconceptions.triangleMissingHalf,
        },
        targetMisconceptionIds: [demoLearningIds.misconceptions.triangleMissingHalf],
        strategyContextKey: demoStrategyContextKeys.triangleMisconceptionDeveloping,
      },
    ],
    [
      demoLearningIds.questions.diagnosticTriangleBaseHeight,
      {
        id: demoLearningIds.questions.diagnosticTriangleBaseHeight,
        purpose: "diagnostic",
        topicId: athenaDemoIds.topics.geometry,
        conceptId: demoLearningIds.concepts.triangleBaseHeight,
        conceptTitle: "Base y altura de un triángulo",
        prompt: "¿Qué relación debe tener la altura de un triángulo con su base?",
        format: "multiple_choice",
        choices: ["Paralela", "Perpendicular", "Igual", "Curva"],
        difficulty: 0.25,
        requiredForMastery: true,
        transfer: false,
        answerKey: "Perpendicular",
        misconceptionAnswers: {},
        targetMisconceptionIds: [],
        strategyContextKey: demoStrategyContextKeys.baseHeightFoundationIntroductory,
      },
    ],
    [
      demoLearningIds.questions.checkpointTriangleBaseHeight,
      {
        id: demoLearningIds.questions.checkpointTriangleBaseHeight,
        purpose: "checkpoint",
        topicId: athenaDemoIds.topics.geometry,
        conceptId: demoLearningIds.concepts.triangleBaseHeight,
        conceptTitle: "Base y altura de un triángulo",
        prompt: "Un triángulo tiene base 10 y área 30. ¿Cuál es su altura?",
        format: "numeric",
        difficulty: 0.55,
        requiredForMastery: true,
        transfer: false,
        answerKey: 6,
        misconceptionAnswers: {},
        targetMisconceptionIds: [],
        strategyContextKey: demoStrategyContextKeys.baseHeightFoundationDeveloping,
      },
    ],
    [
      demoLearningIds.questions.checkpointRectangleArea,
      {
        id: demoLearningIds.questions.checkpointRectangleArea,
        purpose: "checkpoint",
        topicId: athenaDemoIds.topics.geometry,
        conceptId: demoLearningIds.concepts.rectangleArea,
        conceptTitle: "Área de rectángulos",
        prompt: "Un rectángulo mide 8 por 6. ¿Cuál es su área?",
        format: "numeric",
        difficulty: 0.3,
        requiredForMastery: false,
        transfer: false,
        answerKey: 48,
        misconceptionAnswers: {},
        targetMisconceptionIds: [],
        strategyContextKey: demoStrategyContextKeys.rectangleFoundationIntroductory,
      },
    ],
    [
      demoLearningIds.questions.checkpointTriangleAreaTransfer,
      {
        id: demoLearningIds.questions.checkpointTriangleAreaTransfer,
        purpose: "checkpoint",
        topicId: athenaDemoIds.topics.geometry,
        conceptId: demoLearningIds.concepts.triangleArea,
        conceptTitle: "Área de triángulos",
        prompt:
          "Una bandera triangular tiene base 7 m y altura 6 m. ¿Cuántos metros cuadrados ocupa?",
        format: "numeric",
        difficulty: 0.7,
        requiredForMastery: true,
        transfer: true,
        answerKey: 21,
        misconceptionAnswers: {
          "42": demoLearningIds.misconceptions.triangleMissingHalf,
        },
        targetMisconceptionIds: [demoLearningIds.misconceptions.triangleMissingHalf],
        strategyContextKey: demoStrategyContextKeys.triangleTransferAdvanced,
      },
    ],
    [
      demoLearningIds.questions.checkpointTriangleExplanation,
      {
        id: demoLearningIds.questions.checkpointTriangleExplanation,
        purpose: "checkpoint",
        topicId: athenaDemoIds.topics.geometry,
        conceptId: demoLearningIds.concepts.triangleArea,
        conceptTitle: "Área de triángulos",
        prompt: "Explica por qué el área de un triángulo es base por altura dividido entre dos.",
        format: "short_text",
        difficulty: 0.65,
        requiredForMastery: true,
        transfer: true,
        answerKey:
          "Dos triángulos iguales forman un rectángulo, así que cada triángulo ocupa la mitad.",
        rubricFeatures: [
          {
            id: "rectangle_relationship",
            phrases: ["dos triángulos", "forman un rectángulo"],
            weight: 0.5,
          },
          {
            id: "half_relationship",
            phrases: ["mitad", "divide entre dos", "dividir entre dos", "1/2"],
            weight: 0.5,
            missingMisconceptionId: demoLearningIds.misconceptions.triangleMissingHalf,
          },
        ],
        passingScore: 1,
        misconceptionAnswers: {},
        targetMisconceptionIds: [demoLearningIds.misconceptions.triangleMissingHalf],
        strategyContextKey: demoStrategyContextKeys.triangleExplanationDeveloping,
      },
    ],
    [
      demoLearningIds.questions.retentionTriangleArea,
      {
        id: demoLearningIds.questions.retentionTriangleArea,
        purpose: "retention",
        topicId: athenaDemoIds.topics.geometry,
        conceptId: demoLearningIds.concepts.triangleArea,
        conceptTitle: "Área de triángulos",
        prompt: "Una señal triangular tiene base 12 cm y altura 5 cm. ¿Cuál es su área?",
        format: "numeric",
        difficulty: 0.65,
        requiredForMastery: true,
        transfer: true,
        answerKey: 30,
        misconceptionAnswers: {
          "60": demoLearningIds.misconceptions.triangleMissingHalf,
        },
        targetMisconceptionIds: [demoLearningIds.misconceptions.triangleMissingHalf],
        strategyContextKey: demoStrategyContextKeys.triangleRetentionDeveloping,
      },
    ],
  ]);

  async grade(questionId: string, answer: unknown): Promise<ScoredAnswer | null> {
    const question = this.questions.get(questionId);
    if (!question) return null;
    return gradeAssessmentQuestion(question, answer);
  }

  async listByTopic(topicId: string, purpose: AssessmentPurpose) {
    return [...this.questions.values()].filter(
      (question) => question.topicId === topicId && question.purpose === purpose,
    );
  }

  async listRequiredConceptIds(topicId: string) {
    return [
      ...new Set(
        [...this.questions.values()]
          .filter((question) => question.topicId === topicId && question.requiredForMastery)
          .map((question) => question.conceptId),
      ),
    ];
  }
}

export function gradeAssessmentQuestion(
  question: AssessmentQuestion,
  answer: unknown,
): ScoredAnswer {
  const normalizedAnswer = normalizeAnswer(answer);
  const rubric = gradeRubric(question, normalizedAnswer);
  const exact = normalizedAnswer === normalizeAnswer(question.answerKey);
  const score = exact
    ? 1
    : (rubric?.score ?? question.partialCreditAnswers?.[normalizedAnswer] ?? 0);
  const passingScore = question.passingScore ?? 1;
  assertProbability(passingScore, "Assessment passing score");
  const correct = exact || score >= passingScore;
  return {
    question,
    correct,
    score,
    misconceptionId: correct
      ? undefined
      : (rubric?.missingMisconceptionId ??
        (score > 0 ? undefined : question.misconceptionAnswers[normalizedAnswer])),
  };
}

function normalizeAnswer(answer: unknown) {
  return typeof answer === "string" ? answer.trim().toLowerCase() : String(answer);
}

function gradeRubric(question: AssessmentQuestion, normalizedAnswer: string) {
  if (question.format !== "short_text" || !question.rubricFeatures?.length) return undefined;
  let score = 0;
  let missingMisconceptionId: string | undefined;
  for (const feature of question.rubricFeatures) {
    assertProbability(feature.weight, `Rubric feature ${feature.id} weight`);
    if (feature.phrases.length === 0) {
      throw new Error(`Rubric feature ${feature.id} must define at least one phrase`);
    }
    const matched = feature.phrases.some((phrase) =>
      normalizedAnswer.includes(normalizeAnswer(phrase)),
    );
    if (matched) score += feature.weight;
    else missingMisconceptionId ??= feature.missingMisconceptionId;
  }
  return { score: Math.min(1, Math.max(0, score)), missingMisconceptionId };
}

function assertProbability(value: number, label: string) {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error(`${label} must be between 0 and 1`);
  }
}
