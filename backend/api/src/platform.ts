import {
  DirectoryAuthService,
  RoleAuthorizationService,
  type PlatformServices,
} from "@athena/platform";
import { env } from "./env.js";
import { supabaseAdmin } from "./lib.js";
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
  return {
    auth: new DirectoryAuthService(
      new SupabaseTokenVerifier(client),
      new SupabaseIdentityDirectory(client),
    ),
    authorization: new RoleAuthorizationService(),
    classes: new SupabaseClassCatalog(client),
  };
}
