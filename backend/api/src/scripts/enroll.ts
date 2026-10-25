/**
 * Enrolls a student in a class from the terminal, for when the class has no UI yet:
 *
 *   pnpm --filter @athena/api enroll <class-id> <student-email>
 *   pnpm --filter @athena/api enroll <class-id> <student-email> --drop
 *
 * Uses the service role from the API's own environment (SUPABASE_URL and
 * SUPABASE_SERVICE_ROLE_KEY). The student must have signed in once so a profile exists.
 */
import { supabaseAdmin } from "../lib.js";
import { SupabaseEnrollmentRegistry } from "../supabase-enrollments.js";

const [classId, email, flag] = process.argv.slice(2);
if (!classId || !email) {
  console.error("Usage: enroll <class-id> <student-email> [--drop]");
  process.exit(1);
}

const client = supabaseAdmin();

async function findAuthUserId(address: string) {
  const wanted = address.trim().toLowerCase();
  for (let page = 1; ; page += 1) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`Could not list users: ${error.message}`);
    const match = data.users.find((user) => user.email?.toLowerCase() === wanted);
    if (match) return match.id;
    if (data.users.length < 1000) return null;
  }
}

const authUserId = await findAuthUserId(email);
if (!authUserId) {
  console.error(`No account with that email. The student has to sign in once first.`);
  process.exit(1);
}
const profile = await client
  .from("profiles")
  .select("id, display_name")
  .eq("auth_user_id", authUserId)
  .maybeSingle();
if (profile.error || !profile.data) {
  console.error("That account has no profile yet.");
  process.exit(1);
}

const registry = new SupabaseEnrollmentRegistry(client);
if (flag === "--drop") {
  await registry.drop(classId, profile.data.id);
  console.log(`Dropped ${profile.data.display_name} (${profile.data.id}) from ${classId}`);
} else {
  await registry.enroll(classId, profile.data.id);
  console.log(`Enrolled ${profile.data.display_name} (${profile.data.id}) in ${classId}`);
}
