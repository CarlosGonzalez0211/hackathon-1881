/**
 * Internal analytics module (Subsystem 4). AI usage is shown beside mastery and never changes it.
 * Routes serve a projection of the domain event log; rosters supply members and topic titles.
 */
export { InMemoryAnalyticsRepository, type AnalyticsReadRepository } from "./repository.js";
export { AnalyticsService } from "./service.js";
export { analyticsRoutes, type AnalyticsRoutesOptions } from "./routes.js";
export {
  projectClassAnalytics,
  MASTERED_AT,
  STRUGGLING_BELOW,
  HIGH_SEVERITY_BELOW,
  type ClassRoster,
} from "./projection.js";
export { ProjectedAnalyticsRepository } from "./projected-repository.js";
export { demoRosterProvider, type RosterProvider } from "./rosters.js";
