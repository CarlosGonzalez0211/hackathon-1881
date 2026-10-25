import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import {
  notAStudent,
  notFound,
  type EnrolledStudent,
  type EnrollmentRegistry,
} from "@athena/platform";
import { fetchAll } from "./supabase-paging.js";

const rosterRow = z.object({
  profiles: z.object({ id: z.string(), display_name: z.string() }),
});

/** Reads and writes `class_enrollments` with the service role. Rows are kept when dropped. */
export class SupabaseEnrollmentRegistry implements EnrollmentRegistry {
  constructor(private readonly client: SupabaseClient) {}

  async roster(classId: string): Promise<EnrolledStudent[] | null> {
    if (!(await this.classExists(classId))) return null;
    const rows = z
      .array(rosterRow)
      .parse(
        await fetchAll((from, to) =>
          this.client
            .from("class_enrollments")
            .select("profiles!class_enrollments_student_id_fkey(id, display_name)")
            .eq("class_id", classId)
            .eq("status", "active")
            .order("student_id")
            .range(from, to),
        ),
      );
    return rows.map((row) => ({
      studentId: row.profiles.id,
      displayName: row.profiles.display_name,
    }));
  }

  async enroll(classId: string, studentId: string) {
    if (!(await this.classExists(classId))) throw notFound("Class", classId);
    const { data, error } = await this.client
      .from("profiles")
      .select("id, role")
      .eq("id", studentId)
      .maybeSingle();
    if (error) throw new Error(`Supabase query failed: ${error.message}`);
    if (!data) throw notFound("Student", studentId);
    // Professors and admins are never enrolled as students: that would give them student access.
    if (data.role !== "student") throw notAStudent(studentId);
    const write = await this.client
      .from("class_enrollments")
      .upsert(
        { class_id: classId, student_id: studentId, status: "active" },
        { onConflict: "class_id,student_id" },
      );
    if (write.error) throw new Error(`Supabase write failed: ${write.error.message}`);
  }

  async drop(classId: string, studentId: string) {
    const { error } = await this.client
      .from("class_enrollments")
      .update({ status: "dropped" })
      .eq("class_id", classId)
      .eq("student_id", studentId);
    if (error) throw new Error(`Supabase write failed: ${error.message}`);
  }

  private async classExists(classId: string) {
    const { data, error } = await this.client
      .from("classes")
      .select("id")
      .eq("id", classId)
      .maybeSingle();
    if (error) throw new Error(`Supabase query failed: ${error.message}`);
    return Boolean(data);
  }
}
