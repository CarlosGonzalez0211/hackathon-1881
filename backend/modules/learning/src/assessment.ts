import { athenaDemoIds, demoLearningIds, type AssessmentPurpose } from "@athena/shared";

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
  misconceptionAnswers: Readonly<Record<string, string>>;
  targetMisconceptionIds: readonly string[];
  strategyContextKey: string;
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
        strategyContextKey: "geometry:missing_half:foundation",
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
        strategyContextKey: "geometry:missing_half:foundation",
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
        strategyContextKey: "geometry:base_height:foundation",
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
        strategyContextKey: "geometry:base_height:foundation",
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
        strategyContextKey: "geometry:rectangle_area:foundation",
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
        strategyContextKey: "geometry:missing_half:transfer",
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
        strategyContextKey: "geometry:missing_half:retention",
      },
    ],
  ]);

  async grade(questionId: string, answer: unknown): Promise<ScoredAnswer | null> {
    const question = this.questions.get(questionId);
    if (!question) return null;
    const normalizedAnswer = normalizeAnswer(answer);
    const correct = normalizedAnswer === normalizeAnswer(question.answerKey);
    const score = correct ? 1 : (question.partialCreditAnswers?.[normalizedAnswer] ?? 0);
    return {
      question,
      correct,
      score,
      misconceptionId:
        correct || score > 0 ? undefined : question.misconceptionAnswers[normalizedAnswer],
    };
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

function normalizeAnswer(answer: unknown) {
  return typeof answer === "string" ? answer.trim().toLowerCase() : String(answer);
}
