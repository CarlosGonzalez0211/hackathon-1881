import assert from "node:assert/strict";
import test from "node:test";
import {
  athenaDemoIds,
  demoClassPlanets,
  demoLuciaPlanet,
  demoLuciaPlanetAfterCheckpoint,
  demoWorldTopics,
  houseEntryResultSchema,
  learningEventIngestResultSchema,
  worldLayoutSchema,
  worldViewSchema,
  type CurriculumTopicSummary,
} from "@athena/shared";
import { WorldService, createMockWorldPorts, worldRoutes } from "@athena/world";
import { installPlatform } from "@athena/platform";
import Fastify from "fastify";

const LUCIA = athenaDemoIds.students.lucia;
const AT = "2026-10-24T15:30:00.000Z";

/** App with the world routes on fresh mock ports the test can also drive directly. */
async function setup(options: { demoControls?: boolean } = {}) {
  const ports = createMockWorldPorts();
  const service = new WorldService({ ports, now: () => AT });
  const app = Fastify({ logger: false });
  installPlatform(app);
  app.setErrorHandler((err: Error & { statusCode?: number }, _req, reply) => {
    const status = err.name === "ZodError" ? 400 : (err.statusCode ?? 500);
    reply.status(status).send({ error: err.message });
  });
  await app.register(worldRoutes, { service, prefix: "/api", ...options });
  return { app, ports, service };
}

const enter = (app: Awaited<ReturnType<typeof setup>>["app"], topicId: string) =>
  app
    .inject({
      method: "POST",
      url: "/api/world/houses/enter",
      payload: { studentId: LUCIA, topicId },
    })
    .then((response) => ({ status: response.statusCode, body: response.json() }));

const statusesOf = (planet: { houses: { topicId: string; status: string }[] }) =>
  Object.fromEntries(planet.houses.map((house) => [house.topicId, house.status]));

test("projection from mock Curriculum + Learning reproduces the demo planets", async () => {
  const { service } = await setup();
  assert.deepEqual(await service.getPlanet(LUCIA), demoLuciaPlanet);
  assert.deepEqual(await service.getClassPlanets(athenaDemoIds.class), demoClassPlanets);
});

test("slot is the topic order; unpublished topics are absent; overflow goes to the 2D list", async () => {
  const { ports, service } = await setup();
  const extra = (id: string, order: number, published = true): CurriculumTopicSummary => ({
    id,
    courseId: athenaDemoIds.course,
    title: `Tema ${order}`,
    order,
    prerequisiteTopicIds: [],
    masteryThreshold: 0.8,
    published,
  });
  ports.curriculum.upsert(extra("topic-extra", 6));
  ports.curriculum.upsert(extra("topic-draft", 7, false));
  const world = worldViewSchema.parse(await service.getWorld(LUCIA));
  assert.deepEqual(
    world.planet.houses.map((house) => [house.slot, house.topicId]),
    demoWorldTopics.map((topic) => [topic.order, topic.id]),
  );
  assert.deepEqual(
    world.overflowTopics.map((house) => [house.slot, house.topicId, house.status]),
    [[6, "topic-extra", "available"]],
  );
  assert.ok(!JSON.stringify(world).includes("topic-draft"));
});

