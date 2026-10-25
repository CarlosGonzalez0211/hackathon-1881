import type { FastifyInstance } from "fastify";
import { analyticsRoutes } from "@athena/analytics";
import { curriculumRoutes } from "@athena/curriculum";
import { learningRoutes } from "@athena/learning";
import { platformRoutes } from "@athena/platform";
import { worldRoutes } from "@athena/world";
import { rosterProviderFor } from "./analytics.js";

/**
 * One line per subsystem module. Each module edits only its own entry, so the app composition
 * never becomes a merge-conflict magnet. Modules register inside the `/api` prefix and read
 * shared services from `app.platform`.
 */
export const modulePlugins: { name: string; plugin: (app: FastifyInstance) => Promise<void> }[] = [
  { name: "platform", plugin: platformRoutes },
  { name: "curriculum", plugin: curriculumRoutes },
  { name: "learning", plugin: learningRoutes },
  { name: "analytics", plugin: (app) => analyticsRoutes(app, { rosters: rosterProviderFor() }) },
  { name: "world", plugin: worldRoutes },
];
