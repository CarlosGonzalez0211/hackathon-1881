import assert from "node:assert/strict";
import test from "node:test";
import {
  WORLD_HOUSE_SLOT_COUNT,
  buildWorldLayout,
  curriculumEventSchema,
  curriculumTopicSummarySchema,
  demoClassMastery,
  demoClassPlanets,
  demoCurriculumTopics,
  demoHouseContent,
  demoLearningScenario,
  demoWorldTopics,
  athenaDemoIds,
  diffHouses,
  houseContentSchema,
  houseEntryMode,
  houseEntryResultSchema,
  learningEventSchema,
  projectPlanet,
  studentMasterySnapshotSchema,
  worldInteractionSchema,
} from "../src/index.js";

test("contract fixtures parse with their schemas", () => {
  for (const topic of demoCurriculumTopics) curriculumTopicSummarySchema.parse(topic);
  assert.equal(demoCurriculumTopics.length, WORLD_HOUSE_SLOT_COUNT);
  for (const topic of demoCurriculumTopics)
    assert.ok(houseContentSchema.parse(demoHouseContent[topic.id]), topic.id);
  for (const snapshot of demoClassMastery) studentMasterySnapshotSchema.parse(snapshot);
  for (const step of demoLearningScenario)
    for (const event of step.events) learningEventSchema.parse(event);
  curriculumEventSchema.parse({
    id: "evt-pub",
    type: "TopicPublished",
    courseId: "course-math-1",
    topicId: "topic-geometry",
    occurredAt: "2026-10-24T15:00:00.000Z",
  });
  worldInteractionSchema.parse({
    studentId: "student-lucia",
    kind: "transition_seen",
    targetId: "transition-1",
    at: "2026-10-24T15:00:00.000Z",
  });
});

test("prerequisite graph has no cycles and references only demo topics", () => {
  const ids = new Set(demoCurriculumTopics.map((topic) => topic.id));
  const byId = new Map(demoCurriculumTopics.map((topic) => [topic.id, topic]));
  const visit = (id: string, path: string[]): void => {
    assert.ok(!path.includes(id), `cycle ${[...path, id].join(" -> ")}`);
    for (const next of byId.get(id)!.prerequisiteTopicIds) {
      assert.ok(ids.has(next), next);
      visit(next, [...path, id]);
    }
  };
  for (const id of ids) visit(id, []);
});

test("the pure projection reproduces every demo planet", () => {
  for (const planet of demoClassPlanets) {
    const mastery = demoClassMastery.find((item) => item.studentId === planet.studentId)!;
    const { planet: projected, overflowTopics } = projectPlanet({
      studentId: planet.studentId,
      topics: demoWorldTopics,
      mastery,
    });
    assert.deepEqual(projected, planet, planet.studentId);
    assert.deepEqual(overflowTopics, []);
  }
});

test("growth falls back to mean house progress when Learning gives none", () => {
  const { planet } = projectPlanet({
    studentId: "s",
    topics: demoWorldTopics,
    mastery: {
      studentId: "s",
      topics: [{ topicId: athenaDemoIds.topics.fractions, mastery: 0.6 }],
    },
  });
  assert.equal(planet.growth, 0.1);
});

test("entry modes, diffs and layout", () => {
  assert.equal(houseEntryMode("available"), "enter");
  assert.equal(houseEntryMode("in_progress"), "resume");
  assert.equal(houseEntryMode("done"), "review");
  assert.equal(houseEntryMode("locked"), undefined);
  const house = { topicId: "t", title: "T", slot: 0, progress: 0 };
  assert.deepEqual(
    diffHouses([{ ...house, status: "locked" }], [{ ...house, status: "available" }]).map(
      (item) => item.from,
    ),
    ["locked"],
  );
  assert.deepEqual(diffHouses([], [{ ...house, status: "available" }])[0]?.from, "absent");
  assert.deepEqual(diffHouses([{ ...house, status: "done" }], [{ ...house, status: "done" }]), []);
  const layout = buildWorldLayout(athenaDemoIds.course, demoWorldTopics);
  assert.equal(layout.slots.filter((slot) => slot.topicId).length, 6);
  assert.throws(() =>
    houseEntryResultSchema.parse({ granted: true, mode: "review", entryId: "e" }),
  );
});
