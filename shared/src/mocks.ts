import type { ClassOrbit, ClassSummary, HouseState, PlanetState } from "./learning.js";

/** Demo topic titles in English; the web app localizes them (locales/es.json). */
const titles = ["Fractions", "Geometry", "Ecosystems", "Energy", "Reading", "Critical thinking"];
const fixedTheme = { palette: "athena-default", character: "messenger-provisional" };
function planet(student: number): PlanetState {
  const completed = student % 5;
  const houses: HouseState[] = titles.map((title, slot) => ({
    topicId: `topic-${slot + 1}`,
    title,
    slot,
    status:
      slot < completed
        ? "done"
        : slot === completed
          ? student % 2
            ? "in_progress"
            : "available"
          : "locked",
    progress: slot < completed ? 1 : slot === completed && student % 2 ? 0.4 : 0,
  }));
  return {
    studentId: `student-${student + 1}`,
    theme: { ...fixedTheme },
    growth: houses.reduce((sum, house) => sum + house.progress, 0) / houses.length,
    houses,
  };
}
export const mockClassPlanets: PlanetState[] = Array.from({ length: 8 }, (_, index) =>
  planet(index),
);
export const mockClassPlanets8 = mockClassPlanets;
/** Class roster names for the mocked orbit; Lucía is the demo student (`student-lucia`). */
const rosterNames = [
  "Lucía",
  "Mateo",
  "Sofía",
  "Diego",
  "Valeria",
  "Andrés",
  "Camila",
  "Nicolás",
  "Emma",
  "Tomás",
  "Julia",
  "Gabriel",
  "Martina",
  "Samuel",
  "Isabella",
  "Bruno",
  "Renata",
  "Joaquín",
  "Elena",
  "Pablo",
  "Daniela",
  "Leo",
  "Ximena",
  "Hugo",
  "Paula",
  "Iker",
  "Abril",
  "Simón",
  "Olivia",
  "Marco",
];
const slug = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
/**
 * Mock class orbit with `count` students (default 8): one deterministic planet each, so the
 * orbit can be exercised at any class size. Names repeat with a number past the roster.
 */
export function mockClassOrbit(count = 8): ClassOrbit {
  const size = Math.max(0, Math.min(60, Math.floor(count)));
  return {
    classId: "class-demo",
    students: Array.from({ length: size }, (_, index) => {
      const base = rosterNames[index % rosterNames.length]!;
      const round = Math.floor(index / rosterNames.length);
      const displayName = round ? `${base} ${round + 1}` : base;
      const studentId = `student-${slug(base)}${round ? `-${round + 1}` : ""}`;
      return { studentId, displayName, planet: { ...planet(index), studentId } };
    }),
  };
}
export const mockPlanet: PlanetState = mockClassPlanets[1]!;
const usage = () => ({ chat: 0, podcast: 0, video: 0, summary: 0, hint: 0, quiz_answer: 0 });
export const mockSummary: ClassSummary = {
  classId: "class-demo",
  topics: titles.map((title, slot) => ({
    topicId: `topic-${slot + 1}`,
    title,
    progress:
      mockClassPlanets.reduce((sum, item) => sum + item.houses[slot]!.progress, 0) /
      mockClassPlanets.length,
  })),
  aiUsage: usage(),
  students: mockClassPlanets.map((item) => ({
    studentId: item.studentId,
    growth: item.growth,
    topics: item.houses.map(({ topicId, title, progress }) => ({ topicId, title, progress })),
    aiUsage: usage(),
  })),
};
