import type { CheckpointEvidence } from "@athena/shared";

export interface MasteryCalculationInput {
  previous: number;
  attempts: readonly CheckpointEvidence[];
  requiredConceptIds: readonly string[];
}

export interface MasteryCalculationResult {
  previous: number;
  next: number;
  confidence: number;
  demonstratedConceptIds: string[];
  evidenceIds: string[];
}

/**
 * Deterministic mastery authority. Tutor messages, engagement and hinted attempts are excluded
 * before calculating the score.
 */
export function calculateMastery(input: MasteryCalculationInput): MasteryCalculationResult {
  const previous = clamp(input.previous);
  const eligible = input.attempts.filter((attempt) => attempt.evidenceEligible);
  if (eligible.length === 0) {
    return {
      previous,
      next: previous,
      confidence: 0,
      demonstratedConceptIds: [],
      evidenceIds: [],
    };
  }

  const weightedTotal = eligible.reduce((total, attempt) => {
    const weight = 0.5 + clamp(attempt.difficulty) * 0.5;
    return total + clamp(attempt.score) * weight;
  }, 0);
  const totalWeight = eligible.reduce(
    (total, attempt) => total + 0.5 + clamp(attempt.difficulty) * 0.5,
    0,
  );
  const weightedScore = totalWeight === 0 ? 0 : weightedTotal / totalWeight;

  const demonstratedConceptIds = [
    ...new Set(
      eligible
        .filter((attempt) => attempt.correct && attempt.score >= 0.8)
        .map((attempt) => attempt.conceptId),
    ),
  ];
  const required = new Set(input.requiredConceptIds);
  const demonstratedRequired = demonstratedConceptIds.filter((id) => required.has(id)).length;
  const coverage = required.size === 0 ? 1 : demonstratedRequired / required.size;
  const resolvedBonus = eligible.some((attempt) => attempt.misconceptionResolved) ? 0.1 : 0;
  const evidenceScore = clamp(weightedScore * 0.7 + coverage * 0.2 + resolvedBonus);

  return {
    previous,
    next: Math.max(previous, round(evidenceScore)),
    confidence: round(clamp(coverage * 0.6 + (Math.min(eligible.length, 3) / 3) * 0.4)),
    demonstratedConceptIds,
    evidenceIds: eligible.map((attempt) => attempt.id),
  };
}

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