test("house entry: granted modes, locked with prerequisites, unpublished and unknown", async () => {
  const { app, ports } = await setup();
  const fractions = houseEntryResultSchema.parse(
    (await enter(app, athenaDemoIds.topics.fractions)).body,
  );
  assert.equal(fractions.granted && fractions.mode, "review");
  const geometry = houseEntryResultSchema.parse(
    (await enter(app, athenaDemoIds.topics.geometry)).body,
  );
  assert.ok(geometry.granted);
  assert.equal(geometry.mode, "resume");
  assert.equal(geometry.mastery?.nextAction, "Practicar el área de triángulos");
  const functions = houseEntryResultSchema.parse(
    (await enter(app, athenaDemoIds.topics.functions)).body,
  );
  assert.equal(functions.granted && functions.mode, "enter");

  const statistics = houseEntryResultSchema.parse(
    (await enter(app, athenaDemoIds.topics.statistics)).body,
  );
  assert.equal(statistics.granted, false);
  assert.ok(!statistics.granted);
  assert.equal(statistics.reason, "locked");
  assert.deepEqual(statistics.missingPrerequisites, [
    {
      topicId: athenaDemoIds.topics.geometry,
      title: "Geometría",
      status: "in_progress",
      slot: 1,
    },
  ]);

  ports.curriculum.upsert({ ...demoWorldTopics[2]!, published: false });
  const hidden = houseEntryResultSchema.parse(
    (await enter(app, athenaDemoIds.topics.functions)).body,
  );
  assert.equal(!hidden.granted && hidden.reason, "not_published");
  assert.equal((await enter(app, "topic-nope")).status, 404);
  const stranger = await app.inject({
    method: "POST",
    url: "/api/world/houses/enter",
    payload: { studentId: "nobody", topicId: athenaDemoIds.topics.geometry },
  });
  assert.equal(stranger.statusCode, 404);
  assert.equal(
    (await app.inject({ method: "POST", url: "/api/world/houses/enter", payload: {} })).statusCode,
    400,
  );
});

test("entering houses and cosmetic interactions are never evidence", async () => {
  const { app, ports, service } = await setup();
  const before = await service.getPlanet(LUCIA);
  for (const topicId of [
    athenaDemoIds.topics.geometry,
    athenaDemoIds.topics.geometry,
    athenaDemoIds.topics.functions,
  ])
    await enter(app, topicId);
  await app.inject({
    method: "POST",
    url: "/api/world/interactions",
    payload: { studentId: LUCIA, kind: "npc_talked", targetId: "lumen", at: AT },
  });
  await app.inject({
    method: "POST",
    url: "/api/easter-eggs/hidden-pi/discover",
    payload: { studentId: LUCIA },
  });
  assert.deepEqual(await service.getPlanet(LUCIA), before);
  const snapshot = await ports.mastery.getStudentMastery(LUCIA, [athenaDemoIds.topics.geometry]);
  assert.equal(snapshot.topics[0]?.mastery, 0.4);
});

test("state machine: in_progress -> done unlocks the dependent house, with transitions", async () => {
  const { app, ports, service } = await setup();
  await service.getWorld(LUCIA); // baseline: what Lucía has seen

  ports.mastery.set(LUCIA, [{ topicId: athenaDemoIds.topics.geometry, mastery: 0.6 }], 0.35);
  const checkpoint = learningEventIngestResultSchema.parse(
    (
      await app.inject({
        method: "POST",
        url: "/api/world/events",
        payload: {
          id: "evt-m-1",
          type: "MasteryUpdated",
          studentId: LUCIA,
          topicId: athenaDemoIds.topics.geometry,
          mastery: 0.6,
          previousMastery: 0.4,
          evidenceIds: ["attempt-1"],
          occurredAt: AT,
        },
      })
    ).json(),
  );
  assert.deepEqual(checkpoint.transitions, []); // still in progress, only progress moved
  assert.deepEqual(await service.getPlanet(LUCIA), demoLuciaPlanetAfterCheckpoint);

  ports.mastery.set(LUCIA, [{ topicId: athenaDemoIds.topics.geometry, mastery: 0.85 }]);
  const masteredEvent = {
    id: "evt-m-2",
    type: "MasteryUpdated",
    studentId: LUCIA,
    topicId: athenaDemoIds.topics.geometry,
    mastery: 0.85,
    previousMastery: 0.6,
    evidenceIds: ["attempt-2"],
    occurredAt: AT,
  };
  const mastered = learningEventIngestResultSchema.parse(
    (await app.inject({ method: "POST", url: "/api/world/events", payload: masteredEvent })).json(),
  );
  assert.deepEqual(
    mastered.transitions.map((item) => [item.topicId, item.from, item.to, item.causeEventId]),
    [
      [athenaDemoIds.topics.geometry, "in_progress", "done", "evt-m-2"],
      // Estadística needed Geometría: it unlocks in the same projection, without its own event.
      [athenaDemoIds.topics.statistics, "locked", "available", undefined],
    ],
  );
  assert.deepEqual(
    mastered.unlockedAchievements.map((item) => item.code),
    ["geometry-builder"],
  );
  const world = worldViewSchema.parse(await service.getWorld(LUCIA));
  assert.equal(statusesOf(world.planet)[athenaDemoIds.topics.statistics], "available");
  assert.deepEqual(
    world.pendingTransitions.map((item) => [item.topicId, item.from, item.to]),
    [
      [athenaDemoIds.topics.geometry, "in_progress", "done"],
      [athenaDemoIds.topics.statistics, "locked", "available"],
    ],
  );

  // A duplicate event neither unlocks again nor queues a duplicate transition.
  const duplicate = learningEventIngestResultSchema.parse(
    (await app.inject({ method: "POST", url: "/api/world/events", payload: masteredEvent })).json(),
  );
  assert.deepEqual(duplicate, { unlockedAchievements: [], transitions: [] });

  // Acknowledging transitions clears the queue so a reload never replays them.
  for (const transition of world.pendingTransitions)
    await app.inject({
      method: "POST",
      url: "/api/world/interactions",
      payload: { studentId: LUCIA, kind: "transition_seen", targetId: transition.id, at: AT },
    });
  assert.deepEqual((await service.getWorld(LUCIA)).pendingTransitions, []);
});

