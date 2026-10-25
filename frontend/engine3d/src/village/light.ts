import { add, cross, mul, norm, type Vec } from "./layout";

/**
 * One golden-hour sun shared by the sky, the shadow light, the god rays, the haze and the
 * painterly materials. It hangs low ahead of the student, so walking is always gently
 * backlit: rims glow, shadows fall towards the camera and the sky blooms around the sun.
 */
export function sunDirection(up: Vec, forward: Vec): Vec {
  const right = norm(cross(forward, up));
  return norm(add(add(mul(up, 0.3), mul(forward, 0.86)), mul(right, -0.36)));
}

/** Warm key, cool sky fill and grass bounce. Values are linear and feed HDR bloom. */
export const LUMINOUS = {
  sun: "#ffd2a1",
  sunIntensity: 3.1,
  sky: "#9fd1e8",
  ground: "#d8b07a",
  rim: "#ffe4bd",
  shadow: "#6f78b8",
  haze: "#cfe3ea",
  hazeSun: "#ffd9a8",
} as const;

export type QualityTier = "high" | "low";

/** URL override (`?quality=low|high`), then a conservative device heuristic. */
export function detectTier(): QualityTier {
  try {
    const forced = new URLSearchParams(window.location.search).get("quality");
    if (forced === "low" || forced === "high") return forced;
  } catch {
    // Non-browser hosts fall through to the heuristic.
  }
  const nav = typeof navigator === "undefined" ? undefined : navigator;
  const cores = nav?.hardwareConcurrency ?? 4;
  const coarse = typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches;
  const memory = (nav as { deviceMemory?: number } | undefined)?.deviceMemory ?? 8;
  return coarse || cores < 6 || memory < 4 ? "low" : "high";
}
