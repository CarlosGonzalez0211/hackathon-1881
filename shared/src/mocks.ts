import type { ClassSummary, HouseState, PlanetState } from "./learning.js";

const titles = [
  "Fracciones",
  "Geometría",
  "Ecosistemas",
  "Energía",
  "Lectura",
  "Pensamiento crítico",
];
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
