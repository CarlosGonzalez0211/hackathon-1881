import type { AuthContext } from "@athena/shared";
import { notFound, PlatformError, type ClassCatalog } from "@athena/platform";
import type { CurriculumCatalogPort } from "./ports.js";

export const badRequest = (message: string) => new PlatformError(message, 400);

/** The class's course, from the classes the caller can see. */
export async function courseOfClass(classes: ClassCatalog, context: AuthContext, classId: string) {
  const found = (await classes.listFor(context)).find((item) => item.id === classId);
  if (!found) throw notFound("Class", classId);
  return found.courseId;
}

/** Topics must belong to the class's course in the curriculum catalog. */
export async function assertTopicsInCourse(
  catalog: CurriculumCatalogPort,
  courseId: string,
  topicIds: string[],
) {
  if (topicIds.length === 0) return;
  const known = new Set((await catalog.listTopics(courseId)).map((topic) => topic.id));
  const unknown = topicIds.filter((id) => !known.has(id));
  if (unknown.length > 0) throw badRequest(`Unknown topic for this course: ${unknown.join(", ")}`);
}
