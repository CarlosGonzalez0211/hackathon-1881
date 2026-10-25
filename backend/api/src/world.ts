import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import {
  WorldService,
  createMockWorldPorts,
  type Enrollment,
  type EnrollmentPort,
  type WorldRoutesOptions,
} from "@athena/world";
import { env } from "./env.js";
import { supabaseAdmin } from "./lib.js";
import { fetchAll } from "./supabase-paging.js";

const enrollmentRow = z.object({
  class_id: z.string(),
  classes: z.object({ course_id: z.string() }),
});
const studentRow = z.object({ student_id: z.string() });

/** Active rows of `class_enrollments`, read with the service role. */
export class SupabaseEnrollmentPort implements EnrollmentPort {
  constructor(private readonly client: SupabaseClient) {}

  /** The student's most recent active class; null when unknown or not enrolled. */
  async getEnrollment(studentId: string): Promise<Enrollment | null> {
    const { data, error } = await this.client
      .from("class_enrollments")
      .select("class_id, classes!class_enrollments_class_id_fkey(course_id)")
      .eq("student_id", studentId)
      .eq("status", "active")
      .order("enrolled_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(`Supabase query failed: ${error.message}`);
    if (!data) return null;
    const row = enrollmentRow.parse(data);
    return { studentId, classId: row.class_id, courseId: row.classes.course_id };
  }

  /** Active student ids; null when the class does not exist. */
  async listStudents(classId: string): Promise<string[] | null> {
    const found = await this.client.from("classes").select("id").eq("id", classId).maybeSingle();
    if (found.error) throw new Error(`Supabase query failed: ${found.error.message}`);
    if (!found.data) return null;
    const rows = z
      .array(studentRow)
      .parse(
        await fetchAll((from, to) =>
          this.client
            .from("class_enrollments")
            .select("student_id")
            .eq("class_id", classId)
            .eq("status", "active")
            .order("student_id")
            .range(from, to),
        ),
      );
    return rows.map((row) => row.student_id);
  }
}

/**
 * Empty in mock mode (demo fixtures). Real mode reads enrollment from Supabase; curriculum
 * and mastery stay on their mock ports until the Curriculum and Learning owners ship real ones.
 */
export function worldOptionsFor(mode = env.ATHENA_DATA_MODE): WorldRoutesOptions {
  if (mode !== "real") return {};
  const ports = {
    ...createMockWorldPorts(),
    enrollment: new SupabaseEnrollmentPort(supabaseAdmin()),
  };
  return { service: new WorldService({ ports }), demoControls: false };
}
