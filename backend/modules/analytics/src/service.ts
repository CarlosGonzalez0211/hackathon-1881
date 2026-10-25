import type { AuthContext, ClassAnalytics } from "@athena/shared";
import { forbidden, notFound, type AuthorizationService } from "@athena/platform";
import type { AnalyticsReadRepository } from "./repository.js";

export class AnalyticsService {
  constructor(
    private readonly repository: AnalyticsReadRepository,
    private readonly authorization: AuthorizationService,
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
}
