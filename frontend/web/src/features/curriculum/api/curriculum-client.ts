import type { Course, Topic } from "@athena/shared";
import { useMocks } from "@/lib/mode";

/** STUB (P1 owns): extend with uploads, material status and resource generation. */
export interface CurriculumClient {
  getCourse(courseId: string): Promise<Course>;
  listTopics(courseId: string): Promise<Topic[]>;
}

const pending = (name: string) => new Error(`${name}: fixtures/endpoint pending (P1)`);

export class MockCurriculumClient implements CurriculumClient {
  async getCourse(): Promise<Course> {
    throw pending("MockCurriculumClient.getCourse");
  }
  async listTopics(): Promise<Topic[]> {
    throw pending("MockCurriculumClient.listTopics");
  }
}

export class ApiCurriculumClient implements CurriculumClient {
  async getCourse(): Promise<Course> {
    throw pending("ApiCurriculumClient.getCourse");
  }
  async listTopics(): Promise<Topic[]> {
    throw pending("ApiCurriculumClient.listTopics");
  }
}

export const getCurriculumClient = (): CurriculumClient =>
  useMocks ? new MockCurriculumClient() : new ApiCurriculumClient();
