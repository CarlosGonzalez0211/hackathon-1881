import { classSchema, athenaDemoIds, type Class } from "@athena/shared";
import { api } from "@/lib/api";
import { useMocks } from "@/lib/mode";

export interface ClassesClient {
  listClasses(): Promise<Class[]>;
}

export class MockClassesClient implements ClassesClient {
  async listClasses(): Promise<Class[]> {
    return [
      {
        id: athenaDemoIds.class,
        courseId: athenaDemoIds.course,
        professorId: athenaDemoIds.professorRuiz,
        title: "Matemáticas I – Grupo A",
        createdAt: "2026-10-24T00:00:00.000Z",
      },
    ];
  }
}

/** STUB: `GET /api/classes` is not implemented in the backend yet. */
export class ApiClassesClient implements ClassesClient {
  async listClasses() {
    return classSchema.array().parse(await api("/classes"));
  }
}

export const getClassesClient = (): ClassesClient =>
  useMocks ? new MockClassesClient() : new ApiClassesClient();
