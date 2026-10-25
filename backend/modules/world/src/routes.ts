import type { FastifyInstance } from "fastify";
import { demoWorldStepRequestSchema, easterEggCodeSchema } from "@athena/shared";
import { z } from "zod";
import { DemoWorldDriver } from "./demo.js";
import { WorldService } from "./service.js";

const id = z.string().min(1).max(200);
const studentParams = z.object({ studentId: id });
const classParams = z.object({ classId: id });
const teamParams = z.object({ teamId: id });
const attemptParams = z.object({ teamId: id, challengeId: id });
const eggParams = z.object({ code: easterEggCodeSchema });
const courseParams = z.object({ courseId: id });

export interface WorldRoutesOptions {
  /** Defaults to a fresh in-memory service seeded with the demo fixtures. */
  service?: WorldService;
  /**
   * Presenter-only `/demo/world/*` routes that play Learning's role on mock ports.
   * Defaults to on outside production; never enable in production.
   */
  demoControls?: boolean;
}

/**
 * Proposal 5.5 routes. Register inside the `/api` prefix. Zod errors become 400 and
 * WorldError carries 403/404 through the app error handler.
 */
export async function worldRoutes(app: FastifyInstance, options: WorldRoutesOptions = {}) {
  let world = options.service ?? new WorldService();
  let demo = new DemoWorldDriver(world);

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
    reply.status(201).send(await world.recordInteraction(req.body)),
  );
  app.post("/world/houses/enter", async (req) => world.enterHouse(req.body));
  app.get("/courses/:courseId/world-layout", async (req) =>
    world.getWorldLayout(courseParams.parse(req.params).courseId),
  );
  // Learning -> World event sink. Service-to-service only: protect with platform auth (P4)
  // before production.
  app.post("/world/events", async (req) => world.ingestLearningEvent(req.body));

  if (options.demoControls ?? process.env.NODE_ENV !== "production") {
    app.post("/demo/world/step", async (req) => {
      const { studentId } = demoWorldStepRequestSchema.parse(req.body ?? {});
      return demo.step(studentId);
    });
    app.post("/demo/world/reset", async (_req, reply) => {
      // Only a service this plugin created can be replaced; an injected one keeps its state.
      if (!options.service) {
        world = new WorldService();
        demo = new DemoWorldDriver(world);
      } else demo = new DemoWorldDriver(world);
      return reply.status(204).send();
    });
  }
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
