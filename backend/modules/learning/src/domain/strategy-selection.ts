import {
  automaticallySelectableTeachingStrategies,
  type StrategyPosterior,
  type TeachingStrategy,
} from "@athena/shared";

export interface StrategyRewardInput {
  beforeScore: number;
  afterScore: number;
  misconceptionResolved: boolean;
  retentionPassed?: boolean;
}

export function calculateStrategyReward(input: StrategyRewardInput) {
  const improvement = clamp(input.afterScore - input.beforeScore);
  return round(
    improvement * 0.5 +
      (input.misconceptionResolved ? 0.25 : 0) +
      (input.retentionPassed ? 0.25 : 0),
  );
}

export function updateStrategyPosterior(
  posterior: StrategyPosterior,
  reward: number,
): StrategyPosterior {
  const boundedReward = clamp(reward);
  return {
    ...posterior,
    alpha: posterior.alpha + boundedReward,
    beta: posterior.beta + 1 - boundedReward,
    observations: posterior.observations + 1,
  };
}

export function initializeStrategyPosteriors(
  contextKey: string,
  existing: readonly StrategyPosterior[] = [],
): StrategyPosterior[] {
  const existingByStrategy = new Map(existing.map((posterior) => [posterior.strategy, posterior]));
  return automaticallySelectableTeachingStrategies.map(
    (strategy) =>
      existingByStrategy.get(strategy) ?? {
        strategy,
        contextKey,
        alpha: 1,
        beta: 1,
        observations: 0,
      },
  );
}

export function selectTeachingStrategy(input: {
  posteriors: readonly StrategyPosterior[];
  previousStrategy?: TeachingStrategy;
  previousAttemptFailed?: boolean;
  allowedStrategies?: readonly TeachingStrategy[];
  random?: () => number;
}): TeachingStrategy {
  const allowed = input.allowedStrategies ? new Set(input.allowedStrategies) : undefined;
  let candidates = input.posteriors.filter(
    (posterior) => !allowed || allowed.has(posterior.strategy),
  );
  if (input.previousAttemptFailed && input.previousStrategy && candidates.length > 1) {
    candidates = candidates.filter((posterior) => posterior.strategy !== input.previousStrategy);
  }
  if (candidates.length === 0) throw new Error("No eligible teaching strategy");

  const random = input.random ?? Math.random;
  let winner = candidates[0];
  if (!winner) throw new Error("No eligible teaching strategy");
  let winningSample = sampleBeta(winner.alpha, winner.beta, random);
  for (const candidate of candidates.slice(1)) {
    const sample = sampleBeta(candidate.alpha, candidate.beta, random);
    if (sample > winningSample) {
      winner = candidate;
      winningSample = sample;
    }
  }
  return winner.strategy;
}

/** Beta sampling through two Gamma draws; the RNG is injectable for deterministic tests. */
function sampleBeta(alpha: number, beta: number, random: () => number) {
  const x = sampleGamma(alpha, random);
  const y = sampleGamma(beta, random);
  return x / (x + y);
}

function sampleGamma(shape: number, random: () => number): number {
  if (!(shape > 0)) throw new RangeError("Gamma shape must be positive");
  if (shape < 1) {
    const u = safeRandom(random);
    return sampleGamma(shape + 1, random) * Math.pow(u, 1 / shape);
  }
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x: number;
    let v: number;
    do {
      const u1 = safeRandom(random);
      const u2 = safeRandom(random);
      x = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = safeRandom(random);
    if (u < 1 - 0.0331 * x ** 4 || Math.log(u) < 0.5 * x ** 2 + d * (1 - v + Math.log(v))) {
      return d * v;
    }
  }
}

function safeRandom(random: () => number) {
  return Math.min(1 - Number.EPSILON, Math.max(Number.EPSILON, random()));
}

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
