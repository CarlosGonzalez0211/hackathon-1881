import type { AssessmentPurpose } from "@athena/shared";
import {
  gradeAssessmentQuestion,
  type AssessmentQuestion,
  type AssessmentRepository,
  type ScoredAnswer,
} from "./assessment.js";
import type { LearningRestClient } from "./supabase-rest.js";

interface QuestionRow {
  id: string;
  purpose: AssessmentPurpose;
  topic_id: string;
  concept_id: string;
  prompt: string;
  format: AssessmentQuestion["format"];
  choices: string[] | null;
  difficulty: number;
  required_for_mastery: boolean;
  is_transfer: boolean;
  answer_key: unknown;
  partial_credit_answers: Record<string, number>;
  rubric_features: AssessmentQuestion["rubricFeatures"] | null;
  passing_score: number | null;
  misconception_answers: Record<string, string>;
  strategy_context_key: string;
  active: boolean;
  learning_concepts?: { title?: string } | null;
}

export class SupabaseAssessmentRepository implements AssessmentRepository {
  constructor(private readonly rest: LearningRestClient) {}

  async grade(questionId: string, answer: unknown): Promise<ScoredAnswer | null> {
    const row = (
      await this.rest.select<QuestionRow>("learning_questions", {
        id: questionId,
        active: "true",
      })
    )[0];
    if (!row) return null;
    return gradeAssessmentQuestion(toQuestion(row), answer);
  }

  async listByTopic(topicId: string, purpose: AssessmentPurpose) {
    const rows = await this.rest.select<QuestionRow>("learning_questions", {
      topic_id: topicId,
      purpose,
      active: "true",
    });
    return rows.map(toQuestion);
  }

  async listRequiredConceptIds(topicId: string) {
    const rows = await this.rest.select<QuestionRow>("learning_questions", {
      topic_id: topicId,
      required_for_mastery: "true",
      active: "true",
    });
    return [...new Set(rows.map((row) => row.concept_id))];
  }
}

function toQuestion(row: QuestionRow): AssessmentQuestion {
  return {
    id: row.id,
    purpose: row.purpose,
    topicId: row.topic_id,
    conceptId: row.concept_id,
    conceptTitle: row.learning_concepts?.title ?? row.concept_id,
    prompt: row.prompt,
    format: row.format,
    choices: row.choices ?? undefined,
    difficulty: Number(row.difficulty),
    requiredForMastery: row.required_for_mastery,
    transfer: row.is_transfer,
    answerKey: row.answer_key,
    partialCreditAnswers: row.partial_credit_answers,
    rubricFeatures: row.rubric_features ?? undefined,
    passingScore: row.passing_score == null ? undefined : Number(row.passing_score),
    misconceptionAnswers: row.misconception_answers,
    targetMisconceptionIds: [
      ...new Set([
        ...Object.values(row.misconception_answers),
        ...(row.rubric_features ?? []).flatMap((feature) =>
          feature.missingMisconceptionId ? [feature.missingMisconceptionId] : [],
        ),
      ]),
    ],
    strategyContextKey: row.strategy_context_key,
  };
}
