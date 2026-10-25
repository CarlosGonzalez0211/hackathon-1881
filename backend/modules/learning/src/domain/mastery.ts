import type { CheckpointEvidence } from "@athena/shared";

export interface MasteryCalculationInput {
  previous: number;
  attempts: readonly CheckpointEvidence[];
  requiredConceptIds: readonly string[];
  activeMisconceptionIds?: readonly string[];
  masteryThreshold?: number;
}

export interface MasteryCalculationResult {
  previous: number;
  next: number;
  confidence: number;
  demonstratedConceptIds: string[];
  evidenceIds: string[];
}

export const masteryPolicy = {
  version: 1,
  defaultThreshold: 0.8,
  demonstratedConceptScore: 0.8,
  minimumEligibleAttempts: 2,
  difficultyWeightFloor: 0.5,
  performanceWeight: 0.7,
  requiredCoverageWeight: 0.2,
  misconceptionResolutionWeight: 0.1,
  thresholdGuardDelta: 0.01,
  confidenceCoverageWeight: 0.6,
  confidenceEvidenceWeight: 0.4,
  confidenceEvidenceTarget: 3,
} as const;

/**
 * Deterministic mastery authority. Tutor messages, engagement and hinted attempts are excluded
 * before calculating the score.
 */
export function calculateMastery(input: MasteryCalculationInput): MasteryCalculationResult {
  const previous = clamp(input.previous);
  const threshold = masteryThreshold(input.masteryThreshold ?? masteryPolicy.defaultThreshold);
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
    const weight =
      masteryPolicy.difficultyWeightFloor +
      clamp(attempt.difficulty) * (1 - masteryPolicy.difficultyWeightFloor);
    return total + clamp(attempt.score) * weight;
  }, 0);
  const totalWeight = eligible.reduce(
    (total, attempt) =>
      total +
      masteryPolicy.difficultyWeightFloor +
      clamp(attempt.difficulty) * (1 - masteryPolicy.difficultyWeightFloor),
    0,
  );
  const weightedScore = totalWeight === 0 ? 0 : weightedTotal / totalWeight;

  const demonstratedConceptIds = [
    ...new Set(
      eligible
        .filter(
          (attempt) => attempt.correct && attempt.score >= masteryPolicy.demonstratedConceptScore,
        )
        .map((attempt) => attempt.conceptId),
    ),
  ];
  const required = new Set(input.requiredConceptIds);
  const demonstratedRequired = demonstratedConceptIds.filter((id) => required.has(id)).length;
  const coverage = required.size === 0 ? 1 : demonstratedRequired / required.size;
  const resolvedBonus = eligible.some((attempt) => attempt.misconceptionResolved)
    ? masteryPolicy.misconceptionResolutionWeight
    : 0;
  const evidenceScore = clamp(
    weightedScore * masteryPolicy.performanceWeight +
      coverage * masteryPolicy.requiredCoverageWeight +
      resolvedBonus,
  );
  const mayCrossThreshold =
    coverage === 1 &&
    eligible.length >= masteryPolicy.minimumEligibleAttempts &&
    (input.activeMisconceptionIds?.length ?? 0) === 0;
  const thresholdGuard = Math.max(0, threshold - masteryPolicy.thresholdGuardDelta);
  const policyScore = mayCrossThreshold ? evidenceScore : Math.min(evidenceScore, thresholdGuard);

  return {
    previous,
    next: Math.max(previous, round(policyScore)),
    confidence: round(
      clamp(
        coverage * masteryPolicy.confidenceCoverageWeight +
          (Math.min(eligible.length, masteryPolicy.confidenceEvidenceTarget) /
            masteryPolicy.confidenceEvidenceTarget) *
            masteryPolicy.confidenceEvidenceWeight,
      ),
    ),
    demonstratedConceptIds,
    evidenceIds: eligible.map((attempt) => attempt.id),
  };
}

function masteryThreshold(value: number) {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError("masteryThreshold must be between 0 and 1");
  }
  return value;
}

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
