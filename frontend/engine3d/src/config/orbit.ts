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
 * Class orbit layout (task 9). Planets share rings so the sky stays readable at any class
 * size: up to four students each get their own ring; from five, two students share a ring
 * on opposite sides (same speed, so they never meet); large classes fill at most eight rings.
 * Fewer rings mean fewer path lines and room for larger planets.
 */
export const orbitLayout = {
  sunHeight: 2.5,
  baseRadius: 2.9,
  radiusStep: 1.9,
  maxRings: 8,
  tilts: [0.12, -0.18, 0.08, -0.12, 0.2, -0.07, 0.15, -0.22],
  heights: [0.1, -0.15, 0.25, -0.05, 0.3, -0.25, 0.05, -0.1],
  /** Starting angle of ring r: `r × 2.39 + 0.6` (golden-angle spread). */
  phaseStep: 2.39,
  phaseOffset: 0.6,
  /** Planet scale (kit units) with no demonstrated topic, and per demonstrated topic. */
  scaleBase: 0.42,
  scalePerTopic: 0.07,
  scaleMax: 0.85,
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
  readonly ring: number;
  readonly radius: number;
  readonly tilt: number;
  readonly height: number;
  readonly phase: number;
}

/** How many rings a class of `count` students uses, and how many planets share each. */
export function orbitRings(count: number) {
  const students = Math.max(1, Math.floor(count));
  const rings =
    students <= 4 ? students : Math.min(orbitLayout.maxRings, Math.max(4, Math.ceil(students / 2)));
  return { rings, perRing: Math.ceil(students / rings) };
}

/** Radius of ring `r`. */
export const ringRadius = (ring: number) => orbitLayout.baseRadius + ring * orbitLayout.radiusStep;

/**
 * Orbit of the i-th student in a class of `count` (deterministic: same roster order, same
 * sky). Consecutive students land on different rings; students sharing a ring are evenly
 * spaced around it and inherit its tilt and height, so they ride the same path.
 */
export function orbitSlot(index: number, count = 8): OrbitSlot {
  const { rings, perRing } = orbitRings(count);
  const ring = index % rings;
  const seat = Math.floor(index / rings);
  const k = ring % orbitLayout.tilts.length;
  return {
    ring,
    radius: ringRadius(ring),
    tilt: orbitLayout.tilts[k]!,
    height: orbitLayout.heights[k]!,
    phase: ring * orbitLayout.phaseStep + orbitLayout.phaseOffset + (seat * Math.PI * 2) / perRing,
  };
}

/** Outermost ring radius for a class: the camera frames the system around it. */
export const orbitExtent = (count: number) => ringRadius(orbitRings(count).rings - 1);

/** Planets shrink a little in crowded rings (three or more per ring), never below 70%. */
export const crowdScale = (count: number) =>
  Math.max(0.7, Math.min(1, 2 / orbitRings(count).perRing));

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
