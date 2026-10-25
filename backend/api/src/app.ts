import Fastify from "fastify";
import cors from "@fastify/cors";
import type { HealthResponse } from "@athena/shared";
import {
  AllowAllAuthService,
  createPlatformServices,
  installPlatform,
  type PlatformServices,
} from "@athena/platform";
import { env } from "./env.js";
import { modulePlugins } from "./plugins.js";
import { aiRoutes } from "./routes/ai.js";

/** Isolated app for injection tests, standalone Node and Vercel. */
export async function createApp(
  options: {
    logger?: boolean;
    platform?: Partial<PlatformServices>;
    dataMode?: "mock" | "real";
  } = {},
) {
  const services = createPlatformServices(options.platform);
  // The allow-all auth stub treats every caller as an admin, so it must never front real data.
  if (
    (options.dataMode ?? env.ATHENA_DATA_MODE) === "real" &&
    services.auth instanceof AllowAllAuthService
  ) {
    throw new Error(
      "ATHENA_DATA_MODE=real requires a real AuthService; the allow-all stub is mock-only",
    );
  }
  const app = Fastify({ logger: options.logger ?? true });
  installPlatform(app, services);
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
      for (const { plugin } of modulePlugins) await api.register(plugin);
    },
    { prefix: "/api" },
  );
  return app;
}
