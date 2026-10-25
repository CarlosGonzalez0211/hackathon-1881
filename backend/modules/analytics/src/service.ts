import type { AuthContext, ClassAnalytics } from "@athena/shared";
import { forbidden, notFound, type AuthorizationService } from "@athena/platform";
import type { AnalyticsReadRepository } from "./repository.js";

export class AnalyticsService {
  constructor(
    private readonly repository: AnalyticsReadRepository,
    private readonly authorization: AuthorizationService,
  ) {}

  async getClassAnalytics(context: AuthContext, classId: string): Promise<ClassAnalytics> {
    if (!this.authorization.canAccessClass(context, classId)) {
      throw forbidden("You cannot view this class");
    }
    const analytics = await this.repository.getClassAnalytics(classId);
    if (!analytics) throw notFound("Class", classId);
    return analytics;
  }
}