test("houses with evidence never re-lock when the professor adds a prerequisite", async () => {
  const { ports, service } = await setup();
  ports.curriculum.upsert({
    ...demoWorldTopics[1]!,
    prerequisiteTopicIds: [athenaDemoIds.topics.fractions, athenaDemoIds.topics.criticalThinking],
  });
  ports.curriculum.upsert({
    ...demoWorldTopics[0]!,
    prerequisiteTopicIds: [athenaDemoIds.topics.criticalThinking],
  });
  const statuses = statusesOf(await service.getPlanet(LUCIA));
  assert.equal(statuses[athenaDemoIds.topics.geometry], "in_progress");
  assert.equal(statuses[athenaDemoIds.topics.fractions], "done");
});

test("world layout shows where each published topic lands", async () => {
  const { app } = await setup();
  const response = await app.inject({
    method: "GET",
    url: `/api/courses/${athenaDemoIds.course}/world-layout`,
  });
  assert.equal(response.statusCode, 200);
  const layout = worldLayoutSchema.parse(response.json());
  assert.equal(layout.slots.length, 6);
  assert.deepEqual(layout.slots[3], {
    slot: 3,
    topicId: athenaDemoIds.topics.statistics,
    title: "Estadística",
  });
  assert.deepEqual(layout.overflow, []);
  assert.equal(
    (await app.inject({ method: "GET", url: "/api/courses/course-x/world-layout" })).statusCode,
    404,
  );
});

test("presenter demo steps replay Learning deterministically and reset", async () => {
  const { app, service } = await setup({ demoControls: true });
  const step = () => app.inject({ method: "POST", url: "/api/demo/world/step", payload: {} });
  assert.deepEqual((await step()).json(), { step: "SECOND_CHECKPOINT_PASSED", remaining: 1 });
  assert.deepEqual(await service.getPlanet(LUCIA), demoLuciaPlanetAfterCheckpoint);
  assert.deepEqual(
    (await service.listAchievements(LUCIA)).map((item) => item.code),
    ["first-insight"],
  );
  assert.deepEqual((await step()).json(), { step: "GEOMETRY_MASTERED", remaining: 0 });
  assert.equal(
    statusesOf(await service.getPlanet(LUCIA))[athenaDemoIds.topics.statistics],
    "available",
  );
  assert.deepEqual((await step()).json(), { step: null, remaining: 0 });
});

test("presenter routes do not exist when demo controls are off", async () => {
  const { app } = await setup({ demoControls: false });
  const response = await app.inject({ method: "POST", url: "/api/demo/world/step", payload: {} });
  assert.equal(response.statusCode, 404);
});
