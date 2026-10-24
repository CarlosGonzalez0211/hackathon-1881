import Fastify from "fastify";
import cors from "@fastify/cors";
import type { HealthResponse } from "@athena/shared";
import { env } from "./env.js";
import { aiRoutes } from "./routes/ai.js";

/** Isolated app for injection tests, standalone Node and Vercel. */
export async function createApp(options: { logger?: boolean } = {}) {
  const app = Fastify({ logger: options.logger ?? true });
  // Register before child plugins so every route inherits the same validation handling.
  app.setErrorHandler((err: Error & { statusCode?: number }, _req, reply) => {
    app.log.error(err);
    const status = err.name === "ZodError" ? 400 : (err.statusCode ?? 500);
    reply.status(status).send({ error: status >= 500 ? "Internal server error" : err.message });
  });
  await app.register(cors, { origin: env.WEB_ORIGIN.split(",").map((origin) => origin.trim()) });
  await app.register(
    async (api) => {
      api.get("/health", async (): Promise<HealthResponse> => ({
        status: "ok",
        time: new Date().toISOString(),
      }));
      await api.register(aiRoutes);
    },
    { prefix: "/api" },
  );
  return app;
}
