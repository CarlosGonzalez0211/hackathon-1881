import type { CurriculumTopicSummary, StudentMasterySnapshot } from "@athena/shared";

/**
 * What World reads from the other subsystems. Each owner replaces the mock in mock-ports.ts
 * with a real implementation; World and the 3D engine do not change.
 * Contracts: docs/contracts/P1-curriculum-world.md, docs/contracts/P2-learning-world.md.
 */

/** P1 Curriculum. Real: `GET /api/courses/:courseId/topics` or a direct repository call. */
export interface CurriculumTopicPort {
  /** All topics of the course; World filters `published` itself. Empty for an unknown course. */
  listTopics(courseId: string): Promise<CurriculumTopicSummary[]>;
}

/** P2 Learning. Real: `GET /api/learning/student/:studentId/mastery`. Read-only for World. */
export interface MasteryReadPort {
  getStudentMastery(studentId: string, topicIds: string[]): Promise<StudentMasterySnapshot>;
}

export interface Enrollment {
  studentId: string;
  classId: string;
  courseId: string;
}

/** P4 Platform. Real: class_enrollments joined with classes. */
export interface EnrollmentPort {
  /** Null when the student is unknown or not enrolled (World answers 404). */
  getEnrollment(studentId: string): Promise<Enrollment | null>;
  /** Null when the class is unknown. */
  listStudents(classId: string): Promise<string[] | null>;
}

export interface WorldPorts {
  curriculum: CurriculumTopicPort;
  mastery: MasteryReadPort;
  enrollment: EnrollmentPort;
}
