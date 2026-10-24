import type { FastifyInstance } from "fastify";
import { easterEggCodeSchema } from "@athena/shared";
import { z } from "zod";
import { WorldService } from "./service.js";

const id = z.string().min(1).max(200);
const studentParams = z.object({ studentId: id });
const classParams = z.object({ classId: id });
const teamParams = z.object({ teamId: id });
const attemptParams = z.object({ teamId: id, challengeId: id });
const eggParams = z.object({ code: easterEggCodeSchema });

export interface WorldRoutesOptions {
  /** Defaults to a fresh in-memory service seeded with the demo fixtures. */
  service?: WorldService;
}

/**
 * Proposal 5.5 routes. Register inside the `/api` prefix. Zod errors become 400 and
 * WorldError carries 403/404 through the app error handler.
 */
export async function worldRoutes(app: FastifyInstance, options: WorldRoutesOptions = {}) {
  const world = options.service ?? new WorldService();

  app.get("/planet/:studentId", async (req) =>
    world.getPlanet(studentParams.parse(req.params).studentId),
  );
  app.get("/class/:classId/planets", async (req) =>
    world.getClassPlanets(classParams.parse(req.params).classId),
  );
  app.get("/world/:studentId", async (req) =>
    world.getWorld(studentParams.parse(req.params).studentId),
  );
  app.post("/world/interactions", async (req, reply) =>
    reply.status(201).send(world.recordInteraction(req.body)),
  );
  app.get("/students/:studentId/achievements", async (req) =>
    world.listAchievements(studentParams.parse(req.params).studentId),
  );
  app.get("/students/:studentId/quests", async (req) =>
    world.listQuests(studentParams.parse(req.params).studentId),
  );
  app.post("/easter-eggs/:code/discover", async (req) =>
    world.discoverEasterEgg(eggParams.parse(req.params).code, req.body),
  );
  app.post("/teams", async (req, reply) => reply.status(201).send(world.createTeam(req.body)));
  app.get("/teams/:teamId", async (req) => world.getTeam(teamParams.parse(req.params).teamId));
  app.post("/teams/:teamId/challenges", async (req, reply) =>
    reply.status(201).send(world.createChallenge(teamParams.parse(req.params).teamId, req.body)),
  );
  app.post("/teams/:teamId/challenges/:challengeId/attempt", async (req) => {
    const { teamId, challengeId } = attemptParams.parse(req.params);
    return world.attemptChallenge(teamId, challengeId, req.body);
  });
}
