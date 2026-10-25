import { athenaDemoIds } from "@athena/shared";
import { PlatformError, notFound } from "./errors.js";

export interface EnrolledStudent {
  studentId: string;
  displayName: string;
}

/**
 * Who is in a class. Writes only change `class_enrollments`; memberships are read again on every
 * request, so a change applies to the student's next call without signing out.
 */
export interface EnrollmentRegistry {
  /** Active students; null when the class does not exist. */
  roster(classId: string): Promise<EnrolledStudent[] | null>;
  /** Idempotent. Re-enrolls a dropped student. Rejects ids that are not student profiles. */
  enroll(classId: string, studentId: string): Promise<void>;
  /** Idempotent. Marks the enrollment dropped; history is kept. */
  drop(classId: string, studentId: string): Promise<void>;
}

/** Mock-mode registry seeded with the demo roster. */
export class InMemoryEnrollmentRegistry implements EnrollmentRegistry {
  private readonly classes = new Map<string, Map<string, string>>();

  constructor(
    seed: { classId: string; students: EnrolledStudent[] }[] = [
      {
        classId: athenaDemoIds.class,
        students: Object.entries(athenaDemoIds.students).map(([key, studentId]) => ({
          studentId,
          displayName: key,
        })),
      },
    ],
  ) {
    for (const { classId, students } of seed)
      this.classes.set(classId, new Map(students.map((s) => [s.studentId, s.displayName])));
  }

  async roster(classId: string) {
    const members = this.classes.get(classId);
    if (!members) return null;
    return [...members].map(([studentId, displayName]) => ({ studentId, displayName }));
  }

  async enroll(classId: string, studentId: string) {
    const members = this.classes.get(classId);
    if (!members) throw notFound("Class", classId);
    if (!members.has(studentId)) members.set(studentId, studentId);
  }

  async drop(classId: string, studentId: string) {
    const members = this.classes.get(classId);
    if (!members) throw notFound("Class", classId);
    members.delete(studentId);
  }
}

export const notAStudent = (studentId: string) =>
  new PlatformError(`Not a student profile: ${studentId}`, 400);
