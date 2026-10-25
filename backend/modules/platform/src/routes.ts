import type { FastifyInstance, FastifyRequest } from "fastify";
import { z } from "zod";
import { forbidden, notFound } from "./errors.js";

const classParams = z.object({ classId: z.string().min(1).max(200) });
const enrollmentParams = classParams.extend({ studentId: z.string().min(1).max(200) });

/** Register inside the `/api` prefix. */
export async function platformRoutes(app: FastifyInstance) {
  app.get("/auth/me", async (request) => request.auth);

  // Classes the caller belongs to. Filtered again through authorization as defense in depth.
  app.get("/classes", async (request) => {
    const classes = await app.platform.classes.listFor(request.auth);
    return classes.filter((item) =>
      app.platform.authorization.canAccessClass(request.auth, item.id),
    );
  });

  // Enrollment management: the class's professor (or an admin) only.
  const manage = (request: FastifyRequest, classId: string) => {
    if (!app.platform.authorization.canManageClass(request.auth, classId))
      throw forbidden("Not allowed to manage this class");
  };

  app.get("/classes/:classId/enrollments", async (request) => {
    const { classId } = classParams.parse(request.params);
    manage(request, classId);
    const roster = await app.platform.enrollments.roster(classId);
    if (!roster) throw notFound("Class", classId);
    return roster;
  });

  app.put("/classes/:classId/enrollments/:studentId", async (request, reply) => {
    const { classId, studentId } = enrollmentParams.parse(request.params);
    manage(request, classId);
    await app.platform.enrollments.enroll(classId, studentId);
    return reply.status(204).send();
  });

  app.delete("/classes/:classId/enrollments/:studentId", async (request, reply) => {
    const { classId, studentId } = enrollmentParams.parse(request.params);
    manage(request, classId);
    await app.platform.enrollments.drop(classId, studentId);
    return reply.status(204).send();
  });
}
