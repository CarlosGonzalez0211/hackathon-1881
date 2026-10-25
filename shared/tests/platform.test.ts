import assert from "node:assert/strict";
import test from "node:test";
import { athenaDemoIds, demoClassAnalytics, domainEventSchema, uuidSchema } from "@athena/shared";

test("demo ids are unique UUIDs, so mock mode matches Postgres uuid columns", () => {
  const ids = [
    athenaDemoIds.professorRuiz,
    athenaDemoIds.course,
    athenaDemoIds.class,
    ...Object.values(athenaDemoIds.students),
    ...Object.values(athenaDemoIds.topics),
  ];
  for (const id of ids) assert.ok(uuidSchema.safeParse(id).success, id);
  assert.equal(new Set(ids).size, ids.length);
});

test("domain events default to version 1 and reject unknown types", () => {
  const base = {
    id: "00000000-0000-4000-8000-0000000000e1",
    type: "MasteryUpdated",
    aggregateType: "student_topic_mastery",
    aggregateId: athenaDemoIds.topics.geometry,
    occurredAt: "2026-10-24T12:00:00.000Z",
    payload: {},
  };
  assert.equal(domainEventSchema.parse(base).version, 1);
  assert.equal(domainEventSchema.safeParse({ ...base, type: "Nope" }).success, false);
});

test("opening-state analytics fixture is valid", () => {
  assert.equal(demoClassAnalytics.classId, athenaDemoIds.class);
});
