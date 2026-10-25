import {
  AllowAllAuthService,
  AllowAllAuthorizationService,
  DirectoryAuthService,
  RoleAuthorizationService,
  type PlatformServices,
} from "@athena/platform";
import { env } from "./env.js";
import { supabaseAdmin } from "./lib.js";
import { SupabaseEnrollmentRegistry } from "./supabase-enrollments.js";
import {
  SupabaseClassCatalog,
  SupabaseIdentityDirectory,
  SupabaseTokenVerifier,
} from "./supabase-identity.js";

/**
 * Platform services for the configured mode. Mock mode keeps the allow-all stubs (fixtures
 * only). Real mode needs Supabase credentials and uses token verification plus role checks;
 * missing credentials fail loudly at startup instead of silently falling back to the stub.
 */
export function platformServicesFor(mode = env.ATHENA_DATA_MODE): Partial<PlatformServices> {
  if (mode !== "real") return {};
  const client = supabaseAdmin();
  // ATHENA_DEV_BYPASS_AUTH: local demos against real data with no sign-in (app.ts refuses it in production).
  const bypass = env.ATHENA_DEV_BYPASS_AUTH;
  return {
    auth: bypass
      ? new AllowAllAuthService()
      : new DirectoryAuthService(
          new SupabaseTokenVerifier(client),
          new SupabaseIdentityDirectory(client),
        ),
    authorization: bypass ? new AllowAllAuthorizationService() : new RoleAuthorizationService(),
    classes: new SupabaseClassCatalog(client),
    enrollments: new SupabaseEnrollmentRegistry(client),
  };
}
