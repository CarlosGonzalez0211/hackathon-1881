import assert from "node:assert/strict";
import test from "node:test";
import { athenaDemoIds, DEMO_CLASS_ID, DEMO_STUDENT_ID, type AuthContext } from "@athena/shared";
import {
  RoleAuthorizationService,
  createPlatformServices,
  installPlatform,
} from "@athena/platform";
import { WorldService, createMockWorldPorts, worldRoutes, type WorldPorts } from "@athena/world";
import Fastify from "fastify";
import { createApp } from "../src/app.js";

const LUCIA = DEMO_STUDENT_ID;
const MATEO = athenaDemoIds.students.mateo;

const context = (overrides: Partial<AuthContext>): AuthContext => ({
  userId: "u",
  displayName: "U",
  role: "student",
  classIds: [],
  courseIds: [],
  studentIds: [],
  ...overrides,
});

const callers = {
  student: context({
    classIds: [DEMO_CLASS_ID],
    courseIds: [athenaDemoIds.course],
    studentIds: [LUCIA],
  }),
  professor: context({
    role: "professor",
    classIds: [DEMO_CLASS_ID],
    courseIds: [athenaDemoIds.course],
    studentIds: [LUCIA, MATEO],
  }),
  outsider: context({ role: "professor", classIds: ["some-other-class"] }),
  admin: context({ role: "admin" }),
};
type Caller = keyof typeof callers;

/** One app (so state carries over) whose caller the test can switch between requests. */
async function withApp(
  run: (app: Awaited<ReturnType<typeof createApp>>, as: (caller: Caller) => void) => Promise<void>,
) {
  let current: Caller = "admin";
  const app = await createApp({
    logger: false,
    dataMode: "mock",
    platform: {
      auth: { authenticate: async () => callers[current] },
      authorization: new RoleAuthorizationService(),
    },
  });
  try {
    await run(app, (caller) => (current = caller));
  } finally {
    await app.close();
  }
}

test("students read only their own world", () =>
  withApp(async (app, as) => {
    as("student");
    const get = async (url: string) =>
      (await app.inject({ method: "GET", url: `/api${url}` })).statusCode;
    assert.equal(await get(`/planet/${LUCIA}`), 200);
    assert.equal(await get(`/world/${LUCIA}`), 200);
    assert.equal(await get(`/students/${LUCIA}/quests`), 200);
    for (const url of [
      `/planet/${MATEO}`,
      `/world/${MATEO}`,
      `/students/${MATEO}/achievements`,
      `/students/${MATEO}/quests`,
      // Listing the class would expose every classmate's mastery.
      `/class/${DEMO_CLASS_ID}/planets`,
    ])
      assert.equal(await get(url), 403, url);
  }));

test("professors read their class; a professor of another class is refused", () =>
  withApp(async (app, as) => {
    const get = async (url: string) =>
      (await app.inject({ method: "GET", url: `/api${url}` })).statusCode;
    as("professor");
    assert.equal(await get(`/class/${DEMO_CLASS_ID}/planets`), 200);
    assert.equal(await get(`/planet/${LUCIA}`), 200);
    assert.equal(await get(`/courses/${athenaDemoIds.course}/world-layout`), 200);
    as("outsider");
    for (const url of [
      `/class/${DEMO_CLASS_ID}/planets`,
      `/planet/${LUCIA}`,
      `/courses/${athenaDemoIds.course}/world-layout`,
    ])
      assert.equal(await get(url), 403, url);
  }));

test("writes only happen as the student themself", () =>
  withApp(async (app, as) => {
    const post = async (url: string, payload: object) =>
      (await app.inject({ method: "POST", url: `/api${url}`, payload })).statusCode;
    const writes = (studentId: string): [string, object][] => [
      ["/world/interactions", { studentId }],
      ["/world/houses/enter", { studentId }],
      ["/easter-eggs/hidden-pi/discover", { studentId }],
    ];
    as("student");
    for (const [url, body] of writes(MATEO)) assert.equal(await post(url, body), 403, url);
    // Own student passes the guard; the body is then judged by the service, not refused.
    for (const [url, body] of writes(LUCIA)) assert.notEqual(await post(url, body), 403, url);
    // A professor reads a student's world but cannot act for them.
    as("professor");
    for (const [url, body] of writes(LUCIA)) assert.equal(await post(url, body), 403, url);
  }));

test("the Learning event sink and demo controls are admin only", () =>
  withApp(async (app, as) => {
    const post = async (url: string) =>
      (await app.inject({ method: "POST", url: `/api${url}`, payload: {} })).statusCode;
    for (const caller of ["student", "professor"] as const) {
      as(caller);
      for (const url of ["/world/events", "/demo/world/step", "/demo/world/reset"])
        assert.equal(await post(url), 403, `${caller} ${url}`);
    }
    as("admin");
    // Past the guard, an empty event fails validation (400) instead of being refused.
    assert.equal(await post("/world/events"), 400);
    assert.equal(await post("/demo/world/reset"), 204);
  }));

test("teams are scoped to the class", () =>
  withApp(async (app, as) => {
    const body = {
      classId: DEMO_CLASS_ID,
      name: "Alpha",
      createdBy: LUCIA,
      memberIds: [LUCIA, MATEO],
    };
    const send = (method: "GET" | "POST", url: string, payload?: object) =>
      app.inject({ method, url: `/api${url}`, ...(payload ? { payload } : {}) });

    as("outsider");
    assert.equal((await send("POST", "/teams", body)).statusCode, 403);

    as("professor");
    const created = await send("POST", "/teams", body);
    assert.equal(created.statusCode, 201);
    const teamId = created.json().id as string;
    const challenge = { topicId: "t", title: "Sprint" };
    assert.equal((await send("POST", `/teams/${teamId}/challenges`, challenge)).statusCode, 201);

    as("outsider");
    assert.equal((await send("GET", `/teams/${teamId}`)).statusCode, 403);

    as("student");
    assert.equal((await send("GET", `/teams/${teamId}`)).statusCode, 200);
    // Students neither create challenges nor form a team in someone else's name.
    assert.equal((await send("POST", `/teams/${teamId}/challenges`, challenge)).statusCode, 403);
    assert.equal((await send("POST", "/teams", { ...body, createdBy: MATEO })).statusCode, 403);
  }));

test("students enrolled outside the demo class are accepted, and dropped ones refused", async () => {
  const enrolled = new Map([["stu-real", "class-real"]]);
  const ports: WorldPorts = {
    ...createMockWorldPorts(),
    enrollment: {
      getEnrollment: async (studentId) => {
        const classId = enrolled.get(studentId);
        return classId ? { studentId, classId, courseId: "course-real" } : null;
      },
      listStudents: async (classId) =>
        [...enrolled].filter(([, id]) => id === classId).map(([studentId]) => studentId),
    },
  };
  const app = Fastify({ logger: false });
  installPlatform(app, {
    ...createPlatformServices(),
    auth: { authenticate: async () => callers.admin },
    authorization: new RoleAuthorizationService(),
  });
  app.setErrorHandler((err: Error & { statusCode?: number }, _req, reply) => {
    reply.status(err.statusCode ?? 500).send({ error: err.message });
  });
  await app.register(worldRoutes, { service: new WorldService({ ports }), prefix: "/api" });
  try {
    const quests = () => app.inject({ method: "GET", url: "/api/students/stu-real/quests" });
    assert.equal((await quests()).statusCode, 200);
    enrolled.delete("stu-real");
    assert.equal((await quests()).statusCode, 404);
  } finally {
    await app.close();
  }
});
