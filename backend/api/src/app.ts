import Fastify from "fastify";
import cors from "@fastify/cors";
import type { HealthResponse } from "@athena/shared";
import {
  AllowAllAuthService,
  AllowAllAuthorizationService,
  createPlatformServices,
  installPlatform,
  type PlatformServices,
} from "@athena/platform";
import { env } from "./env.js";
import { platformServicesFor } from "./platform.js";
import { modulePlugins } from "./plugins.js";
import { aiRoutes } from "./routes/ai.js";

/** Isolated app for injection tests, standalone Node and Vercel. */
export async function createApp(
  options: {
    logger?: boolean;
    platform?: Partial<PlatformServices>;
    dataMode?: "mock" | "real";
    /** Overrides ATHENA_ALLOW_MOCK (tests). */
    allowMock?: boolean;
  } = {},
) {
  const mode = options.dataMode ?? env.ATHENA_DATA_MODE;
  // Explicit auth + authorization (tests, embedding) bypass the environment-built services.
  const fromEnv =
    options.platform?.auth && options.platform.authorization ? {} : platformServicesFor(mode);
  const services = createPlatformServices({ ...fromEnv, ...options.platform });
  const bypassAuth = env.ATHENA_DEV_BYPASS_AUTH;
  if (bypassAuth && process.env.NODE_ENV === "production") {
    throw new Error("ATHENA_DEV_BYPASS_AUTH is for local development only");
  }
  // The allow-all auth stub treats every caller as an admin, so it must never front real data
  // (except the explicit local ATHENA_DEV_BYPASS_AUTH escape hatch).
  if (
    mode === "real" &&
    !(bypassAuth && !options.platform) &&
    (services.auth instanceof AllowAllAuthService ||
      services.authorization instanceof AllowAllAuthorizationService)
  ) {
    throw new Error(
      "ATHENA_DATA_MODE=real requires real auth and authorization services; the allow-all stubs are mock-only",
    );
  }
  const allowMock = options.allowMock ?? env.ATHENA_ALLOW_MOCK;
  // Mock mode lets every caller in as the demo admin: fine for fixtures, never for real data.
  // Production must say so explicitly instead of landing there by forgetting ATHENA_DATA_MODE.
  if (
    mode === "mock" &&
    process.env.NODE_ENV === "production" &&
    !allowMock &&
    services.auth instanceof AllowAllAuthService
  ) {
    throw new Error(
      "Refusing to start in production with ATHENA_DATA_MODE=mock: every caller would be the demo admin. Set ATHENA_DATA_MODE=real, or ATHENA_ALLOW_MOCK=true for a demo deployment with no real data",
    );
  }
  const app = Fastify({ logger: options.logger ?? true });
  if (mode === "mock" && process.env.NODE_ENV === "production") {
    app.log.warn("ATHENA_DATA_MODE=mock in production: every caller is the demo admin");
  }
  if (bypassAuth)
    app.log.warn("ATHENA_DEV_BYPASS_AUTH: auth is disabled, every caller is the demo admin");
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
