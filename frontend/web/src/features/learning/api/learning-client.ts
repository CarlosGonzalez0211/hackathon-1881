import {
  demoCurriculumContextResponse,
  demoStudentLearningProfiles,
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
  studentProfile?: (typeof demoStudentLearningProfiles)[string];
}

/** Deterministic in-browser tutor used by the default hackathon demo mode. */
export class MockLearningClient implements LearningClient {
  private readonly sessions = new Map<string, MockSession>();
  private nextSession = 1;

  async startSession(input: WorldLearningSessionStartRequest) {
    const parsed = worldLearningSessionStartRequestSchema.parse(input);
    const sessionId = `mock-learning-session-${this.nextSession++}`;
    const studentProfile = demoStudentLearningProfiles[parsed.studentId];
    const session = {
      topicId: parsed.topicId,
      strategy: studentProfile?.recommendedStrategy ?? "worked_example",
      messages: 0,
      studentProfile,
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
    const asksWhy = /why|por qu[eé]|divide|half|mitad/i.test(studentMessage);
    const asksBaseHeight = /base|height|altura|perpendicular|side|lado/i.test(studentMessage);
    const asksForExample = /example|ejemplo|calculate|calcula|10|6|formula|f[oó]rmula/i.test(
      studentMessage,
    );
    const source =
      demoCurriculumContextResponse.chunks[
        asksWhy ? 0 : asksForExample ? 2 : asksBaseHeight ? 1 : 0
      ]!;
    const profile = session.studentProfile;
    const personalContext = profile
      ? `${profile.displayName}, you already ${profile.strengths[0]}. Let's focus on ${profile.struggles[0]}. `
      : "Let's connect your question to the approved geometry notes. ";
    const groundedAnswer = asksWhy
      ? "Two equal triangles form a rectangle with the same base and height, so one triangle has half the rectangle's area."
      : asksForExample
        ? "For a triangle with base 10 and height 6, multiply 10 × 6 = 60, then divide by two. The area is 30 square units."
        : asksBaseHeight
          ? "The height is the perpendicular distance from the chosen base to the opposite vertex; it is not necessarily a slanted side."
          : "Two equal triangles form a rectangle with the same base and height. What would you do next to find the area of just one triangle?";
    const explanation = `${personalContext}${groundedAnswer}`;
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
