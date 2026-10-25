import { athenaDemoIds } from "./demo-identities.js";
import { classAnalyticsSchema, emptyAiUsage, type ClassAnalytics } from "../analytics.js";

/** Minimal opening-state fixture (Platform owns). The full class story arrives with projections. */
export const demoClassAnalytics: ClassAnalytics = classAnalyticsSchema.parse({
  classId: athenaDemoIds.class,
  courseId: athenaDemoIds.course,
  topics: [],
  aiUsage: emptyAiUsage(),
  interventions: [],
  students: [],
});
