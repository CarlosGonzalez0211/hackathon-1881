import {
  demoCurriculumContextResponse,
  learningSessionMessageSubmissionSchema,
  tutorMessageSchema,
  worldLearningSessionStartRequestSchema,
  worldLearningSessionStartSchema,
  type TutorMessage,
  type WorldLearningSessionStart,
  type WorldLearningSessionStartRequest,
} from "@athena/shared";
import { api } from "../../../lib/api";
import { useMocks } from "../../../lib/mode";

export interface LearningClient {
  startSession(input: WorldLearningSessionStartRequest): Promise<WorldLearningSessionStart>;
  sendMessage(sessionId: string, content: string): Promise<TutorMessage>;
}

export type LearningRequester = <T>(path: string, init?: RequestInit) => Promise<T>;

/** Browser adapter for the Learning routes registered below `/api`. */
export class ApiLearningClient implements LearningClient {
  constructor(private readonly request: LearningRequester = api) {}

  async startSession(input: WorldLearningSessionStartRequest) {
    const body = worldLearningSessionStartRequestSchema.parse(input);
    return worldLearningSessionStartSchema.parse(
      await this.request<unknown>("/learning/session", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    );
  }

  async sendMessage(sessionId: string, content: string) {
    const body = learningSessionMessageSubmissionSchema.parse({ content });
    return tutorMessageSchema.parse(
      await this.request<unknown>(`/learning/session/${encodeURIComponent(sessionId)}/messages`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    );
  }
}

interface MockSession {
  topicId: string;
  strategy: string;
  messages: number;
}

/** Deterministic in-browser tutor used by the default hackathon demo mode. */
export class MockLearningClient implements LearningClient {
  private readonly sessions = new Map<string, MockSession>();
  private nextSession = 1;

  async startSession(input: WorldLearningSessionStartRequest) {
    const parsed = worldLearningSessionStartRequestSchema.parse(input);
    const sessionId = `mock-learning-session-${this.nextSession++}`;
    const session = {
      topicId: parsed.topicId,
      strategy: "worked_example",
      messages: 0,
    };
    this.sessions.set(sessionId, session);
    return worldLearningSessionStartSchema.parse({
      sessionId,
      topicId: parsed.topicId,
      strategy: session.strategy,
      resumed: false,
    });
  }

  async sendMessage(sessionId: string, content: string) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error("Learning session not found");
    const { content: studentMessage } = learningSessionMessageSubmissionSchema.parse({ content });
    session.messages += 1;
    const source = demoCurriculumContextResponse.chunks[0]!;
    const asksWhy = /why|por qu[eé]|divide|half|mitad/i.test(studentMessage);
    const explanation = asksWhy
      ? "Two equal triangles form a rectangle with the same base and height, so one triangle has half the rectangle's area."
      : "Let's connect your question to the approved geometry notes: two equal triangles form a rectangle with the same base and height.";
    return tutorMessageSchema.parse({
      id: `${sessionId}-message-${session.messages}`,
      sessionId,
      role: "tutor",
      content: explanation,
      strategy: session.strategy,
      citations: [source.citation],
      curriculumVersion: demoCurriculumContextResponse.curriculumVersion,
      sourceIds: [source.citation.chunkId],
      unsupported: false,
      createdAt: new Date().toISOString(),
    });
  }
}

let client: LearningClient | undefined;

/** One client per browser bundle so mock sessions survive React remounts. */
export const getLearningClient = (): LearningClient =>
  (client ??= useMocks ? new MockLearningClient() : new ApiLearningClient());
