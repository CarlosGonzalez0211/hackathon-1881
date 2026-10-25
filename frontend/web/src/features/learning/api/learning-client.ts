import { useMocks } from "@/lib/mode";

/**
 * STUB (P2 owns): add diagnostic, tutor session, hint, checkpoint and student state calls
 * (proposal section 4.7). `mode` only exists so the interface is not empty.
 */
export interface LearningClient {
  readonly mode: "mock" | "api";
}

export class MockLearningClient implements LearningClient {
  readonly mode = "mock" as const;
}

export class ApiLearningClient implements LearningClient {
  readonly mode = "api" as const;
}

export const getLearningClient = (): LearningClient =>
  useMocks ? new MockLearningClient() : new ApiLearningClient();
