import { t } from "@/lib/i18n";
import {
  athenaDemoIds,
  mockClassOrbit,
  mockClassPlanets,
  mockPlanet,
  planetStateSchema,
  type ClassOrbit,
} from "@athena/shared";
import { api } from "./api";
import { createSupabaseServerClient } from "./supabase-server";
export const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";

/** These loaders run in Server Components, where api() has no browser session: read the cookie one. */
async function serverAuth(): Promise<RequestInit> {
  const { data } = await (await createSupabaseServerClient()).auth.getSession();
  const token = data.session?.access_token;
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}
export async function getPlanet(studentId = athenaDemoIds.students.lucia) {
  return useMocks
    ? mockPlanet
    : planetStateSchema.parse(
        await api(`/planet/${encodeURIComponent(studentId)}`, await serverAuth()),
      );
}
export async function getClassPlanets(classId = athenaDemoIds.class) {
  return useMocks
    ? mockClassPlanets
    : planetStateSchema
        .array()
        .parse(await api(`/class/${encodeURIComponent(classId)}/planets`, await serverAuth()));
}
/**
 * The class orbit: one planet per enrolled student. Mocks accept a class size so the orbit can
 * be shown with any number of students; the API path names students generically until the
 * Platform roster provides display names.
 */
export async function getClassOrbit(
  classId = athenaDemoIds.class,
  { students = 8 }: { students?: number } = {},
): Promise<ClassOrbit> {
  if (useMocks) return mockClassOrbit(students);
  const planets = await getClassPlanets(classId);
  return {
    classId,
    students: planets.map((planet, index) => ({
      studentId: planet.studentId,
      displayName: t("Student {0}", { 0: index + 1 }),
      planet,
    })),
  };
}
