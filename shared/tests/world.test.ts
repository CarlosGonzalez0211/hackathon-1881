import assert from "node:assert/strict";
import test from "node:test";
import {
  achievementCatalogue,
  achievementCodeSchema,
  achievementDefinitionSchema,
  achievementSchema,
  createTeamRequestSchema,
  demoCheckpointEvents,
  demoClassPlanets,
  demoEasterEggs,
  demoFirstInsightAchievement,
  demoLuciaPlanet,
  demoLuciaPlanetAfterCheckpoint,
  demoLuciaQuests,
  demoLuciaWorldAfterCheckpoint,
  demoRoster,
  demoRosterSchema,
  easterEggSchema,
  learningEventSchema,
  planetStateSchema,
  questStateSchema,
  worldInteractionSchema,
  worldStateSchema,
} from "../src/index.js";

test("world fixtures parse with the shared schemas", () => {
  assert.deepEqual(demoRosterSchema.parse(demoRoster), demoRoster);
  assert.equal(demoRoster.name, "Matemáticas I – Grupo A");
  assert.equal(demoRoster.professor.displayName, "Prof. Elena Ruiz");
  assert.equal(demoRoster.students[0]?.displayName, "Lucía Torres");
  assert.equal(demoClassPlanets.length, 8);
  for (const planet of [...demoClassPlanets, demoLuciaPlanetAfterCheckpoint])
    assert.deepEqual(planetStateSchema.parse(planet), planet);
  assert.deepEqual(
    demoClassPlanets.map((planet) => planet.studentId),
    demoRoster.students.map((student) => student.id),
  );
  for (const quest of demoLuciaQuests) questStateSchema.parse(quest);
  for (const egg of demoEasterEggs) easterEggSchema.parse(egg);
  for (const event of demoCheckpointEvents) learningEventSchema.parse(event);
  achievementSchema.parse(demoFirstInsightAchievement);
  assert.deepEqual(
    worldStateSchema.parse(demoLuciaWorldAfterCheckpoint),
    demoLuciaWorldAfterCheckpoint,
  );
});

test("Lucía's planet matches the demo progression by slot", () => {
  const bySlot = (planet: typeof demoLuciaPlanet) =>
    planet.houses.map(({ slot, title, status, progress }) => [slot, title, status, progress]);
  assert.deepEqual(bySlot(demoLuciaPlanet), [
    [0, "Fracciones", "done", 1],
    [1, "Geometría", "in_progress", 0.4],
    [2, "Funciones", "available", 0],
    [3, "Estadística", "locked", 0],
    [4, "Probabilidad", "locked", 0],
    [5, "Pensamiento crítico", "locked", 0],
  ]);
  assert.equal(demoLuciaPlanet.growth, 0.31);
  assert.equal(demoLuciaPlanetAfterCheckpoint.growth, 0.35);
  assert.equal(demoLuciaPlanetAfterCheckpoint.houses[1]?.progress, 0.6);
  assert.equal(demoLuciaPlanetAfterCheckpoint.houses[1]?.status, "in_progress");
  assert.deepEqual(
    demoLuciaWorldAfterCheckpoint.achievements.map((item) => item.code),
    ["first-insight"],
  );
});

test("every planet uses unique slots and one developer identity", () => {
  for (const planet of demoClassPlanets) {
    const slots = planet.houses.map((house) => house.slot);
    assert.equal(new Set(slots).size, slots.length);
  }
  assert.equal(new Set(demoClassPlanets.map((planet) => JSON.stringify(planet.theme))).size, 1);
  assert.equal(new Set(demoClassPlanets.map((planet) => planet.growth)).size, 8);
});

test("achievement catalogue matches the six codes with badge icons", () => {
  assert.deepEqual(
    achievementCatalogue.map((definition) => definition.code),
    achievementCodeSchema.options,
  );
  for (const definition of achievementCatalogue) {
    achievementDefinitionSchema.parse(definition);
    assert.equal(definition.icon, `badge-${definition.code}`);
  }
  const firstInsight = achievementCatalogue.find((item) => item.code === "first-insight");
  assert.equal(firstInsight?.celebrationId, "insight-lantern");
  assert.equal(firstInsight?.shortLabel.es, "Primera luz");
  assert.equal(
    achievementDefinitionSchema.safeParse({ ...firstInsight, icon: "badge-team-spark" }).success,
    false,
  );
});

test("world requests reject invalid shapes", () => {
  assert.equal(
    worldInteractionSchema.safeParse({
      studentId: "s",
      kind: "accessibility_changed",
      at: "2026-10-24T00:00:00.000Z",
    }).success,
    false,
  );
  assert.equal(
    createTeamRequestSchema.safeParse({
      classId: "c",
      name: "Equipo",
      createdBy: "outsider",
      memberIds: ["a", "b"],
    }).success,
    false,
  );
  assert.equal(
    learningEventSchema.safeParse({ ...demoCheckpointEvents[1], mastery: 1.5 }).success,
    false,
  );
});
