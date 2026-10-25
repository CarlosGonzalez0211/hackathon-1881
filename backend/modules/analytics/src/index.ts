/**
 * Internal analytics module (Subsystem 4). AI usage is shown beside mastery and never changes it.
 * Event projections and interventions are still pending; today it serves the demo fixture.
 */
export { InMemoryAnalyticsRepository, type AnalyticsReadRepository } from "./repository.js";
export { AnalyticsService } from "./service.js";
export { analyticsRoutes, type AnalyticsRoutesOptions } from "./routes.js";
