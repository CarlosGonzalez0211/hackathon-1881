import assert from "node:assert/strict";
import test from "node:test";
import {
  aiEventSchema,
  classSummarySchema,
  houseStateSchema,
  mockClassPlanets,
  mockPlanet,
  mockSummary,
  planetStateSchema,
} from "../src/index.js";

test("all eight fixture planets validate and share one developer identity", () => {
  assert.equal(mockClassPlanets.length, 8);
  for (const planet of mockClassPlanets) assert.deepEqual(planetStateSchema.parse(planet), planet);
  assert.equal(new Set(mockClassPlanets.map((planet) => planet.studentId)).size, 8);
  assert.equal(new Set(mockClassPlanets.map((planet) => JSON.stringify(planet.theme))).size, 1);
  assert.deepEqual(classSummarySchema.parse(mockSummary), mockSummary);
  assert.equal(mockSummary.aiUsage.chat, 0);
});
test("invalid growth, progress and duplicate house slots are rejected", () => {
  assert.equal(planetStateSchema.safeParse({ ...mockPlanet, growth: 2 }).success, false);
  assert.equal(
    houseStateSchema.safeParse({ ...mockPlanet.houses[0], progress: -0.1 }).success,
    false,
  );
  assert.equal(
    planetStateSchema.safeParse({
      ...mockPlanet,
      houses: [mockPlanet.houses[0], mockPlanet.houses[0]],
    }).success,
    false,
  );
});
test("AI events require known kinds and an ISO timestamp", () => {
  assert.equal(
    aiEventSchema.safeParse({ studentId: "s", topicId: "t", kind: "click", at: "today", meta: {} })
      .success,
    false,
  );
  assert.equal(
    aiEventSchema.safeParse({
      studentId: "s",
      topicId: "t",
      kind: "hint",
      at: "2026-10-24T00:00:00.000Z",
      meta: {},
    }).success,
    true,
  );
});
