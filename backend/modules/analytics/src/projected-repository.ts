import type { DomainEventStore } from "@athena/platform";
import {
  InMemoryInterventionStatusStore,
  type AnalyticsReadRepository,
  type InterventionStatusStore,
} from "./repository.js";
import { projectClassAnalytics, type ClassRoster } from "./projection.js";

const SEVERITY_RANK = { low: 0, medium: 1, high: 2 } as const;

/**
 * Rebuilds the class read model from the event log on each read (cheap at demo scale), then
 * overlays the professor's acknowledge/resolve decisions on the derived interventions.
 */
export class ProjectedAnalyticsRepository implements AnalyticsReadRepository {
  constructor(
    private readonly events: DomainEventStore,
    private readonly rosters: (classId: string) => Promise<ClassRoster | null>,
    private readonly statusStore: InterventionStatusStore = new InMemoryInterventionStatusStore(),
  ) {}

  async getClassAnalytics(classId: string) {
    const roster = await this.rosters(classId);
    if (!roster) return null;
    const projected = projectClassAnalytics(roster, await this.events.list({ classId }));
    const decisions = await this.statusStore.statuses(classId);
    const interventions = projected.interventions.map((item) => {
      const decision = decisions.get(item.id);
      if (!decision) return item;
      // A decision holds until the situation gets worse than when it was made, then it reopens.
      const escalated = SEVERITY_RANK[item.severity] > SEVERITY_RANK[decision.severity];
      return { ...item, status: escalated ? ("open" as const) : decision.status };
    });
    const unresolved = (studentId: string) =>
      interventions.filter((item) => item.studentId === studentId && item.status !== "resolved")
        .length;
    return {
      ...projected,
      interventions,
      students: projected.students.map((student) => ({
        ...student,
        openInterventions: unresolved(student.studentId),
      })),
    };
  }
}
