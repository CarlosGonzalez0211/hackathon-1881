import type { DomainEventStore } from "@athena/platform";
import type { AnalyticsReadRepository } from "./repository.js";
import { projectClassAnalytics, type ClassRoster } from "./projection.js";

/** Rebuilds the class read model from the event log on each read; cheap at demo scale. */
export class ProjectedAnalyticsRepository implements AnalyticsReadRepository {
  constructor(
    private readonly events: DomainEventStore,
    private readonly rosters: (classId: string) => Promise<ClassRoster | null>,
  ) {}

  async getClassAnalytics(classId: string) {
    const roster = await this.rosters(classId);
    if (!roster) return null;
    return projectClassAnalytics(roster, await this.events.list({ classId }));
  }
}
