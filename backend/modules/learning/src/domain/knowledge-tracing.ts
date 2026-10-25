export interface KnowledgeTracingParameters {
  learn: number;
  guess: number;
  slip: number;
}

export const defaultKnowledgeTracingParameters: KnowledgeTracingParameters = {
  learn: 0.15,
  guess: 0.2,
  slip: 0.1,
};

/** Bayesian Knowledge Tracing estimate. This is advisory and never grants mastery. */
export function updateKnowledgeProbability(
  previousProbabilityKnown: number,
  correct: boolean,
  parameters: KnowledgeTracingParameters = defaultKnowledgeTracingParameters,
) {
  const prior = probability(previousProbabilityKnown, "previousProbabilityKnown");
  const learn = probability(parameters.learn, "learn");
  const guess = probability(parameters.guess, "guess");
  const slip = probability(parameters.slip, "slip");

  const observationLikelihood = correct
    ? prior * (1 - slip) + (1 - prior) * guess
    : prior * slip + (1 - prior) * (1 - guess);
  const posteriorBeforeLearning =
    observationLikelihood === 0
      ? prior
      : correct
        ? (prior * (1 - slip)) / observationLikelihood
        : (prior * slip) / observationLikelihood;
  const posteriorAfterLearning = posteriorBeforeLearning + (1 - posteriorBeforeLearning) * learn;
  return Math.round(posteriorAfterLearning * 10_000) / 10_000;
}

function probability(value: number, name: string) {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError(`${name} must be between 0 and 1`);
  }
  return value;
}
