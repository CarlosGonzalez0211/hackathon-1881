import type { AuthContext } from "@athena/shared";

/** Where each role lands after signing in. Students play; staff see their classes. */
export function homeFor(role: AuthContext["role"]): "/world" | "/educator" {
  return role === "student" ? "/world" : "/educator";
}
