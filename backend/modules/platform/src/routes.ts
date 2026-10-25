import type { FastifyInstance } from "fastify";

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
}
