// Origin of the API. Locally http://localhost:4000; empty on Vercel (same origin, /api/* is routed).
const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? "";

/** Typed fetch helper for apps/api. `path` is relative to /api, e.g. api("/health"). */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_ORIGIN}/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}
