import type { AuthContext, ClassAnalytics, Intervention, InterventionStatus } from "@athena/shared";
import { forbidden, notFound, type AuthorizationService } from "@athena/platform";
import type { AnalyticsReadRepository, InterventionStatusStore } from "./repository.js";

export class AnalyticsService {
  constructor(
    private readonly repository: AnalyticsReadRepository,
    private readonly authorization: AuthorizationService,
    private readonly statusStore: InterventionStatusStore,
  ) {}

  async getClassAnalytics(context: AuthContext, classId: string): Promise<ClassAnalytics> {
    // Class analytics are for the teaching side only; enrolled students must not see peers.
    if (!this.authorization.canManageClass(context, classId)) {
      throw forbidden("Only the class professor can view class analytics");
    }
    const analytics = await this.repository.getClassAnalytics(classId);
    if (!analytics) throw notFound("Class", classId);
    return analytics;
  }

  async updateInterventionStatus(
    context: AuthContext,
    classId: string,
    interventionId: string,
    status: InterventionStatus,
  ): Promise<Intervention> {
    const analytics = await this.getClassAnalytics(context, classId);
    // Only interventions the projection currently derives can be updated; stale ids are 404.
    const current = analytics.interventions.find((item) => item.id === interventionId);
    if (!current) throw notFound("Intervention", interventionId);
    await this.statusStore.set(classId, interventionId, status, context.userId);
    return { ...current, status };
  }
}
