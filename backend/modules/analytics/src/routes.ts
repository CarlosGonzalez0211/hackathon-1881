import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { interventionStatusUpdateSchema } from "@athena/shared";
import { ProjectedAnalyticsRepository } from "./projected-repository.js";
import {
  InMemoryInterventionStatusStore,
  type AnalyticsReadRepository,
  type InterventionStatusStore,
} from "./repository.js";
import { demoRosterProvider, type RosterProvider } from "./rosters.js";
import { AnalyticsService } from "./service.js";

const classParams = z.object({ classId: z.string().min(1).max(200) });
const interventionParams = classParams.extend({ interventionId: z.string().min(1).max(500) });

export interface AnalyticsRoutesOptions {
  /** Overrides the default event projection (tests, alternative read models). */
  repository?: AnalyticsReadRepository;
  /** Class members and topic titles for the projection. Defaults to the demo class. */
  rosters?: RosterProvider;
  /** Where professors' acknowledge/resolve decisions persist. Defaults to memory. */
  statusStore?: InterventionStatusStore;
}

/** Register inside the `/api` prefix, after `installPlatform` ran on the root app. */
export async function analyticsRoutes(app: FastifyInstance, options: AnalyticsRoutesOptions = {}) {
  const statusStore = options.statusStore ?? new InMemoryInterventionStatusStore();
  const service = new AnalyticsService(
    options.repository ??
      new ProjectedAnalyticsRepository(
        app.platform.events,
        options.rosters ?? demoRosterProvider,
        statusStore,
      ),
    app.platform.authorization,
    statusStore,
  );

  app.get("/analytics/class/:classId", async (request) =>
    service.getClassAnalytics(request.auth, classParams.parse(request.params).classId),
  );

  app.patch("/analytics/class/:classId/interventions/:interventionId", async (request) => {
    const { classId, interventionId } = interventionParams.parse(request.params);
    const { status } = interventionStatusUpdateSchema.parse(request.body);
    return service.updateInterventionStatus(request.auth, classId, interventionId, status);
  });
}
