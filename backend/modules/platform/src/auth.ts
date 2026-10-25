import { athenaDemoIds, athenaDemoProfessor, type AuthContext } from "@athena/shared";

/** Resolves a bearer token (or nothing) into who is calling. */
export interface AuthService {
  authenticate(token: string | undefined): Promise<AuthContext>;
}

/** Decides what an authenticated caller may touch. Modules call this before reading data. */
export interface AuthorizationService {
  /** Member of the class: its professor, an enrolled student, or an admin. */
  canAccessClass(context: AuthContext, classId: string): boolean;
  /** Teaches the class (or is an admin): analytics, interventions and roster management. */
  canManageClass(context: AuthContext, classId: string): boolean;
  canAccessCourse(context: AuthContext, courseId: string): boolean;
  canAccessStudent(context: AuthContext, studentId: string): boolean;
}

/** The demo professor, who can see the demo class. */
export const demoProfessorContext: AuthContext = {
  userId: athenaDemoIds.professorRuiz,
  displayName: athenaDemoProfessor.displayName,
  role: "admin",
  classIds: [athenaDemoIds.class],
  courseIds: [athenaDemoIds.course],
  studentIds: Object.values(athenaDemoIds.students),
};

/**
 * STUB: every caller is the demo professor. Replaced by Supabase token verification with
 * the same interface once auth lands. Never ship this behind real data.
 */
export class AllowAllAuthService implements AuthService {
  constructor(private readonly context: AuthContext = demoProfessorContext) {}

  async authenticate(): Promise<AuthContext> {
    return this.context;
  }
}

/** STUB: allows everything. Replaced by role and class-membership checks. */
export class AllowAllAuthorizationService implements AuthorizationService {
  canAccessClass() {
    return true;
  }
  canManageClass() {
    return true;
  }
  canAccessCourse() {
    return true;
  }
  canAccessStudent() {
    return true;
  }
}
