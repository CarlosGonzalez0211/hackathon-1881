import { athenaDemoIds, demoLearningIds } from "@athena/shared";

export interface AssessmentQuestion {
  id: string;
  purpose: "diagnostic" | "checkpoint";
  topicId: string;
  conceptId: string;
  conceptTitle: string;
  difficulty: number;
  answerKey: unknown;
  misconceptionAnswers: Readonly<Record<string, string>>;
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
        difficulty: 0.35,
        answerKey: 12,
        misconceptionAnswers: {
          "24": demoLearningIds.misconceptions.triangleMissingHalf,
        },
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
        difficulty: 0.6,
        answerKey: 30,
        misconceptionAnswers: {
          "60": demoLearningIds.misconceptions.triangleMissingHalf,
        },
        strategyContextKey: "geometry:missing_half:foundation",
      },
    ],
  ]);

  async grade(questionId: string, answer: unknown): Promise<ScoredAnswer | null> {
    const question = this.questions.get(questionId);
    if (!question) return null;
    const normalizedAnswer = normalizeAnswer(answer);
    const correct = normalizedAnswer === normalizeAnswer(question.answerKey);
    return {
      question,
      correct,
      score: correct ? 1 : 0,
      misconceptionId: correct ? undefined : question.misconceptionAnswers[normalizedAnswer],
    };
  }
}

function normalizeAnswer(answer: unknown) {
  return typeof answer === "string" ? answer.trim().toLowerCase() : String(answer);
}
