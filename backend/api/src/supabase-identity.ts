import type { SupabaseClient } from "@supabase/supabase-js";
import { roleSchema, type AuthContext, type Class } from "@athena/shared";
import type {
  ClassCatalog,
  IdentityDirectory,
  Memberships,
  ProfileRecord,
  TokenVerifier,
} from "@athena/platform";
import { z } from "zod";
import { fetchAll } from "./supabase-paging.js";

/** Verifies a Supabase session token with the Auth server (also rejects revoked sessions). */
export class SupabaseTokenVerifier implements TokenVerifier {
  constructor(private readonly client: SupabaseClient) {}

  async verify(token: string) {
    const { data, error } = await this.client.auth.getUser(token);
    if (error || !data.user) return null;
    return { authUserId: data.user.id };
  }
}

const profileRow = z.object({
  id: z.string(),
  auth_user_id: z.string(),
  role: roleSchema,
  display_name: z.string(),
});
const classRow = z.object({ id: z.string(), course_id: z.string() });
const enrollmentRow = z.object({ class_id: z.string(), student_id: z.string() });

const classMetaRow = z.object({
  id: z.string(),
  course_id: z.string(),
  professor_id: z.string(),
  title: z.string(),
  term: z.string().nullable(),
  created_at: z.string(),
});

/** Class metadata for the caller's own class ids, from `classes`. */
export class SupabaseClassCatalog implements ClassCatalog {
  constructor(private readonly client: SupabaseClient) {}

  async listFor(context: AuthContext): Promise<Class[]> {
    if (!context.classIds.length) return [];
    const rows = z
      .array(classMetaRow)
      .parse(
        await fetchAll((from, to) =>
          this.client
            .from("classes")
            .select("id, course_id, professor_id, title, term, created_at")
            .in("id", context.classIds)
            .order("title")
            .order("id")
            .range(from, to),
        ),
      );
    return rows.map((row) => ({
      id: row.id,
      courseId: row.course_id,
      professorId: row.professor_id,
      title: row.title,
      ...(row.term ? { term: row.term } : {}),
      createdAt: new Date(row.created_at).toISOString(),
    }));
  }
}

function check<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(`Supabase query failed: ${result.error.message}`);
  return (result.data ?? []) as T;
}

/**
 * Reads `profiles`, `classes` and `class_enrollments` with the service-role client. Roles come
 * from the profile row, which only the service role can change.
 */
export class SupabaseIdentityDirectory implements IdentityDirectory {
  constructor(private readonly client: SupabaseClient) {}

  async findProfileByAuthUser(authUserId: string): Promise<ProfileRecord | null> {
    const { data, error } = await this.client
      .from("profiles")
      .select("id, auth_user_id, role, display_name")
      .eq("auth_user_id", authUserId)
      .maybeSingle();
    if (error) throw new Error(`Supabase query failed: ${error.message}`);
    if (!data) return null;
    const row = profileRow.parse(data);
    return {
      id: row.id,
      authUserId: row.auth_user_id,
      role: row.role,
      displayName: row.display_name,
    };
  }

  async membershipsFor(profile: ProfileRecord): Promise<Memberships> {
    if (profile.role === "student") {
      const enrollments = z
        .array(enrollmentRow)
        .parse(
          await fetchAll((from, to) =>
            this.client
              .from("class_enrollments")
              .select("class_id, student_id")
              .eq("student_id", profile.id)
              .eq("status", "active")
              .order("class_id")
              .range(from, to),
          ),
        );
      const classIds = enrollments.map((row) => row.class_id);
      return {
        classIds,
        courseIds: await this.courseIds(classIds),
        studentIds: [profile.id],
      };
    }

    const classes = z.array(classRow).parse(
      await fetchAll((from, to) => {
        const base = this.client.from("classes").select("id, course_id");
        return (profile.role === "admin" ? base : base.eq("professor_id", profile.id))
          .order("id")
          .range(from, to);
      }),
    );
    const classIds = classes.map((row) => row.id);
    const enrollments = classIds.length
      ? z
          .array(enrollmentRow)
          .parse(
            await fetchAll((from, to) =>
              this.client
                .from("class_enrollments")
                .select("class_id, student_id")
                .in("class_id", classIds)
                .eq("status", "active")
                .order("class_id")
                .order("student_id")
                .range(from, to),
            ),
          )
      : [];
    return {
      classIds,
      courseIds: [...new Set(classes.map((row) => row.course_id))],
      studentIds: [...new Set(enrollments.map((row) => row.student_id))],
    };
  }

  private async courseIds(classIds: string[]) {
    if (!classIds.length) return [];
    const classes = z
      .array(classRow)
      .parse(check(await this.client.from("classes").select("id, course_id").in("id", classIds)));
    return [...new Set(classes.map((row) => row.course_id))];
  }
}
