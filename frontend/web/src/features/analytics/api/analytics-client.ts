import { classAnalyticsSchema, demoClassAnalytics, type ClassAnalytics } from "@athena/shared";
import { api } from "@/lib/api";
import { useMocks } from "@/lib/mode";

export interface AnalyticsClient {
  getClassAnalytics(classId: string): Promise<ClassAnalytics>;
}

/** Opening-state fixture. Reads the shared scenario store once P1 provides it. */
export class MockAnalyticsClient implements AnalyticsClient {
  async getClassAnalytics(): Promise<ClassAnalytics> {
    return demoClassAnalytics;
  }
}

export class ApiAnalyticsClient implements AnalyticsClient {
  async getClassAnalytics(classId: string) {
    return classAnalyticsSchema.parse(await api(`/analytics/class/${encodeURIComponent(classId)}`));
  }
}

export const getAnalyticsClient = (): AnalyticsClient =>
  useMocks ? new MockAnalyticsClient() : new ApiAnalyticsClient();
