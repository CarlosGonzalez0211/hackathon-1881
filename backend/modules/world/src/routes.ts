import type { FastifyInstance, FastifyRequest } from "fastify";
import { demoWorldStepRequestSchema, easterEggCodeSchema } from "@athena/shared";
import { z } from "zod";
import { DemoWorldDriver } from "./demo.js";
import { forbidden } from "./errors.js";
import type { PlatformServices } from "@athena/platform";
import { WorldService } from "./service.js";

const id = z.string().min(1).max(200);
const studentParams = z.object({ studentId: id });
const classParams = z.object({ classId: id });
const teamParams = z.object({ teamId: id });
const attemptParams = z.object({ teamId: id, challengeId: id });
const eggParams = z.object({ code: easterEggCodeSchema });
const courseParams = z.object({ courseId: id });
/** These only peek at who is acting; the service validates the full body. */
const actorBody = z.object({ studentId: id }).passthrough();
const createTeamBody = z.object({ classId: id, createdBy: id }).passthrough();

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
 * Proposal 5.5 routes. Register inside the `/api` prefix, after `installPlatform`. Every route
 * checks `request.auth` against `app.platform.authorization`. Zod errors become 400 and
 * WorldError carries 403/404 through the app error handler.
 */
export async function worldRoutes(app: FastifyInstance, options: WorldRoutesOptions = {}) {
  let world = options.service ?? new WorldService();
  let demo = new DemoWorldDriver(world);
  const { authorization }: Pick<PlatformServices, "authorization"> = app.platform;

  const deny = (what: string): never => {
    throw forbidden(`Not allowed to ${what}`);
  };
  /** Reads: the student themself, their professor, or an admin. */
  const mayReadStudent = async (req: FastifyRequest, studentId: string) => {
    if (!authorization.canAccessStudent(req.auth, studentId)) deny("view this student");
    await world.syncStudent(studentId);
  };
  /** Writes happen as the student (or an admin acting for them); professors only read. */
  const mayActAs = async (req: FastifyRequest, studentId: string) => {
    if (
      req.auth.role !== "admin" &&
      (req.auth.role !== "student" || !authorization.canAccessStudent(req.auth, studentId))
    )
      deny("act for this student");
    await world.syncStudent(studentId);
  };
  const mayManageClass = (req: FastifyRequest, classId: string) => {
    if (!authorization.canManageClass(req.auth, classId)) deny("manage this class");
  };
  /** Service-to-service and presenter routes: an admin (service) identity only. */
  const mustBeAdmin = (req: FastifyRequest) => {
    if (req.auth.role !== "admin") deny("use this route");
  };

  app.get("/planet/:studentId", async (req) => {
    const { studentId } = studentParams.parse(req.params);
    await mayReadStudent(req, studentId);
    return world.getPlanet(studentId);
  });
  app.get("/class/:classId/planets", async (req) => {
    const { classId } = classParams.parse(req.params);
    mayManageClass(req, classId);
    return world.getClassPlanets(classId);
  });
  app.get("/world/:studentId", async (req) => {
    const { studentId } = studentParams.parse(req.params);
    await mayReadStudent(req, studentId);
    return world.getWorld(studentId);
  });
  app.post("/world/interactions", async (req, reply) => {
    await mayActAs(req, actorBody.parse(req.body).studentId);
    return reply.status(201).send(await world.recordInteraction(req.body));
  });
  app.post("/world/houses/enter", async (req) => {
    await mayActAs(req, actorBody.parse(req.body).studentId);
    return world.enterHouse(req.body);
  });
  app.get("/courses/:courseId/world-layout", async (req) => {
    const { courseId } = courseParams.parse(req.params);
    if (!authorization.canAccessCourse(req.auth, courseId)) deny("view this course");
    return world.getWorldLayout(courseId);
  });
  // Learning -> World event sink. Service-to-service only, so it needs an admin identity.
  app.post("/world/events", async (req) => {
    mustBeAdmin(req);
    // Unknown students are refused by the service once the port has been asked about them.
    const studentId = (req.body as { studentId?: unknown } | null)?.studentId;
    if (typeof studentId === "string" && studentId) await world.syncStudent(studentId);
    return world.ingestLearningEvent(req.body);
  });

  if (options.demoControls ?? process.env.NODE_ENV !== "production") {
    app.post("/demo/world/step", async (req) => {
      mustBeAdmin(req);
      const { studentId } = demoWorldStepRequestSchema.parse(req.body ?? {});
      return demo.step(studentId);
    });
    app.post("/demo/world/reset", async (req, reply) => {
      mustBeAdmin(req);
      // Only a service this plugin created can be replaced; an injected one keeps its state.
      if (!options.service) {
        world = new WorldService();
        demo = new DemoWorldDriver(world);
      } else demo = new DemoWorldDriver(world);
      return reply.status(204).send();
    });
  }
  app.get("/students/:studentId/achievements", async (req) => {
    const { studentId } = studentParams.parse(req.params);
    await mayReadStudent(req, studentId);
    return world.listAchievements(studentId);
  });
  app.get("/students/:studentId/quests", async (req) => {
    const { studentId } = studentParams.parse(req.params);
    await mayReadStudent(req, studentId);
    return world.listQuests(studentId);
  });
  app.post("/easter-eggs/:code/discover", async (req) => {
    const { code } = eggParams.parse(req.params);
    await mayActAs(req, actorBody.parse(req.body).studentId);
    return world.discoverEasterEgg(code, req.body);
  });
  app.post("/teams", async (req, reply) => {
    const { classId, createdBy } = createTeamBody.parse(req.body);
    // A professor forms teams for their class; a student only as themself, in their own class.
    if (req.auth.role === "professor") mayManageClass(req, classId);
    else {
      await mayActAs(req, createdBy);
      if (!authorization.canAccessClass(req.auth, classId)) deny("create a team in this class");
    }
    await world.syncClass(classId);
    return reply.status(201).send(world.createTeam(req.body));
  });
  app.get("/teams/:teamId", async (req) => {
    const team = world.getTeam(teamParams.parse(req.params).teamId);
    if (!authorization.canAccessClass(req.auth, team.classId)) deny("view this team");
    return team;
  });
  app.post("/teams/:teamId/challenges", async (req, reply) => {
    const { teamId } = teamParams.parse(req.params);
    mayManageClass(req, world.getTeam(teamId).classId);
    return reply.status(201).send(world.createChallenge(teamId, req.body));
  });
  app.post("/teams/:teamId/challenges/:challengeId/attempt", async (req) => {
    const { teamId, challengeId } = attemptParams.parse(req.params);
    await mayActAs(req, actorBody.parse(req.body).studentId);
    return world.attemptChallenge(teamId, challengeId, req.body);
  });
}
