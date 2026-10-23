import Fastify from "fastify";
import cors from "@fastify/cors";
import type { HealthResponse } from "@hackathon/shared";
import { env } from "./env.js";
import { aiRoutes } from "./routes/ai.js";

const app = Fastify({ logger: true });

await app.register(cors, { origin: env.WEB_ORIGIN.split(",") });

app.get("/health", async (): Promise<HealthResponse> => ({
  status: "ok",
  time: new Date().toISOString(),
}));

await app.register(aiRoutes);

app.setErrorHandler((err: Error & { statusCode?: number }, _req, reply) => {
  app.log.error(err);
  reply
    .status(err.name === "ZodError" ? 400 : (err.statusCode ?? 500))
    .send({ error: err.message });
});

await app.listen({ port: env.PORT, host: "0.0.0.0" });
