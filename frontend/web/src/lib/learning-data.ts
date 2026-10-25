import {
  mockClassOrbit,
  mockClassPlanets,
  mockPlanet,
  planetStateSchema,
  type ClassOrbit,
} from "@athena/shared";
import { api } from "./api";
export const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";
export async function getPlanet(studentId = "student-2") {
  return useMocks
    ? mockPlanet
    : planetStateSchema.parse(await api(`/planet/${encodeURIComponent(studentId)}`));
}
export async function getClassPlanets(classId = "class-demo") {
  return useMocks
    ? mockClassPlanets
    : planetStateSchema.array().parse(await api(`/class/${encodeURIComponent(classId)}/planets`));
}
/**
 * The class orbit: one planet per enrolled student. Mocks accept a class size so the orbit can
 * be shown with any number of students; the API path names students generically until the
 * Platform roster provides display names.
 */
export async function getClassOrbit(
  classId = "class-demo",
  { students = 8 }: { students?: number } = {},
): Promise<ClassOrbit> {
  if (useMocks) return mockClassOrbit(students);
  const planets = await getClassPlanets(classId);
  return {
    classId,
    students: planets.map((planet, index) => ({
      studentId: planet.studentId,
      displayName: `Estudiante ${index + 1}`,
      planet,
    })),
  };
}
