import { athenaBrand } from "@athena/brand";

/** Student planet looks shipped in the kit (`athena-planet-<kind>.glb`). */
export const planetKinds = [
  "earth",
  "rocky",
  "moon",
  "gas",
  "ringed",
  "ice",
  "ocean",
  "desert",
] as const;
export type PlanetKind = (typeof planetKinds)[number];

/**
 * Class orbit layout (task 9), from the kit's reference `athena-orbit-class.glb`
 * (athena-models.js `orbitSystem`): student i circles the teacher sun at radius
 * `2 + i × 1.15` kit metres, with its own tilt and height offset. Students past the eighth
 * reuse the pattern on wider rings.
 */
export const orbitLayout = {
  sunHeight: 2.5,
  baseRadius: 2,
  radiusStep: 1.15,
  tilts: [0.12, -0.18, 0.08, -0.12, 0.2, -0.07, 0.15, -0.22],
  heights: [0.1, -0.15, 0.25, -0.05, 0.3, -0.25, 0.05, -0.1],
  /** Starting angle of student i: `i × 2.39 + 0.6` (golden-angle spread). */
  phaseStep: 2.39,
  phaseOffset: 0.6,
  /** Planet scale (kit units) with no demonstrated topic, and per demonstrated topic. */
  scaleBase: 0.22,
  scalePerTopic: 0.05,
  scaleMax: 0.6,
  /** Orbital speed (rad/s at the innermost ring; outer rings are slower). */
  speed: 0.12,
  /** Self rotation (rad/s). */
  spin: 0.25,
  /** Default planet look; a class may choose others (OrbitOptions.planetKind). */
  defaultKind: "earth" as PlanetKind,
  background: athenaBrand.colors.dusk,
  orbitPath: athenaBrand.colors.border,
} as const;

export interface OrbitSlot {
  readonly radius: number;
  readonly tilt: number;
  readonly height: number;
  readonly phase: number;
}

/** Orbit of the i-th student (deterministic: same class order, same sky). */
export function orbitSlot(index: number): OrbitSlot {
  const k = index % orbitLayout.tilts.length;
  return {
    radius: orbitLayout.baseRadius + index * orbitLayout.radiusStep,
    tilt: orbitLayout.tilts[k]!,
    height: orbitLayout.heights[k]!,
    phase: index * orbitLayout.phaseStep + orbitLayout.phaseOffset,
  };
}

/**
 * Planet size from demonstrated topics (houses whose status is `done`): teacher-authorised
 * evidence only, never time or clicks.
 */
export function planetScale(demonstratedTopics: number) {
  return Math.min(
    orbitLayout.scaleMax,
    orbitLayout.scaleBase + Math.max(0, demonstratedTopics) * orbitLayout.scalePerTopic,
  );
}
