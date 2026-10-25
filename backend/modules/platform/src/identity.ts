import { roleSchema, type AuthContext, type Role } from "@athena/shared";
import type { AuthService } from "./auth.js";
import { forbidden, unauthorized } from "./errors.js";

/** Proves who a bearer token belongs to. The Supabase version calls `auth.getUser(token)`. */
export interface TokenVerifier {
  verify(token: string): Promise<{ authUserId: string } | null>;
}

export interface ProfileRecord {
  id: string;
  authUserId: string;
  role: Role;
  displayName: string;
}

/** What the caller is connected to once their profile is known. */
export interface Memberships {
  classIds: string[];
  courseIds: string[];
  studentIds: string[];
}

/** Profile and class membership lookups. The Supabase version reads `profiles`, `classes`, `class_enrollments`. */
export interface IdentityDirectory {
  findProfileByAuthUser(authUserId: string): Promise<ProfileRecord | null>;
  membershipsFor(profile: ProfileRecord): Promise<Memberships>;
}

/**
 * Real AuthService: token -> verified auth user -> profile -> memberships. The role always
 * comes from the profile row (set by the service role), never from the token or request.
 */
export class DirectoryAuthService implements AuthService {
  constructor(
    private readonly verifier: TokenVerifier,
    private readonly directory: IdentityDirectory,
  ) {}

  async authenticate(token: string | undefined): Promise<AuthContext> {
    if (!token) throw unauthorized("Authentication required");
    const verified = await this.verifier.verify(token);
    if (!verified) throw unauthorized("Invalid or expired session");
    const profile = await this.directory.findProfileByAuthUser(verified.authUserId);
    if (!profile) throw forbidden("No profile exists for this account");
    const memberships = await this.directory.membershipsFor(profile);
    return {
      userId: profile.id,
      displayName: profile.displayName,
      role: roleSchema.parse(profile.role),
      ...memberships,
    };
  }
}

/** Test and local-dev verifier: a fixed token -> auth user table. */
export class StaticTokenVerifier implements TokenVerifier {
  constructor(private readonly tokens: Record<string, string>) {}

  async verify(token: string) {
    const authUserId = this.tokens[token];
    return authUserId ? { authUserId } : null;
  }
}

export interface InMemoryClass {
  id: string;
  courseId: string;
  professorId: string;
  studentIds: string[];
}

/** Test and local-dev directory seeded with plain objects. */
export class InMemoryIdentityDirectory implements IdentityDirectory {
  constructor(
    private readonly profiles: ProfileRecord[],
    private readonly classes: InMemoryClass[],
  ) {}

  async findProfileByAuthUser(authUserId: string) {
    return this.profiles.find((profile) => profile.authUserId === authUserId) ?? null;
  }

  async membershipsFor(profile: ProfileRecord): Promise<Memberships> {
    const visible = this.classes.filter((cls) => {
      if (profile.role === "admin") return true;
      if (profile.role === "professor") return cls.professorId === profile.id;
      return cls.studentIds.includes(profile.id);
    });
    const studentIds =
      profile.role === "student"
        ? [profile.id]
        : [...new Set(visible.flatMap((cls) => cls.studentIds))];
    return {
      classIds: visible.map((cls) => cls.id),
      courseIds: [...new Set(visible.map((cls) => cls.courseId))],
      studentIds,
    };
  }
}
