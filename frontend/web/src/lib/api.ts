import { useMocks } from "@/lib/mode";
import { supabaseBrowser } from "@/lib/supabase";

// Origin of the API. Locally http://localhost:4000; empty on Vercel (same origin, /api/* is routed).
const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? "";

/** Bearer header from the Supabase session. Browser + real mode only; never throws. */
async function authHeaders(): Promise<Record<string, string>> {
  if (useMocks || typeof window === "undefined") return {};
  try {
    const { data } = await supabaseBrowser().auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

/** Typed fetch helper for apps/api. `path` is relative to /api, e.g. api("/health"). */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const auth = await authHeaders();
  const res = await fetch(`${API_ORIGIN}/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...auth, ...init?.headers },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}
