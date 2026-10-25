import {
  athenaDemoIds,
  demoClassAnalytics,
  type ClassAnalytics,
  type InterventionStatus,
} from "@athena/shared";

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

/**
 * Professor decisions on derived interventions. Interventions are recomputed from events, so
 * only their status is stored, keyed by the deterministic intervention id.
 */
export interface InterventionStatusStore {
  statuses(classId: string): Promise<Map<string, InterventionStatus>>;
  set(
    classId: string,
    interventionId: string,
    status: InterventionStatus,
    actorId: string,
  ): Promise<void>;
}

export class InMemoryInterventionStatusStore implements InterventionStatusStore {
  private readonly byClass = new Map<string, Map<string, InterventionStatus>>();

  async statuses(classId: string) {
    return new Map(this.byClass.get(classId) ?? []);
  }

  async set(classId: string, interventionId: string, status: InterventionStatus) {
    const map = this.byClass.get(classId) ?? new Map<string, InterventionStatus>();
    map.set(interventionId, status);
    this.byClass.set(classId, map);
  }
}
