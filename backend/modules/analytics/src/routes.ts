import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { ProjectedAnalyticsRepository } from "./projected-repository.js";
import type { AnalyticsReadRepository } from "./repository.js";
import { demoRosterProvider, type RosterProvider } from "./rosters.js";
import { AnalyticsService } from "./service.js";

const classParams = z.object({ classId: z.string().min(1).max(200) });

export interface AnalyticsRoutesOptions {
  /** Overrides the default event projection (tests, alternative read models). */
  repository?: AnalyticsReadRepository;
  /** Class members and topic titles for the projection. Defaults to the demo class. */
  rosters?: RosterProvider;
}

/** Register inside the `/api` prefix, after `installPlatform` ran on the root app. */
export async function analyticsRoutes(app: FastifyInstance, options: AnalyticsRoutesOptions = {}) {
  const service = new AnalyticsService(
    options.repository ??
      new ProjectedAnalyticsRepository(app.platform.events, options.rosters ?? demoRosterProvider),
    app.platform.authorization,
  );

  app.get("/analytics/class/:classId", async (request) =>
    service.getClassAnalytics(request.auth, classParams.parse(request.params).classId),
  );
}
