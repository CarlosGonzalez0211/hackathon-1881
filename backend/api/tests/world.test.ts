import assert from "node:assert/strict";
import test from "node:test";
import {
  achievementSchema,
  demoCheckpointEvents,
  demoClassPlanets,
  demoLuciaPlanet,
  easterEggDiscoveryResultSchema,
  planetStateSchema,
  questStateSchema,
  teamChallengeAttemptResultSchema,
  teamChallengeSchema,
  teamStateSchema,
  worldInteractionResultSchema,
  worldStateSchema,
} from "@athena/shared";
import { WorldService, worldRoutes } from "@athena/world";
import Fastify from "fastify";
import { createApp } from "../src/app.js";

const LUCIA = "student-lucia";
const AT = "2026-10-24T15:10:00.000Z";

async function withApp(run: (app: Awaited<ReturnType<typeof createApp>>) => Promise<void>) {
  const app = await createApp({ logger: false });
  try {
    await run(app);
  } finally {
    await app.close();
  }
}

test("planet and class routes return the seeded demo fixtures", () =>
  withApp(async (app) => {
    const planet = await app.inject({ method: "GET", url: `/api/planet/${LUCIA}` });
    assert.equal(planet.statusCode, 200);
    assert.deepEqual(planetStateSchema.parse(planet.json()), demoLuciaPlanet);

    const planets = await app.inject({ method: "GET", url: "/api/class/class-demo/planets" });
    assert.equal(planets.statusCode, 200);
    assert.deepEqual(planetStateSchema.array().parse(planets.json()), demoClassPlanets);

    assert.equal((await app.inject({ method: "GET", url: "/api/planet/nobody" })).statusCode, 404);
    assert.equal(
      (await app.inject({ method: "GET", url: "/api/class/nope/planets" })).statusCode,
      404,
    );
  }));

test("world, achievements and quests read models", () =>
  withApp(async (app) => {
    const world = await app.inject({ method: "GET", url: `/api/world/${LUCIA}` });
    assert.equal(world.statusCode, 200);
    const state = worldStateSchema.parse(world.json());
    assert.equal(state.accessibility.locale, "es");
    assert.deepEqual(state.achievements, []);

    const achievements = await app.inject({
      method: "GET",
      url: `/api/students/${LUCIA}/achievements`,
    });
    assert.equal(achievements.statusCode, 200);
    assert.deepEqual(achievementSchema.array().parse(achievements.json()), []);

    const quests = await app.inject({ method: "GET", url: `/api/students/${LUCIA}/quests` });
    assert.equal(quests.statusCode, 200);
    assert.ok(questStateSchema.array().parse(quests.json()).length > 0);

    for (const url of [
      "/api/world/nobody",
      "/api/students/nobody/achievements",
      "/api/students/nobody/quests",
    ])
      assert.equal((await app.inject({ method: "GET", url })).statusCode, 404, url);
  }));

test("world interactions update cosmetic settings and validate input", () =>
  withApp(async (app) => {
    const ok = await app.inject({
      method: "POST",
      url: "/api/world/interactions",
      payload: {
        studentId: LUCIA,
        kind: "accessibility_changed",
        accessibility: { reducedMotion: true, locale: "en" },
        at: AT,
      },
    });
    assert.equal(ok.statusCode, 201);
    const result = worldInteractionResultSchema.parse(ok.json());
    assert.equal(result.world.accessibility.reducedMotion, true);
    assert.equal(result.world.accessibility.locale, "en");
    assert.deepEqual(result.world.planet, demoLuciaPlanet);

    const invalid = await app.inject({
      method: "POST",
      url: "/api/world/interactions",
      payload: { studentId: LUCIA, kind: "teleport", at: AT },
    });
    assert.equal(invalid.statusCode, 400);
    const unknown = await app.inject({
      method: "POST",
      url: "/api/world/interactions",
      payload: { studentId: "nobody", kind: "npc_talked", at: AT },
    });
    assert.equal(unknown.statusCode, 404);
  }));

test("Easter egg discovery is idempotent and never touches planet state", () =>
  withApp(async (app) => {
    const before = (await app.inject({ method: "GET", url: `/api/planet/${LUCIA}` })).json();
    const discover = () =>
      app.inject({
        method: "POST",
        url: "/api/easter-eggs/hidden-pi/discover",
        payload: { studentId: LUCIA },
      });

    const first = easterEggDiscoveryResultSchema.parse((await discover()).json());
    assert.equal(first.firstDiscovery, true);
    assert.deepEqual(
      first.unlockedAchievements.map((item) => item.code),
      ["world-explorer"],
    );
    const second = await discover();
    assert.equal(second.statusCode, 200);
    const repeat = easterEggDiscoveryResultSchema.parse(second.json());
    assert.equal(repeat.firstDiscovery, false);
    assert.deepEqual(repeat.unlockedAchievements, []);

    const after = (await app.inject({ method: "GET", url: `/api/planet/${LUCIA}` })).json();
    assert.deepEqual(after, before);
    const achievements = (
      await app.inject({ method: "GET", url: `/api/students/${LUCIA}/achievements` })
    ).json();
    assert.equal(achievements.length, 1);

    const world = worldStateSchema.parse(
      (await app.inject({ method: "GET", url: `/api/world/${LUCIA}` })).json(),
    );
    assert.deepEqual(world.discoveredEasterEggCodes, ["hidden-pi"]);

    assert.equal(
      (
        await app.inject({
          method: "POST",
          url: "/api/easter-eggs/missing-egg/discover",
          payload: { studentId: LUCIA },
        })
      ).statusCode,
      404,
    );
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url: "/api/easter-eggs/hidden-pi/discover",
          payload: {},
        })
      ).statusCode,
      400,
    );
  }));

