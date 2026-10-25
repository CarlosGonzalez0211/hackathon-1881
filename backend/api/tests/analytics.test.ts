import assert from "node:assert/strict";
import test from "node:test";
import { athenaDemoIds, type DomainEvent } from "@athena/shared";
import { InMemoryDomainEventStore } from "@athena/platform";
import {
  ProjectedAnalyticsRepository,
  projectClassAnalytics,
  type ClassRoster,
} from "@athena/analytics";

const { students, topics } = athenaDemoIds;
const roster: ClassRoster = {
  classId: athenaDemoIds.class,
  courseId: athenaDemoIds.course,
  students: [
    { id: students.lucia, displayName: "Lucía Torres" },
    { id: students.mateo, displayName: "Mateo Herrera" },
  ],
  topics: [
    { id: topics.fractions, title: "Fractions" },
    { id: topics.geometry, title: "Geometry" },
  ],
};

let n = 0;
const event = (overrides: Partial<DomainEvent>): DomainEvent => ({
  id: `00000000-0000-4000-8000-${String(++n).padStart(12, "e")}`,
  version: 1,
  type: "MasteryUpdated",
  aggregateType: "student_topic_mastery",
  aggregateId: topics.fractions,
  studentId: students.lucia,
  classId: athenaDemoIds.class,
  occurredAt: `2026-10-24T12:00:${String(n).padStart(2, "0")}.000Z`,
  payload: {},
  ...overrides,
});
const mastery = (
  studentId: string,
  topicId: string,
  previous: number,
  next: number,
  misconceptions: { code: string; label: string }[] = [],
) =>
  event({
    studentId,
    aggregateId: topicId,
    payload: { topicId, previous, next, misconceptions },
  });

test("no events: empty but well-formed analytics for the roster", () => {
  const result = projectClassAnalytics(roster, []);
  assert.equal(result.topics.length, 2);
  assert.equal(result.students.length, 2);
  assert.equal(result.interventions.length, 0);
  assert.equal(result.topics[0]!.averageMastery, 0);
});

test("mastery uses the latest value per student and topic; growth is latest minus first", () => {
  const result = projectClassAnalytics(roster, [
    mastery(students.lucia, topics.fractions, 0.2, 0.4),
    mastery(students.lucia, topics.fractions, 0.4, 0.9),
    mastery(students.mateo, topics.fractions, 0.5, 0.7),
  ]);
  const fractions = result.topics.find((t) => t.topicId === topics.fractions)!;
  assert.equal(fractions.averageMastery, 0.8);
  assert.equal(fractions.masteredStudents, 1);
  const lucia = result.students.find((s) => s.studentId === students.lucia)!;
  assert.equal(lucia.growth, 0.7);
  assert.equal(lucia.averageMastery, 0.9);
});

test("struggling students get open interventions with severity by mastery", () => {
  const result = projectClassAnalytics(roster, [
    mastery(students.lucia, topics.geometry, 0.3, 0.2, [{ code: "area-perimeter", label: "Area" }]),
    mastery(students.mateo, topics.geometry, 0.6, 0.45, [
      { code: "area-perimeter", label: "Area" },
    ]),
  ]);
  const bySeverity = Object.fromEntries(result.interventions.map((i) => [i.studentId, i.severity]));
  assert.equal(bySeverity[students.lucia], "high");
  assert.equal(bySeverity[students.mateo], "medium");
  assert.ok(result.interventions.every((i) => i.status === "open"));
  const geometry = result.topics.find((t) => t.topicId === topics.geometry)!;
  assert.equal(geometry.strugglingStudents, 2);
  assert.deepEqual(geometry.commonMisconceptions, [
    { code: "area-perimeter", label: "Area", studentCount: 2 },
  ]);
  assert.equal(result.students.find((s) => s.studentId === students.lucia)!.openInterventions, 1);
});

test("AI usage is counted beside mastery and never changes it", () => {
  const base = [mastery(students.lucia, topics.fractions, 0.2, 0.6)];
  const withUsage = [
    ...base,
    event({ type: "AiUsageRecorded", payload: { kind: "hint" } }),
    event({ type: "AiUsageRecorded", payload: { kind: "hint" } }),
    event({ type: "AiUsageRecorded", payload: { kind: "chat" } }),
  ];
  const a = projectClassAnalytics(roster, base);
  const b = projectClassAnalytics(roster, withUsage);
  assert.equal(b.aiUsage.hint, 2);
  assert.equal(b.aiUsage.chat, 1);
  assert.deepEqual(b.topics, a.topics);
  assert.deepEqual(
    b.students.map((s) => [s.growth, s.averageMastery]),
    a.students.map((s) => [s.growth, s.averageMastery]),
  );
});

test("ignores duplicates, other classes, unknown students/topics and malformed payloads", () => {
  const good = mastery(students.lucia, topics.fractions, 0.2, 0.6);
  const result = projectClassAnalytics(roster, [
    good,
    good,
    { ...mastery(students.lucia, topics.fractions, 0, 0.1), classId: "other-class" },
    mastery(students.diego, topics.fractions, 0, 0.1),
    mastery(students.lucia, topics.statistics, 0, 0.1),
    event({ payload: { nonsense: true } }),
    event({ type: "AiUsageRecorded", payload: { kind: "telepathy" } }),
  ]);
  assert.equal(result.topics.find((t) => t.topicId === topics.fractions)!.averageMastery, 0.6);
  assert.equal(result.interventions.length, 0);
  assert.equal(result.aiUsage.hint, 0);
});

test("replay is order-independent and live events flow through the store", async () => {
  const events = [
    mastery(students.lucia, topics.fractions, 0.2, 0.4),
    mastery(students.lucia, topics.fractions, 0.4, 0.9),
  ];
  assert.deepEqual(
    projectClassAnalytics(roster, events),
    projectClassAnalytics(roster, [...events].reverse()),
  );

  const store = new InMemoryDomainEventStore();
  const repo = new ProjectedAnalyticsRepository(store, async (id) =>
    id === roster.classId ? roster : null,
  );
  assert.equal(await repo.getClassAnalytics("nope"), null);
  assert.equal((await repo.getClassAnalytics(roster.classId))!.interventions.length, 0);
  await store.append(mastery(students.mateo, topics.fractions, 0.5, 0.1));
  const after = (await repo.getClassAnalytics(roster.classId))!;
  assert.equal(after.interventions.length, 1);
  assert.equal(after.interventions[0]!.severity, "high");
});

test("API serves the projection of events appended to the platform store", async () => {
  const { createApp } = await import("../src/app.js");
  const app = await createApp({ logger: false, dataMode: "mock" });
  const url = `/api/analytics/class/${athenaDemoIds.class}`;
  try {
    const before = (await app.inject({ method: "GET", url })).json();
    assert.equal(before.interventions.length, 0);
    assert.equal(before.students.length, 8);
    assert.ok(before.topics.length > 0);

    await app.platform.events.append(mastery(students.diego, topics.geometry, 0.4, 0.15));
    await app.platform.events.append(
      event({ studentId: students.diego, type: "AiUsageRecorded", payload: { kind: "hint" } }),
    );
    const after = (await app.inject({ method: "GET", url })).json();
    assert.equal(after.interventions.length, 1);
    assert.equal(after.interventions[0].studentId, students.diego);
    assert.equal(after.interventions[0].severity, "high");
    assert.equal(after.aiUsage.hint, 1);

    const unknown = await app.inject({ method: "GET", url: "/api/analytics/class/nope" });
    assert.equal(unknown.statusCode, 404);
  } finally {
    await app.close();
  }
});
