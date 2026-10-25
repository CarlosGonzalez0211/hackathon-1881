import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { interventionStatusSchema, type InterventionStatus } from "@athena/shared";
import type {
  AnalyticsRoutesOptions,
  ClassRoster,
  InterventionStatusStore,
  RosterProvider,
} from "@athena/analytics";
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

const statusRow = z.object({ intervention_id: z.string(), status: interventionStatusSchema });

/** Acknowledge/resolve decisions in `intervention_status` (migration 0401), service role only. */
export class SupabaseInterventionStatusStore implements InterventionStatusStore {
  constructor(private readonly client: SupabaseClient) {}

  async statuses(classId: string) {
    const { data, error } = await this.client
      .from("intervention_status")
      .select("intervention_id, status")
      .eq("class_id", classId);
    if (error) throw new Error(`Supabase query failed: ${error.message}`);
    return new Map(
      z
        .array(statusRow)
        .parse(data ?? [])
        .map((row): [string, InterventionStatus] => [row.intervention_id, row.status]),
    );
  }

  async set(classId: string, interventionId: string, status: InterventionStatus, actorId: string) {
    const { error } = await this.client.from("intervention_status").upsert({
      class_id: classId,
      intervention_id: interventionId,
      status,
      updated_by: actorId,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(`Supabase write failed: ${error.message}`);
  }
}

/** Empty in mock mode, so the analytics module keeps its demo roster and in-memory statuses. */
export function analyticsOptionsFor(mode = env.ATHENA_DATA_MODE): AnalyticsRoutesOptions {
  if (mode !== "real") return {};
  const client = supabaseAdmin();
  return {
    rosters: supabaseRosterProvider(client),
    statusStore: new SupabaseInterventionStatusStore(client),
  };
}
