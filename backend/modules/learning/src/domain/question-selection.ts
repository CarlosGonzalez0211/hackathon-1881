import type { AssessmentPurpose, QuestionSelectionReason } from "@athena/shared";

export interface AssessmentSelectionCandidate {
  id: string;
  purpose: AssessmentPurpose;
  conceptId: string;
  difficulty: number;
  requiredForMastery: boolean;
  targetMisconceptionIds: readonly string[];
  transfer: boolean;
}

export interface AssessmentSelectionInput<T extends AssessmentSelectionCandidate> {
  candidates: readonly T[];
  purpose: AssessmentPurpose;
  limit: number;
  knowledgeByConcept: Readonly<Record<string, number>>;
  demonstratedConceptIds: readonly string[];
  activeMisconceptionIds: readonly string[];
  recentQuestionIds: readonly string[];
}

export interface SelectedAssessmentQuestion<T extends AssessmentSelectionCandidate> {
  question: T;
  reason: QuestionSelectionReason;
  score: number;
}

/** Deterministic ranking; answer keys are deliberately absent from this input. */
export function selectAssessmentQuestions<T extends AssessmentSelectionCandidate>(
  input: AssessmentSelectionInput<T>,
): SelectedAssessmentQuestion<T>[] {
  if (!Number.isInteger(input.limit) || input.limit < 1) {
    throw new Error("Question limit must be a positive integer");
  }

  const demonstrated = new Set(input.demonstratedConceptIds);
  const activeMisconceptions = new Set(input.activeMisconceptionIds);
  const recent = new Set(input.recentQuestionIds);
  const eligible = input.candidates.filter((candidate) => candidate.purpose === input.purpose);
  const nonRecent = eligible.filter((candidate) => !recent.has(candidate.id));
  const pool = nonRecent.length >= Math.min(input.limit, eligible.length) ? nonRecent : eligible;

  const ranked = pool
    .map((question) => rankQuestion(question, input, demonstrated, activeMisconceptions, recent))
    .sort(
      (left, right) =>
        right.score - left.score || left.question.id.localeCompare(right.question.id),
    );

  const selected: SelectedAssessmentQuestion<T>[] = [];
  const selectedConcepts = new Set<string>();
  for (const candidate of ranked) {
    if (selected.length >= input.limit) break;
    if (selectedConcepts.has(candidate.question.conceptId)) continue;
    selected.push(candidate);
    selectedConcepts.add(candidate.question.conceptId);
  }
  for (const candidate of ranked) {
    if (selected.length >= input.limit) break;
    if (
      selected.some((selectedQuestion) => selectedQuestion.question.id === candidate.question.id)
    ) {
      continue;
    }
    selected.push(candidate);
  }
  return selected;
}

function rankQuestion<T extends AssessmentSelectionCandidate>(
  question: T,
  input: AssessmentSelectionInput<T>,
  demonstrated: ReadonlySet<string>,
  activeMisconceptions: ReadonlySet<string>,
  recent: ReadonlySet<string>,
): SelectedAssessmentQuestion<T> {
  validateProbability(question.difficulty, "Question difficulty");
  const knowledge = input.knowledgeByConcept[question.conceptId] ?? 0.2;
  validateProbability(knowledge, "Concept knowledge");
  const targetDifficulty = 0.25 + knowledge * 0.6;
  const difficultyFit = 1 - Math.abs(question.difficulty - targetDifficulty);
  const uncoveredRequired = question.requiredForMastery && !demonstrated.has(question.conceptId);
  const targetsMisconception = question.targetMisconceptionIds.some((id) =>
    activeMisconceptions.has(id),
  );

  const score =
    (uncoveredRequired ? 3 : 0) +
    (targetsMisconception ? 2 : 0) +
    difficultyFit +
    (question.transfer ? 0.25 : 0) -
    (recent.has(question.id) ? 4 : 0);

  return {
    question,
    reason: uncoveredRequired
      ? "uncovered_required_concept"
      : targetsMisconception
        ? "misconception_repair"
        : question.transfer
          ? "transfer_practice"
          : difficultyFit >= 0.75
            ? "difficulty_match"
            : "review",
    score,
  };
}

function validateProbability(value: number, name: string) {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error(`${name} must be between 0 and 1`);
  }
}