test("teams, challenges and attempts unlock team-spark once per member", () =>
  withApp(async (app) => {
    const created = await app.inject({
      method: "POST",
      url: "/api/teams",
      payload: {
        classId: "class-demo",
        name: "Los Triángulos",
        createdBy: LUCIA,
        memberIds: [LUCIA, "student-mateo"],
      },
    });
    assert.equal(created.statusCode, 201);
    const team = teamStateSchema.parse(created.json());

    const fetched = await app.inject({ method: "GET", url: `/api/teams/${team.id}` });
    assert.equal(fetched.statusCode, 200);
    assert.deepEqual(teamStateSchema.parse(fetched.json()), team);

    const challengeResponse = await app.inject({
      method: "POST",
      url: `/api/teams/${team.id}/challenges`,
      payload: { topicId: "topic-geometry", title: "Áreas en equipo", requiredSuccesses: 2 },
    });
    assert.equal(challengeResponse.statusCode, 201);
    const challenge = teamChallengeSchema.parse(challengeResponse.json());

    const attempt = (studentId: string, evidenceId: string, success = true) =>
      app.inject({
        method: "POST",
        url: `/api/teams/${team.id}/challenges/${challenge.id}/attempt`,
        payload: { studentId, evidenceId, success, at: AT },
      });

    const firstAttempt = teamChallengeAttemptResultSchema.parse(
      (await attempt(LUCIA, "ev-1")).json(),
    );
    assert.equal(firstAttempt.challenge.sharedProgress, 0.5);
    const duplicate = teamChallengeAttemptResultSchema.parse((await attempt(LUCIA, "ev-1")).json());
    assert.equal(duplicate.challenge.sharedProgress, 0.5);

    const done = teamChallengeAttemptResultSchema.parse(
      (await attempt("student-mateo", "ev-2")).json(),
    );
    assert.equal(done.challenge.status, "completed");
    assert.deepEqual(done.unlockedAchievements.map((item) => [item.studentId, item.code]).sort(), [
      ["student-lucia", "team-spark"],
      ["student-mateo", "team-spark"],
    ]);
    const again = teamChallengeAttemptResultSchema.parse((await attempt(LUCIA, "ev-3")).json());
    assert.deepEqual(again.unlockedAchievements, []);

    assert.equal((await attempt("student-sofia", "ev-4")).statusCode, 403);
    assert.equal((await app.inject({ method: "GET", url: "/api/teams/team-x" })).statusCode, 404);
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url: `/api/teams/${team.id}/challenges/challenge-x/attempt`,
          payload: { studentId: LUCIA, evidenceId: "ev", success: true, at: AT },
        })
      ).statusCode,
      404,
    );
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url: "/api/teams",
          payload: { classId: "class-demo", name: "Solo", createdBy: LUCIA, memberIds: [LUCIA] },
        })
      ).statusCode,
      400,
    );
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url: `/api/teams/${team.id}/challenges`,
          payload: { title: "" },
        })
      ).statusCode,
      400,
    );
  }));

test("learning events map to idempotent unlocks without touching mastery", async () => {
  const world = new WorldService({ now: () => AT });
  const planetBefore = world.getPlanet(LUCIA);

  const [resolved, mastery] = demoCheckpointEvents;
  assert.deepEqual(
    world.handleLearningEvent(resolved).map((item) => item.code),
    ["first-insight"],
  );
  assert.deepEqual(world.handleLearningEvent(resolved), []);
  assert.deepEqual(world.handleLearningEvent(mastery), []);

  const repeated = world.unlock({ studentId: LUCIA, code: "first-insight", evidenceIds: ["x"] });
  assert.equal(repeated.created, false);
  assert.equal(repeated.achievement.sourceEventId, "evt-misconception-resolved-1");
  assert.equal(world.listAchievements(LUCIA).length, 1);
  assert.deepEqual(world.getWorld(LUCIA).activeCelebrationIds, ["insight-lantern"]);

  const base = {
    studentId: LUCIA,
    topicId: "topic-geometry",
    evidenceIds: ["a-1"],
    occurredAt: AT,
  };
  world.handleLearningEvent({
    ...base,
    id: "evt-strategy",
    type: "StrategyChanged",
    fromStrategy: "worked_example",
    toStrategy: "visual_decomposition",
  });
  assert.deepEqual(
    world
      .handleLearningEvent({
        ...base,
        id: "evt-mastery-2",
        type: "MasteryUpdated",
        mastery: 0.85,
        previousMastery: 0.6,
      })
      .map((item) => item.code)
      .sort(),
    ["geometry-builder", "strategy-switcher"],
  );
  assert.deepEqual(
    world
      .handleLearningEvent({ ...base, id: "evt-retention", type: "RetentionCheckPassed" })
      .map((item) => item.code),
    ["retention-star"],
  );
  assert.throws(() => world.handleLearningEvent({ ...base, id: "bad", type: "Unknown" }));
  assert.deepEqual(world.getPlanet(LUCIA), planetBefore);
});

test("world routes accept an injected service", async () => {
  const service = new WorldService({ now: () => AT });
  service.handleLearningEvent(demoCheckpointEvents[0]);
  const app = Fastify({ logger: false });
  await app.register(worldRoutes, { service, prefix: "/api" });
  try {
    const response = await app.inject({
      method: "GET",
      url: `/api/students/${LUCIA}/achievements`,
    });
    assert.deepEqual(
      achievementSchema
        .array()
        .parse(response.json())
        .map((item) => item.code),
      ["first-insight"],
    );
  } finally {
    await app.close();
  }
});
