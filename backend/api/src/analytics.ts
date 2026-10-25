import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { ClassRoster, RosterProvider } from "@athena/analytics";
import { env } from "./env.js";
import { supabaseAdmin } from "./lib.js";

const classRow = z.object({ id: z.string(), course_id: z.string() });
const enrollmentRow = z.object({
  profiles: z.object({ id: z.string(), display_name: z.string() }),
});

export type TopicCatalog = (courseId: string) => Promise<ClassRoster["topics"]>;

/**
 * Class members from `classes`, `class_enrollments` and `profiles`. Topic titles come from the
 * curriculum module; until its tables exist the default catalog is empty, so the dashboard
 * shows students but no topic rows rather than inventing any.
 */
export function supabaseRosterProvider(
  client: SupabaseClient,
  topics: TopicCatalog = async () => [],
): RosterProvider {
  return async (classId) => {
    const found = await client
      .from("classes")
      .select("id, course_id")
      .eq("id", classId)
      .maybeSingle();
    if (found.error) throw new Error(`Supabase query failed: ${found.error.message}`);
    if (!found.data) return null;
    const klass = classRow.parse(found.data);
    const members = await client
      .from("class_enrollments")
      .select("profiles!class_enrollments_student_id_fkey(id, display_name)")
      .eq("class_id", classId)
      .eq("status", "active");
    if (members.error) throw new Error(`Supabase query failed: ${members.error.message}`);
    return {
      classId: klass.id,
      courseId: klass.course_id,
      students: z
        .array(enrollmentRow)
        .parse(members.data ?? [])
        .map((row) => ({ id: row.profiles.id, displayName: row.profiles.display_name })),
      topics: await topics(klass.course_id),
    };
  };
}

/** Undefined keeps the analytics module's demo roster (mock mode). */
export function rosterProviderFor(mode = env.ATHENA_DATA_MODE): RosterProvider | undefined {
  return mode === "real" ? supabaseRosterProvider(supabaseAdmin()) : undefined;
}
