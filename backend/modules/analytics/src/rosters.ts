import { athenaDemoIds, demoClassAnalyticsMidSemester } from "@athena/shared";
import type { ClassRoster } from "./projection.js";

/** Where the projection learns class members and topic titles. Null means the class is unknown. */
export type RosterProvider = (classId: string) => Promise<ClassRoster | null>;

/** Demo class roster for mock mode, derived from the mid-semester fixture. */
export const demoRosterProvider: RosterProvider = async (classId) => {
  if (classId !== athenaDemoIds.class) return null;
  const story = demoClassAnalyticsMidSemester;
  return {
    classId: story.classId,
    courseId: story.courseId,
    students: story.students.map((s) => ({ id: s.studentId, displayName: s.displayName })),
    topics: story.topics.map((t) => ({ id: t.topicId, title: t.title })),
  };
};
