import { useMocks } from "./mode";
import { supabaseBrowser } from "./supabase";

// Origin of the API. Locally http://localhost:4000; empty on Vercel (same origin, /api/* is routed).
const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? "";

/** Bearer header from the Supabase session. Browser + real mode only; never throws. */
export async function authHeaders(): Promise<Record<string, string>> {
  if (useMocks || typeof window === "undefined") return {};
  try {
    const { data } = await supabaseBrowser().auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

/** Authenticated request to the API, returning the raw response (status handling is the caller's). */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const auth = await authHeaders();
  return fetch(`${API_ORIGIN}/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...auth, ...init?.headers },
  });
}

/** Typed fetch helper for apps/api. `path` is relative to /api, e.g. api("/health"). */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, init);
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  // 204 No Content (deletes) has no body to parse.
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
