import {
  classAnalyticsSchema,
  demoClassAnalyticsMidSemester,
  interventionSchema,
  type ClassAnalytics,
  type Intervention,
  type InterventionStatus,
} from "@athena/shared";
import { api } from "@/lib/api";
import { useMocks } from "@/lib/mode";

export interface AnalyticsClient {
  getClassAnalytics(classId: string): Promise<ClassAnalytics>;
  updateInterventionStatus(
    classId: string,
    interventionId: string,
    status: InterventionStatus,
  ): Promise<Intervention>;
}

// Mock decisions outlive the client instance so a reload within the session keeps them.
const mockStatuses = new Map<string, InterventionStatus>();

/** Mid-semester demo story. Reads the shared scenario store once P1 provides it. */
export class MockAnalyticsClient implements AnalyticsClient {
  async getClassAnalytics(): Promise<ClassAnalytics> {
    const story = demoClassAnalyticsMidSemester;
    const interventions = story.interventions.map((item) => ({
      ...item,
      status: mockStatuses.get(item.id) ?? item.status,
    }));
    return {
      ...story,
      interventions,
      students: story.students.map((student) => ({
        ...student,
        openInterventions: interventions.filter(
          (item) => item.studentId === student.studentId && item.status !== "resolved",
        ).length,
      })),
    };
  }

  async updateInterventionStatus(
    _classId: string,
    interventionId: string,
    status: InterventionStatus,
  ): Promise<Intervention> {
    const current = demoClassAnalyticsMidSemester.interventions.find(
      (item) => item.id === interventionId,
    );
    if (!current) throw new Error(`Unknown intervention ${interventionId}`);
    mockStatuses.set(interventionId, status);
    return { ...current, status };
  }
}

export class ApiAnalyticsClient implements AnalyticsClient {
  async getClassAnalytics(classId: string) {
    return classAnalyticsSchema.parse(await api(`/analytics/class/${encodeURIComponent(classId)}`));
  }

  async updateInterventionStatus(
    classId: string,
    interventionId: string,
    status: InterventionStatus,
  ) {
    return interventionSchema.parse(
      await api(
        `/analytics/class/${encodeURIComponent(classId)}/interventions/${encodeURIComponent(interventionId)}`,
        { method: "PATCH", body: JSON.stringify({ status }) },
      ),
    );
  }
}

export const getAnalyticsClient = (): AnalyticsClient =>
  useMocks ? new MockAnalyticsClient() : new ApiAnalyticsClient();
