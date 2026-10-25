import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { InMemoryAnalyticsRepository, type AnalyticsReadRepository } from "./repository.js";
import { AnalyticsService } from "./service.js";

const classParams = z.object({ classId: z.string().min(1).max(200) });

export interface AnalyticsRoutesOptions {
  repository?: AnalyticsReadRepository;
}

/** Register inside the `/api` prefix, after `installPlatform` ran on the root app. */
export async function analyticsRoutes(app: FastifyInstance, options: AnalyticsRoutesOptions = {}) {
  const service = new AnalyticsService(
    options.repository ?? new InMemoryAnalyticsRepository(),
    app.platform.authorization,
  );

  app.get("/analytics/class/:classId", async (request) =>
    service.getClassAnalytics(request.auth, classParams.parse(request.params).classId),
  );
}
