/**
 * Where a topic house stands near its anchor.
 *
 * The six topic anchors are NPC spawn points (config/world.ts), not building origins, so a
 * house cannot sit on the anchor itself. The search walks rings around the anchor on the
 * planet surface and keeps the first spot that is flat ground on the original collision
 * mesh, roughly level with the anchor, and clear of walls and overhangs for the whole
 * footprint. Pure: the caller injects the raycast (Three.js + the legacy collider).
 */
export type Vec3 = readonly [number, number, number];
export interface RayHit {
  readonly point: Vec3;
  /** Surface normal at the hit (world space). */
  readonly normal: Vec3;
  readonly distance: number;
}
export type Raycast = (origin: Vec3, direction: Vec3, far: number) => RayHit | undefined;

export interface SiteOptions {
  /** Half extents of the footprint (m, legacy units): across and along the door axis. */
  readonly halfWidth: number;
  readonly halfDepth: number;
  /** Height that must be free of walls and overhangs. */
  readonly height: number;
  /** Ring radii tried in order (m). */
  readonly radii?: readonly number[];
  /** Directions tried per ring. */
  readonly steps?: number;
  /** Minimum cos(angle) between the ground normal and the planet normal. */
  readonly flatness?: number;
  /** Maximum height difference to the anchor's ground (m). */
  readonly maxStep?: number;
  /** Called with the reason each candidate was rejected (diagnostics). */
  readonly onReject?: (reason: RejectReason) => void;
}
export type RejectReason = "no-ground" | "slope" | "level" | "footprint" | "walls";
export interface HouseSite {
  /** Ground point under the house's base centre. */
  readonly position: Vec3;
  /** Planet normal at the site. */
  readonly up: Vec3;
  /** Unit tangent pointing from the house towards the anchor (the door side). */
  readonly forward: Vec3;
  readonly distanceToAnchor: number;
  /** False when no fully clear spot existed and this is the least obstructed one. */
  readonly clear: boolean;
}

