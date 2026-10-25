import assert from "node:assert/strict";
import test from "node:test";
import { RoleAuthorizationService } from "@athena/platform";
import { athenaDemoIds, type AuthContext } from "@athena/shared";
import { createApp } from "../src/app.js";

const { class: classId, students } = athenaDemoIds;
const NEW_STUDENT = "00000000-0000-4000-8000-0000000009aa";

const context = (overrides: Partial<AuthContext>): AuthContext => ({
  userId: "u",
  displayName: "U",
  role: "professor",
  classIds: [],
  courseIds: [],
  studentIds: [],
  ...overrides,
});

async function appFor(caller: AuthContext) {
  return createApp({
    logger: false,
    dataMode: "mock",
    platform: {
      auth: { authenticate: async () => caller },
      authorization: new RoleAuthorizationService(),
    },
  });
}

const url = (studentId?: string) =>
  `/api/classes/${classId}/enrollments${studentId ? `/${studentId}` : ""}`;

test("a professor lists, enrolls and drops students in their class", async () => {
  const app = await appFor(context({ classIds: [classId] }));
  try {
    const ids = async () =>
      (await app.inject({ method: "GET", url: url() }))
        .json()
        .map((item: { studentId: string }) => item.studentId);
    assert.ok((await ids()).includes(students.lucia));

    assert.equal((await app.inject({ method: "PUT", url: url(NEW_STUDENT) })).statusCode, 204);
    assert.ok((await ids()).includes(NEW_STUDENT));
    // Repeating either write is harmless.
    assert.equal((await app.inject({ method: "PUT", url: url(NEW_STUDENT) })).statusCode, 204);

    assert.equal((await app.inject({ method: "DELETE", url: url(NEW_STUDENT) })).statusCode, 204);
    assert.ok(!(await ids()).includes(NEW_STUDENT));
    assert.equal((await app.inject({ method: "DELETE", url: url(NEW_STUDENT) })).statusCode, 204);
  } finally {
    await app.close();
  }
});

test("students and other classes' professors cannot manage enrollment", async () => {
  for (const caller of [
    context({ role: "student", classIds: [classId], studentIds: [students.lucia] }),
    context({ classIds: ["some-other-class"] }),
  ]) {
    const app = await appFor(caller);
    try {
      for (const request of [
        { method: "GET" as const, url: url() },
        { method: "PUT" as const, url: url(NEW_STUDENT) },
        { method: "DELETE" as const, url: url(students.lucia) },
      ])
        assert.equal(
          (await app.inject(request)).statusCode,
          403,
          `${caller.role} ${request.method}`,
        );
    } finally {
      await app.close();
    }
  }
});

test("an admin gets 404 for a class that does not exist", async () => {
  const app = await appFor(context({ role: "admin" }));
  try {
    assert.equal(
      (await app.inject({ method: "GET", url: "/api/classes/nope/enrollments" })).statusCode,
      404,
    );
    assert.equal(
      (await app.inject({ method: "PUT", url: `/api/classes/nope/enrollments/${NEW_STUDENT}` }))
        .statusCode,
      404,
    );
  } finally {
    await app.close();
  }
});
