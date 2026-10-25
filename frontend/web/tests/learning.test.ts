import assert from "node:assert/strict";
import test from "node:test";
import {
  DEMO_GEOMETRY_TOPIC_ID,
  DEMO_STUDENT_ID,
  athenaDemoIds,
  demoStudentLearningProfiles,
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
  assert.equal(session.strategy, "visual_decomposition");

  const reply = await client.sendMessage(session.sessionId, "Why do we divide by two?");
  assert.equal(reply.role, "tutor");
  assert.equal(reply.unsupported, false);
  assert.match(reply.content, /Lucía Torres/);
  assert.match(reply.content, /recognizes the base and perpendicular height/i);
  assert.match(reply.content, /divide-by-two step/i);
  assert.match(reply.content, /half the rectangle's area/i);
  assert.equal(reply.citations.length, 1);
  assert.equal(reply.citations[0]!.materialTitle, "Matemáticas I — Guía del estudiante: Geometría");
});

test("Lucía's mock tutor retrieves the matching course-material section", async () => {
  const client = new MockLearningClient();
  const session = await client.startSession(start);

  const heightReply = await client.sendMessage(
    session.sessionId,
    "Is the slanted side always the height?",
  );
  assert.match(heightReply.content, /perpendicular distance/i);
  assert.equal(heightReply.citations[0]!.section, "Cómo identificar la base y la altura");

  const exampleReply = await client.sendMessage(
    session.sessionId,
    "Can you show an example with 10 and 6?",
  );
  assert.match(exampleReply.content, /area is 30 square units/i);
  assert.equal(exampleReply.citations[0]!.section, "Ejemplo resuelto");
});

test("mock learning client varies strategy and context by student memory", async () => {
  const client = new MockLearningClient();
  const session = await client.startSession({
    ...start,
    studentId: athenaDemoIds.students.mateo,
  });
  const reply = await client.sendMessage(session.sessionId, "How should I think about this?");

  assert.equal(session.strategy, "guided_questioning");
  assert.equal(reply.strategy, "guided_questioning");
  assert.match(reply.content, /Mateo Herrera/);
  assert.match(reply.content, /calculates rectangle area accurately/i);
  assert.match(reply.content, /explaining how a rectangle relates/i);
});

test("student learning fixtures include adaptive memory and accessibility preferences", () => {
  const lucia = demoStudentLearningProfiles[DEMO_STUDENT_ID]!;
  assert.equal(lucia.mastery, 0.35);
  assert.deepEqual(lucia.preferredStrategies, ["visual_decomposition", "worked_example"]);
  assert.equal(lucia.requiresCaptions, true);
  assert.equal(lucia.reducedMotion, true);
  assert.equal(lucia.recentAttempts.length, 2);
  assert.equal(lucia.activeMisconceptionIds.length, 1);
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