const add = (a: Vec3, b: Vec3, s = 1): Vec3 => [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s];
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const length = (a: Vec3) => Math.hypot(a[0], a[1], a[2]);
const normalize = (a: Vec3): Vec3 => {
  const l = length(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const neg = (a: Vec3): Vec3 => [-a[0], -a[1], -a[2]];

/** Two unit tangents perpendicular to `up`. */
export function tangentFrame(up: Vec3): [Vec3, Vec3] {
  let a = cross([0, 1, 0], up);
  if (length(a) < 1e-6) a = [1, 0, 0];
  a = normalize(a);
  return [a, normalize(cross(up, a))];
}

/** Ground under `point` along the planet normal (cast from `lift` above). */
export function groundBelow(raycast: Raycast, point: Vec3, lift = 6) {
  const up = normalize(point);
  return raycast(add(point, up, lift), neg(up), lift * 2 + 4);
}

/**
 * Nearest fully clear site, ring by ring. When none is clear, the least obstructed
 * candidate (most footprint samples on level ground, fewest wall hits) is returned with
 * `clear: false`, so a dense spot still gets a plausible house and a logged warning.
 */
export function findHouseSite(
  anchor: Vec3,
  raycast: Raycast,
  options: SiteOptions,
): HouseSite | undefined {
  const {
    halfWidth,
    halfDepth,
    height,
    radii = [4, 5, 6, 7, 8, 9, 10],
    steps = 24,
    flatness = 0.85,
    maxStep = 1.5,
    onReject,
  } = options;
  const anchorGround = groundBelow(raycast, anchor)?.point ?? anchor;
  const anchorRadius = length(anchorGround);
  const anchorUp = normalize(anchorGround);
  const [t1, t2] = tangentFrame(anchorUp);
  const reach = Math.hypot(halfWidth, halfDepth);
  let best: { site: HouseSite; score: number } | undefined;
  for (const radius of radii) {
    for (let step = 0; step < steps; step++) {
      const angle = (step / steps) * Math.PI * 2;
      const guess = add(
        add(anchorGround, t1, Math.cos(angle) * radius),
        t2,
        Math.sin(angle) * radius,
      );
      const ground = groundBelow(raycast, guess);
      if (!ground) {
        onReject?.("no-ground");
        continue;
      }
      const up = normalize(ground.point);
      // abs: collision triangles are not consistently wound.
      if (Math.abs(dot(normalize(ground.normal), up)) < flatness) {
        onReject?.("slope");
        continue;
      }
      if (Math.abs(length(ground.point) - anchorRadius) > maxStep) {
        onReject?.("level");
        continue;
      }
      // Door faces the anchor.
      const toAnchor = sub(anchorGround, ground.point);
      const forward = normalize(add(toAnchor, up, -dot(toAnchor, up)));
      const side = normalize(cross(up, forward));
      const footprint = measureFootprint(
        raycast,
        ground.point,
        up,
        forward,
        side,
        halfWidth,
        halfDepth,
        height,
        reach,
      );
      const site: HouseSite = {
        // On the lowest level ground under the footprint: no corner floats.
        position: [up[0] * footprint.lowest, up[1] * footprint.lowest, up[2] * footprint.lowest],
        up,
        forward,
        distanceToAnchor: length(sub(ground.point, anchorGround)),
        clear: footprint.clear,
      };
      if (footprint.clear) return site;
      onReject?.(footprint.blocked < footprint.samples ? "walls" : "footprint");
      // Prefer level samples, penalise walls, and mildly prefer closer rings.
      const score = footprint.level - 3 * footprint.walls - radius * 0.1;
      if (!best || score > best.score) best = { site, score };
    }
  }
  return best?.site;
}

/** Grid resolution of the footprint test (samples per side). */
export const FOOTPRINT_SAMPLES = 7;
/**
 * Largest bump (m) tolerated under the footprint. The house base drops to the lowest
 * sample, so the kit's stone plinth absorbs kerbs and gentle slopes; props, rails and
 * steps taller than this reject the spot.
 */
export const FOOTPRINT_TOLERANCE = 0.6;

function measureFootprint(
  raycast: Raycast,
  base: Vec3,
  up: Vec3,
  forward: Vec3,
  side: Vec3,
  halfWidth: number,
  halfDepth: number,
  height: number,
  reach: number,
) {
  // Drop a grid of rays from above the roofline: each should land on ground level with the
  // base. Anything in between (overhangs, railings, fences, props, steps) is hit first.
  const baseRadius = length(base);
  const samples = FOOTPRINT_SAMPLES * FOOTPRINT_SAMPLES;
  let lowest = baseRadius;
  let level = 0;
  for (let i = 0; i < FOOTPRINT_SAMPLES; i++)
    for (let j = 0; j < FOOTPRINT_SAMPLES; j++) {
      const u = (i / (FOOTPRINT_SAMPLES - 1)) * 2 - 1;
      const v = (j / (FOOTPRINT_SAMPLES - 1)) * 2 - 1;
      const column = add(add(base, side, u * halfWidth), forward, v * halfDepth);
      const top = add(column, up, height + 1);
      const hit = raycast(top, neg(up), height + 3);
      if (!hit || Math.abs(length(hit.point) - baseRadius) > FOOTPRINT_TOLERANCE) continue;
      level++;
      lowest = Math.min(lowest, length(hit.point));
    }
  // No walls across the footprint (vertical posts can slip between grid columns). Rays
  // start above the footprint tolerance so rising ground inside it is not a "wall".
  let walls = 0;
  for (const h of [FOOTPRINT_TOLERANCE + 0.6, height * 0.5, height * 0.9]) {
    const origin = add(base, up, h);
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2;
      const direction = normalize(add(add([0, 0, 0], side, Math.cos(a)), forward, Math.sin(a)));
      if (raycast(origin, direction, reach)) walls++;
    }
  }
  return {
    clear: level === samples && walls === 0,
    level,
    walls,
    samples,
    blocked: samples - level,
    lowest,
  };
}
