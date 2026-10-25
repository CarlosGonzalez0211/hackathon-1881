import assert from "node:assert/strict";
import test from "node:test";
import {
  DEMO_GEOMETRY_TOPIC_ID,
  DEMO_STUDENT_ID,
  tutorMessageSchema,
  type WorldLearningSessionStartRequest,
} from "@athena/shared";
import {
  ApiLearningClient,
  MockLearningClient,
  type LearningRequester,
} from "../src/features/learning/api/learning-client";

const start: WorldLearningSessionStartRequest = {
  studentId: DEMO_STUDENT_ID,
  topicId: DEMO_GEOMETRY_TOPIC_ID,
  entryId: "entry-geometry",
};

test("mock learning client starts an in-house tutor and returns grounded citations", async () => {
  const client = new MockLearningClient();
  const session = await client.startSession(start);
  assert.equal(session.topicId, start.topicId);
  assert.equal(session.strategy, "worked_example");

  const reply = await client.sendMessage(session.sessionId, "Why do we divide by two?");
  assert.equal(reply.role, "tutor");
  assert.equal(reply.unsupported, false);
  assert.match(reply.content, /half the rectangle's area/i);
  assert.equal(reply.citations.length, 1);
  assert.equal(reply.citations[0]!.materialTitle, "Notas de geometría del profesor");
});

test("mock learning client rejects messages for a session that was not started", async () => {
  const client = new MockLearningClient();
  await assert.rejects(() => client.sendMessage("missing", "Hello"), /not found/);
});

test("API learning client calls the registered Learning routes and validates replies", async () => {
  const calls: { path: string; init?: RequestInit }[] = [];
  const requester: LearningRequester = async <T>(path: string, init?: RequestInit) => {
    calls.push({ path, init });
    if (path === "/learning/session") {
      return {
        sessionId: "session-api-1",
        topicId: start.topicId,
        strategy: "guided_questioning",
        resumed: false,
      } as T;
    }
    return tutorMessageSchema.parse({
      id: "message-api-1",
      sessionId: "session-api-1",
      role: "tutor",
      content: "Use the approved source.",
      strategy: "guided_questioning",
      citations: [],
      curriculumVersion: 1,
      sourceIds: [],
      unsupported: true,
      createdAt: "2026-10-25T12:00:00.000Z",
    }) as T;
  };
  const client = new ApiLearningClient(requester);

  const session = await client.startSession(start);
  const reply = await client.sendMessage(session.sessionId, "Explain this");

  assert.equal(reply.unsupported, true);
  assert.deepEqual(
    calls.map((call) => [call.path, call.init?.method]),
    [
      ["/learning/session", "POST"],
      ["/learning/session/session-api-1/messages", "POST"],
    ],
  );
  assert.deepEqual(JSON.parse(String(calls[0]!.init?.body)), start);
  assert.deepEqual(JSON.parse(String(calls[1]!.init?.body)), { content: "Explain this" });
});
