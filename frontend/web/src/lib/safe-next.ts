/** Returns `next` only if it is a same-origin relative path; otherwise `fallback`. */
export function safeNextPath(next: string | null | undefined, fallback = "/"): string {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  for (const ch of next) {
    if (ch === "\\" || ch.charCodeAt(0) < 0x20) return fallback;
  }
  return next;
}
