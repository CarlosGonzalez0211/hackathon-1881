import { curriculumDatasetSchema } from "../curriculum.js";
import { demoMathCourse, demoMathTopics, demoMathSources } from "./curriculum/math.js";
import { demoHistoryCourse, demoHistoryTopics, demoHistorySources } from "./curriculum/history.js";

export { demoMathCourse, demoMathTopics } from "./curriculum/math.js";
export { demoHistoryCourse, demoHistoryTopics } from "./curriculum/history.js";
export { CURRICULUM_DEMO_NOW } from "./curriculum/sources.js";
const sources = [...demoMathSources, ...demoHistorySources];
/** Separate from existing planet fixtures; no student mastery or unlock state. */
export const demoCurriculum = curriculumDatasetSchema.parse({
  courses: [demoMathCourse, demoHistoryCourse],
  topics: [...demoMathTopics, ...demoHistoryTopics],
  materials: sources.map((item) => item.material),
  chunks: sources.flatMap((item) => item.chunks),
});
