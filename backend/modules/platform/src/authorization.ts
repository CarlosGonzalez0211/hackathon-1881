import type { AuthContext } from "@athena/shared";
import type { AuthorizationService } from "./auth.js";

/**
 * Role and membership checks driven entirely by the AuthContext lists, so decisions are
 * pure and testable.
 *
 * - admin: everything.
 * - professor: their classes, those classes' courses and the students enrolled in them.
 * - student: classes they are enrolled in, those courses, and only themselves.
 */
export class RoleAuthorizationService implements AuthorizationService {
  canAccessClass(context: AuthContext, classId: string) {
    return context.role === "admin" || context.classIds.includes(classId);
  }

  canManageClass(context: AuthContext, classId: string) {
    return (
      context.role === "admin" ||
      (context.role === "professor" && context.classIds.includes(classId))
    );
  }

  canAccessCourse(context: AuthContext, courseId: string) {
    return context.role === "admin" || context.courseIds.includes(courseId);
  }

  canAccessStudent(context: AuthContext, studentId: string) {
    return context.role === "admin" || context.studentIds.includes(studentId);
  }
}
