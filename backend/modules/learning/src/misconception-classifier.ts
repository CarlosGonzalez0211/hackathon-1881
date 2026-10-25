import type { MisconceptionCandidate } from "@athena/shared";

export interface MisconceptionClassifier {
  classify(input: {
    questionId: string;
    conceptId: string;
    answer: unknown;
  }): Promise<MisconceptionCandidate[]>;
}

/**
 * Contract-valid mock for responses that do not match a deterministic rule.
 * Candidates require review and never become active misconceptions automatically.
 */
export class MockMisconceptionClassifier implements MisconceptionClassifier {
  async classify(input: {
    questionId: string;
    conceptId: string;
    answer: unknown;
  }): Promise<MisconceptionCandidate[]> {
    return [
      {
        misconceptionId: `${input.conceptId}.unclassified_response`,
        confidence: 0.4,
        rationale: `The response to ${input.questionId} did not match a known deterministic answer pattern.`,
        source: "model_candidate",
        reviewRequired: true,
      },
    ];
  }
}
