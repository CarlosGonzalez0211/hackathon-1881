export interface RecommendationCandidate {
  topicId: string;
  prerequisiteTopicIds: readonly string[];
  knowledgeGap: number;
  misconceptionSeverity: number;
  retentionUrgency: number;
  teacherPriority?: number;
}

export interface RankedRecommendation extends RecommendationCandidate {
  score: number;
}

/** Filters locked topics before applying an explainable weighted recommendation score. */
export function rankRecommendations(input: {
  candidates: readonly RecommendationCandidate[];
  masteryByTopic: Readonly<Record<string, number>>;
  prerequisiteThreshold?: number;
}): RankedRecommendation[] {
  const threshold = input.prerequisiteThreshold ?? 0.8;
  return input.candidates
    .filter((candidate) =>
      candidate.prerequisiteTopicIds.every(
        (topicId) => (input.masteryByTopic[topicId] ?? 0) >= threshold,
      ),
    )
    .map((candidate) => ({
      ...candidate,
      score: round(
        clamp(
          clamp(candidate.knowledgeGap) * 0.35 +
            0.25 +
            clamp(candidate.misconceptionSeverity) * 0.2 +
            clamp(candidate.retentionUrgency) * 0.2 +
            clamp(candidate.teacherPriority ?? 0) * 0.1,
        ),
      ),
    }))
    .sort((a, b) => b.score - a.score || a.topicId.localeCompare(b.topicId));
}

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
