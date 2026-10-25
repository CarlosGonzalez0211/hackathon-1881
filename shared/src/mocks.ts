import type { ClassOrbit, ClassSummary, HouseState, PlanetState } from "./learning.js";
import {
  DEMO_CLASS_ID,
  demoClassPlanets,
  demoLuciaPlanet,
  demoRoster,
  demoTopics,
} from "./world.js";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

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
/** Same opening state the backend World store receives. */
export const mockClassPlanets: PlanetState[] = clone(demoClassPlanets);
export const mockClassPlanets8 = mockClassPlanets;
/** Extra names are only used by the variable-size orbit layout demo after the canonical eight. */
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
    classId: DEMO_CLASS_ID,
    students: Array.from({ length: size }, (_, index) => {
      const canonical = demoRoster.students[index];
      if (canonical) {
        return {
          studentId: canonical.id,
          displayName: canonical.displayName,
          planet: clone(demoClassPlanets[index]!),
        };
      }
      const base = rosterNames[index % rosterNames.length]!;
      const round = Math.floor(index / rosterNames.length);
      const displayName = round ? `${base} ${round + 1}` : base;
      const studentId = `student-${slug(base)}${round ? `-${round + 1}` : ""}`;
      return { studentId, displayName, planet: { ...planet(index), studentId } };
    }),
  };
}
export const mockPlanet: PlanetState = clone(demoLuciaPlanet);
const usage = () => ({ chat: 0, podcast: 0, video: 0, summary: 0, hint: 0, quiz_answer: 0 });
export const mockSummary: ClassSummary = {
  classId: DEMO_CLASS_ID,
  topics: demoTopics.map(({ title, topicId, slot }) => ({
    topicId,
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
