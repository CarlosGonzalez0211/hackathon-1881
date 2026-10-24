import { mockPlanet, mockClassPlanets, planetStateSchema } from "@athena/shared";
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
