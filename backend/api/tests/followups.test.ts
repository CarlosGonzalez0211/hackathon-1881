import assert from "node:assert/strict";
import test from "node:test";
import { athenaDemoIds, type AuthContext } from "@athena/shared";
import { RoleAuthorizationService } from "@athena/platform";
import { createApp } from "../src/app.js";
import { fetchAll } from "../src/supabase-paging.js";

const { students, topics } = athenaDemoIds;
let n = 0;
const mastery = (studentId: string, topicId: string, previous: number, next: number) => ({
  id: `00000000-0000-4000-8000-${String(++n).padStart(12, "f")}`,
  version: 1,
  type: "MasteryUpdated",
  aggregateType: "student_topic_mastery",
  aggregateId: topicId,
  studentId,
  classId: athenaDemoIds.class,
  occurredAt: `2026-10-24T13:00:${String(n).padStart(2, "0")}.000Z`,
  payload: { topicId, previous, next, misconceptions: [] },
});

test("a resolved intervention reopens when the student gets worse, not before", async () => {
  const app = await createApp({ logger: false, dataMode: "mock" });
  const base = `/api/analytics/class/${athenaDemoIds.class}`;
  const id = `${students.diego}:${topics.geometry}`;
  const interventionStatus = async () =>
    (await app.inject({ method: "GET", url: base })).json().interventions[0]?.status;
  try {
    await app.platform.events.append(mastery(students.diego, topics.geometry, 0.6, 0.45));
    const resolved = await app.inject({
      method: "PATCH",
      url: `${base}/interventions/${encodeURIComponent(id)}`,
      payload: { status: "resolved" },
    });
    assert.equal(resolved.json().severity, "medium");
    assert.equal(await interventionStatus(), "resolved");

    // Slightly worse but same severity: the decision holds.
    await app.platform.events.append(mastery(students.diego, topics.geometry, 0.45, 0.4));
    assert.equal(await interventionStatus(), "resolved");

    // Drops into high severity: the intervention reopens.
    await app.platform.events.append(mastery(students.diego, topics.geometry, 0.4, 0.1));
    const analytics = (await app.inject({ method: "GET", url: base })).json();
    assert.equal(analytics.interventions[0].severity, "high");
    assert.equal(analytics.interventions[0].status, "open");
    const diego = analytics.students.find(
      (s: { studentId: string }) => s.studentId === students.diego,
    );
    assert.equal(diego.openInterventions, 1);
  } finally {
    await app.close();
  }
});

const context = (overrides: Partial<AuthContext>): AuthContext => ({
  userId: "u",
  displayName: "U",
  role: "professor",
  classIds: [],
  courseIds: [],
  studentIds: [],
  ...overrides,
});

test("GET /classes lists only the caller's classes", async () => {
  const forContext = async (ctx: AuthContext) => {
    const app = await createApp({
      logger: false,
      dataMode: "mock",
      platform: {
        auth: { authenticate: async () => ctx },
        authorization: new RoleAuthorizationService(),
      },
    });
    try {
      const res = await app.inject({ method: "GET", url: "/api/classes" });
      assert.equal(res.statusCode, 200);
      return res.json() as { id: string; title: string }[];
    } finally {
      await app.close();
    }
  };
  const mine = await forContext(context({ classIds: [athenaDemoIds.class] }));
  assert.deepEqual(
    mine.map((item) => item.id),
    [athenaDemoIds.class],
  );
  assert.equal((await forContext(context({ classIds: ["some-other-class"] }))).length, 0);
  assert.equal((await forContext(context({ role: "student", classIds: [] }))).length, 0);
  assert.equal((await forContext(context({ role: "admin" }))).length, 1);
});

test("fetchAll reads every page and stops on a short page", async () => {
  const rows = Array.from({ length: 2500 }, (_, i) => i);
  const calls: [number, number][] = [];
  const all = await fetchAll<number>(async (from, to) => {
    calls.push([from, to]);
    return { data: rows.slice(from, to + 1), error: null };
  }, 1000);
  assert.equal(all.length, 2500);
  assert.deepEqual(calls, [
    [0, 999],
    [1000, 1999],
    [2000, 2999],
  ]);

  const exact = await fetchAll<number>(
    async (from, to) => ({
      data: rows.slice(0, 2000).slice(from, to + 1),
      error: null,
    }),
    1000,
  );
  assert.equal(exact.length, 2000);

  await assert.rejects(
    fetchAll<number>(async () => ({ data: null, error: { message: "boom" } })),
    /boom/,
  );
});
