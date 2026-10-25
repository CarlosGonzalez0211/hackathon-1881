"use client";
import { bypassAuth } from "@/lib/mode";
import { supabaseBrowser } from "@/lib/supabase";
import { HttpHouseContentClient } from "./http-house-content-client";

let client: HttpHouseContentClient | undefined;
/** Material content always uses the authenticated API, independently of World's mock mode. */
export function getHouseContentClient(): HttpHouseContentClient {
  client ??= new HttpHouseContentClient({
    apiOrigin: process.env.NEXT_PUBLIC_API_URL ?? "",
    async getAccessToken() {
      // DEV ONLY: the API ignores tokens under ATHENA_DEV_BYPASS_AUTH; any non-empty value passes.
      if (bypassAuth) return "dev-bypass";
      try {
        const { data } = await supabaseBrowser().auth.getSession();
        return data.session?.access_token ?? null;
      } catch {
        return null;
      }
    },
  });
  return client;
}
