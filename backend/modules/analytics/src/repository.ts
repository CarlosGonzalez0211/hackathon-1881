import { athenaDemoIds, demoClassAnalytics, type ClassAnalytics } from "@athena/shared";

/** Read model the dashboard queries. Production versions project from domain events. */
export interface AnalyticsReadRepository {
  getClassAnalytics(classId: string): Promise<ClassAnalytics | null>;
}

/** Serves the demo fixture until event projections land. */
export class InMemoryAnalyticsRepository implements AnalyticsReadRepository {
  private readonly classes = new Map<string, ClassAnalytics>([
    [athenaDemoIds.class, demoClassAnalytics],
  ]);

  async getClassAnalytics(classId: string) {
    return this.classes.get(classId) ?? null;
  }
}
