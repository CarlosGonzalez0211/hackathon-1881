import assert from "node:assert/strict";
import test from "node:test";
import { athenaDemoIds, demoLearningIds } from "@athena/shared";
import type { AuthorizationService } from "@athena/platform";
import { createApp } from "../src/app.js";

class ToggleAuthorizationService implements AuthorizationService {
  denied = false;

  canAccessClass() {
    return !this.denied;
  }

  canAccessCourse() {
    return !this.denied;
  }

  canAccessStudent() {
    return !this.denied;
  }
}

test("every learning route enforces its student or course authorization boundary", async () => {
  const authorization = new ToggleAuthorizationService();
  const app = await createApp({ logger: false, platform: { authorization } });
  try {
    const seededSession = await app.inject({
      method: "POST",
      url: "/api/learning/session",
      payload: validSessionStart,
    });
    assert.equal(seededSession.statusCode, 200, seededSession.body);
    const sessionId = seededSession.json().session.id as string;
    authorization.denied = true;

    const deniedRequests = [
      {
        method: "POST",
        url: "/api/learning/diagnostic",
        payload: validDiagnostic,
      },
      { method: "POST", url: "/api/learning/attempt", payload: validAttempt },
      {
        method: "GET",
        url: `/api/learning/quiz/${athenaDemoIds.topics.geometry}?studentId=${athenaDemoIds.students.lucia}&courseId=${athenaDemoIds.course}`,
      },
      {
        method: "POST",
        url: "/api/learning/retention-check",
        payload: validRetentionCheck,
      },
      {
        method: "GET",
        url: `/api/learning/student/${athenaDemoIds.students.lucia}/state`,
      },
      {
        method: "GET",
        url: `/api/learning/student/${athenaDemoIds.students.lucia}/mastery`,
      },
      {
        method: "GET",
        url: `/api/learning/student/${athenaDemoIds.students.lucia}/topics/${athenaDemoIds.topics.geometry}/evidence`,
      },
      {
        method: "PUT",
        url: `/api/learning/student/${athenaDemoIds.students.lucia}/preferences`,
        payload: { preferredStrategies: ["worked_example"] },
      },
      {
        method: "GET",
        url: `/api/learning/student/${athenaDemoIds.students.lucia}/recommendation?courseId=${athenaDemoIds.course}`,
      },
      {
        method: "PUT",
        url: `/api/learning/course/${athenaDemoIds.course}/topics/${athenaDemoIds.topics.geometry}/priority`,
        payload: { priority: 0.8 },
      },
      { method: "POST", url: "/api/learning/session", payload: validSessionStart },
      {
        method: "POST",
        url: `/api/learning/session/${sessionId}/messages`,
        payload: { content: "Help me understand this." },
      },
      { method: "GET", url: `/api/learning/session/${sessionId}/summary` },
      { method: "POST", url: "/api/learning/hint", payload: validHint },
    ] as const;

    for (const request of deniedRequests) {
      const response = await app.inject(request);
      assert.equal(response.statusCode, 403, `${request.method} ${request.url}: ${response.body}`);
    }
  } finally {
    await app.close();
  }
});

test("every learning route rejects malformed parameters, queries or bodies", async () => {
  const app = await createApp({ logger: false });
  try {
    const tooLongId = "x".repeat(201);
    const malformedRequests = [
      { method: "POST", url: "/api/learning/diagnostic", payload: {} },
      { method: "POST", url: "/api/learning/attempt", payload: {} },
      { method: "GET", url: `/api/learning/quiz/${athenaDemoIds.topics.geometry}` },
      { method: "POST", url: "/api/learning/retention-check", payload: {} },
      { method: "GET", url: `/api/learning/student/${tooLongId}/state` },
      { method: "GET", url: `/api/learning/student/${tooLongId}/mastery` },
      {
        method: "GET",
        url: `/api/learning/student/${athenaDemoIds.students.lucia}/topics/${tooLongId}/evidence`,
      },
      {
        method: "PUT",
        url: `/api/learning/student/${athenaDemoIds.students.lucia}/preferences`,
        payload: { preferredStrategies: ["telepathy"] },
      },
      {
        method: "GET",
        url: `/api/learning/student/${athenaDemoIds.students.lucia}/recommendation`,
      },
      {
        method: "PUT",
        url: `/api/learning/course/${athenaDemoIds.course}/topics/${athenaDemoIds.topics.geometry}/priority`,
        payload: { priority: 2 },
      },
      { method: "POST", url: "/api/learning/session", payload: {} },
      {
        method: "POST",
        url: `/api/learning/session/${athenaDemoIds.topics.geometry}/messages`,
        payload: {},
      },
      { method: "GET", url: `/api/learning/session/${tooLongId}/summary` },
      { method: "POST", url: "/api/learning/hint", payload: {} },
    ] as const;

    for (const request of malformedRequests) {
      const response = await app.inject(request);
      assert.ok(
        response.statusCode === 400 || response.statusCode === 414,
        `${request.method} ${request.url}: ${response.body}`,
      );
    }
  } finally {
    await app.close();
  }
});

const validDiagnostic = {
  studentId: athenaDemoIds.students.lucia,
  courseId: athenaDemoIds.course,
  topicId: athenaDemoIds.topics.geometry,
  answers: [{ questionId: demoLearningIds.questions.diagnosticTriangleArea, answer: 24 }],
};

const validAttempt = {
  studentId: athenaDemoIds.students.lucia,
  courseId: athenaDemoIds.course,
  topicId: athenaDemoIds.topics.geometry,
  conceptId: demoLearningIds.concepts.triangleArea,
  questionId: demoLearningIds.questions.checkpointTriangleArea,
  answer: 30,
  strategy: "worked_example",
  hintCount: 0,
};

const validRetentionCheck = {
  studentId: athenaDemoIds.students.lucia,
  courseId: athenaDemoIds.course,
  topicId: athenaDemoIds.topics.geometry,
  conceptId: demoLearningIds.concepts.triangleArea,
  questionId: demoLearningIds.questions.retentionTriangleArea,
  answer: 30,
};

const validSessionStart = {
  studentId: athenaDemoIds.students.lucia,
  courseId: athenaDemoIds.course,
  topicId: athenaDemoIds.topics.geometry,
  conceptId: demoLearningIds.concepts.triangleArea,
  objective: "Understand triangle area.",
  strategy: "worked_example",
  curriculumVersion: 1,
};

const validHint = {
  studentId: athenaDemoIds.students.lucia,
  courseId: athenaDemoIds.course,
  topicId: athenaDemoIds.topics.geometry,
  conceptId: demoLearningIds.concepts.triangleArea,
  questionId: demoLearningIds.questions.checkpointTriangleArea,
  strategy: "guided_questioning",
  curriculumVersion: 1,
};
