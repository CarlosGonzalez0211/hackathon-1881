/** True unless NEXT_PUBLIC_USE_MOCKS=false. Feature clients pick Mock or Api from this. */
export const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";

/** DEV ONLY: skip Supabase sign-in and act as the demo user (pairs with ATHENA_DEV_BYPASS_AUTH). */
export const bypassAuth = useMocks || process.env.NEXT_PUBLIC_BYPASS_AUTH === "true";
