import type { FastifyInstance } from "fastify";

/** Register inside the `/api` prefix. */
export async function platformRoutes(app: FastifyInstance) {
  app.get("/auth/me", async (request) => request.auth);
}
