/** Athena's authored globe. Rendering, navigation and placement use this same surface. */
export type Vec = readonly [number, number, number];
export const RADIUS = 22;
export const HOUSE_SCALE = 2.5;
export const HOUSE_FOOTPRINT = 4.05;
export const WATER_LEVEL = RADIUS - 0.12;
export const TAU = Math.PI * 2;
export const MERIDIAN = -0.3;
export const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const mul = (a: Vec, s: number): Vec => [a[0] * s, a[1] * s, a[2] * s];
export const cross = (a: Vec, b: Vec): Vec => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const norm = (a: Vec): Vec => mul(a, 1 / (Math.hypot(...a) || 1));
export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
export const direction = (longitude: number, latitude: number): Vec => [
  Math.cos(latitude) * Math.sin(longitude),
  Math.sin(latitude),
  Math.cos(latitude) * Math.cos(longitude),
];
export const arcDistance = (a: Vec, b: Vec) => Math.acos(clamp(dot(a, b), -1, 1)) * RADIUS;
export const mainLatitude = (lon: number) => 0.1 * Math.sin(lon * 3) + 0.04 * Math.sin(lon * 7);
export const riverLatitude = (lon: number) => 0.82 + 0.07 * Math.sin(lon * 2 + 1);
export const welcomeCenter = direction(-0.35, mainLatitude(-0.35));
export const inWelcomeCourtyard = (up: Vec) => arcDistance(up, welcomeCenter) < 5.5;
export const spawnDirection = direction(-0.18, mainLatitude(-0.18));

export const plots = Array.from({ length: 6 }, (_, slot) => {
  const lon = (slot * TAU) / 6;
  const side = slot % 2 === 0 ? 1 : -1;
  const lat = mainLatitude(lon) + side * 0.34;
  const up = direction(lon, lat);
  const towardPath = norm(
    add(direction(lon, mainLatitude(lon)), mul(up, -dot(direction(lon, mainLatitude(lon)), up))),
  );
  return { slot, lon, lat, up, forward: towardPath, radius: RADIUS + 0.23 };
});

/** Civic buildings form small neighbourhoods between the six academic landmarks. */
export const landmarks = [
  { id: "school-hall", lon: 0.48, lat: -0.52, scale: 1.35, footprint: 3.5 },
  { id: "library", lon: -0.62, lat: 0.29, scale: 1.45, footprint: 3.1 },
  { id: "greenhouse", lon: 0.65, lat: 0.43, scale: 1.4, footprint: 2.9 },
  { id: "workshop", lon: 2.65, lat: -0.53, scale: 1.4, footprint: 3.1 },
  { id: "observatory", lon: -2.4, lat: 1.2, scale: 1.8, footprint: 2.8 },
  { id: "cottage", lon: -0.65, lat: -0.42, scale: 1.55, footprint: 2.5 },
  { id: "cottage", lon: 1.95, lat: 1.2, scale: 1.55, footprint: 2.5 },
  { id: "cottage", lon: -2.55, lat: -0.66, scale: 1.55, footprint: 2.5 },
].map((item) => {
  const up = direction(item.lon, item.lat);
  return {
    ...item,
    scale: item.scale * 1.2,
    footprint: item.footprint * 1.2,
    up,
    forward: tangent(direction(item.lon, mainLatitude(item.lon)), up),
    radius: RADIUS + 0.23,
  };
});

/** Pole-safe tangent transport; no global-up lookAt or longitude singularity. */
export function tangent(v: Vec, up: Vec): Vec {
  const projected = add(v, mul(up, -dot(v, up)));
  if (Math.hypot(...projected) > 1e-7) return norm(projected);
  return norm(cross(Math.abs(up[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0], up));
}
export function advance(up: Vec, heading: Vec, meters: number): { up: Vec; heading: Vec } {
  const forward = tangent(heading, up);
  const angle = meters / RADIUS;
  return {
    up: norm(add(mul(up, Math.cos(angle)), mul(forward, Math.sin(angle)))),
    heading: norm(add(mul(forward, Math.cos(angle)), mul(up, -Math.sin(angle)))),
  };
}
export function pathDistance(up: Vec): number {
  const lon = Math.atan2(up[0], up[2]);
  const lat = Math.asin(clamp(up[1], -1, 1));
  // Main loop plus two pole-crossing great circles. Every hemisphere is connected.
  let distance = Math.min(
    Math.abs(lat - mainLatitude(lon)) * RADIUS,
    Math.abs(lat - 1.04) * RADIUS,
    Math.asin(Math.abs(up[0] * Math.cos(MERIDIAN) - up[2] * Math.sin(MERIDIAN))) * RADIUS,
    Math.asin(Math.abs(up[2])) * RADIUS,
  );
  for (const plot of [...plots, ...landmarks]) {
    const lonDelta = Math.atan2(Math.sin(lon - plot.lon), Math.cos(lon - plot.lon));
    const junction = plot.lat > riverLatitude(plot.lon) ? 1.04 : mainLatitude(plot.lon);
    const lo = Math.min(plot.lat, junction);
    const hi = Math.max(plot.lat, junction);
    if (lat >= lo && lat <= hi)
      distance = Math.min(distance, Math.abs(lonDelta) * Math.cos(lat) * RADIUS);
  }
  return distance;
}
export function riverDistance(up: Vec) {
  const lon = Math.atan2(up[0], up[2]);
  return Math.abs(Math.asin(clamp(up[1], -1, 1)) - riverLatitude(lon)) * RADIUS;
}
export const lakes = [
  { up: direction(-0.85, -0.75), radius: 6.8 },
  { up: direction(2.55, 0.88), radius: 7.2 },
  { up: direction(-1.8, -0.65), radius: 5.8 },
];
export const mountains = [
  { up: direction(0.25, -1.05), radius: 6.8, height: 7.5 },
  { up: direction(0.9, 1.2), radius: 7.2, height: 8.5 },
  { up: direction(1.0, -0.9), radius: 6.5, height: 6.8 },
  { up: direction(-1.05, 0.98), radius: 7.8, height: 8 },
  { up: direction(-2.8, -1.1), radius: 6.5, height: 7 },
];
export const buildingClearance = (up: Vec) =>
  Math.min(
    ...plots.map((p) => {
      if (dot(up, p.up) < 0.8) return arcDistance(up, p.up);
      const side = cross(p.up, p.forward);
      return Math.max(
        Math.abs(dot(up, side) * RADIUS) - 5.5,
        Math.abs(dot(up, p.forward) * RADIUS) - 4.4,
      );
    }),
    ...landmarks.map((p) => arcDistance(up, p.up) - p.footprint),
  );
export function waterDepth(up: Vec) {
  const basins = Math.max(
    ...lakes.map((lake) => 1 - smooth(lake.radius * 0.55, lake.radius, arcDistance(up, lake.up))),
  );
  // Lakes leave dry paths and foundations. The river is crossed by explicit bridge decks.
  const lakeDepth = basins * smooth(1.8, 3.1, pathDistance(up));
  return (
    Math.max(1 - smooth(0.65, 1.55, riverDistance(up)), lakeDepth) *
    smooth(0.5, 1.5, buildingClearance(up))
  );
}
export function mountainHeight(up: Vec) {
  const peak = Math.max(
    ...mountains.map((m) => {
      if (dot(up, m.up) < 0.8) return 0;
      const side = tangent([1, 0, 0], m.up),
        along = cross(m.up, side);
      const x = (dot(up, side) * RADIUS) / m.radius,
        z = (dot(up, along) * RADIUS) / m.radius;
      const d2 = Math.pow(x + Math.sin(z * 2.4) * 0.16, 2) * 1.15 + z * z * 0.7;
      return m.height * Math.pow(Math.max(0, 1 - d2), 2);
    }),
  );
  const ridges = 0.96 + 0.04 * Math.sin(up[0] * 7 + up[1] * 5) * Math.cos(up[2] * 6);
  return (
    peak *
    ridges *
    smooth(2.2, 4.4, pathDistance(up)) *
    smooth(0.8, 2.8, buildingClearance(up)) *
    (1 - waterDepth(up))
  );
}
export function surfaceRadius(up: Vec): number {
  let r =
    RADIUS +
    0.12 +
    0.14 * Math.sin(up[0] * 8 + up[2] * 3) * Math.cos(up[1] * 9) +
    0.09 * Math.sin(up[2] * 13);
  r += mountainHeight(up) - waterDepth(up) * 2.6;
  // Buildings sit on explicit terraces. Raising the terrain to every tangent plane
  // made sharp humps where large foundation pads overlapped public paths.
  return r;
}
export const surfacePoint = (up: Vec, offset = 0): Vec => mul(up, surfaceRadius(up) + offset);
export const bridges = [MERIDIAN, Math.PI / 2, Math.PI + MERIDIAN, Math.PI * 1.5].map((lon) => {
  const up = direction(lon, riverLatitude(lon));
  return {
    up,
    forward: tangent([0, 1, 0], up),
    side: tangent([Math.cos(lon), 0, -Math.sin(lon)], up),
  };
});
export function bridgeAt(up: Vec, margin = 0) {
  for (const bridge of bridges) {
    const along = dot(up, bridge.forward) * RADIUS;
    const across = dot(up, bridge.side) * RADIUS;
    if (Math.abs(along) <= 3.4 && Math.abs(across) <= 1.12 - margin && dot(up, bridge.up) > 0.9)
      return { bridge, along };
  }
  return undefined;
}
export function walkingRadius(up: Vec) {
  const crossing = bridgeAt(up);
  if (crossing) {
    const ground = surfaceRadius(up);
    const deck = RADIUS + 0.18 + 0.4 * Math.cos(((crossing.along / 3.4) * Math.PI) / 2);
    return ground + Math.max(0, deck - ground) * smooth(0, 0.5, 3.4 - Math.abs(crossing.along));
  }
  return surfaceRadius(up);
}
export const doorDirection = (slot: number): Vec => {
  const p = plots[slot]!;
  return advance(p.up, p.forward, 5).up;
};
export interface Obstacle {
  up: Vec;
  radius: number;
  forward?: Vec;
  halfWidth?: number;
  halfDepth?: number;
}
export function buildingObstacle(
  bounds: { min: Vec; max: Vec },
  up: Vec,
  forward: Vec,
  scale: number,
): Obstacle {
  const centerX = ((bounds.min[0] + bounds.max[0]) * scale) / 2;
  const centerZ = ((bounds.min[2] + bounds.max[2]) * scale) / 2;
  const side = cross(up, forward);
  const centered = advance(advance(up, forward, centerZ).up, side, centerX).up;
  const halfWidth = ((bounds.max[0] - bounds.min[0]) * scale) / 2;
  const halfDepth = ((bounds.max[2] - bounds.min[2]) * scale) / 2;
  return {
    up: centered,
    radius: Math.max(halfWidth, halfDepth),
    forward: tangent(forward, centered),
    halfWidth,
    halfDepth,
  };
}
export const houseObstacles: Obstacle[] = plots.map((p) => ({ up: p.up, radius: HOUSE_FOOTPRINT }));
export function canOccupy(up: Vec, obstacles: readonly Obstacle[], bodyRadius = 0.32) {
  if (!bridgeAt(up, bodyRadius) && waterDepth(up) > 0.18) return false;
  if (mountainHeight(up) > 1.25) return false;
  return obstacles.every((obstacle) => {
    if (obstacle.forward && obstacle.halfWidth !== undefined && obstacle.halfDepth !== undefined) {
      if (dot(up, obstacle.up) < 0.8) return true;
      const side = cross(obstacle.up, obstacle.forward);
      const x = Math.max(0, Math.abs(dot(up, side) * RADIUS) - obstacle.halfWidth);
      const z = Math.max(0, Math.abs(dot(up, obstacle.forward) * RADIUS) - obstacle.halfDepth);
      return Math.hypot(x, z) >= bodyRadius;
    }
    return arcDistance(up, obstacle.up) >= obstacle.radius + bodyRadius;
  });
}
/** Stable decoration distribution, independent of student activity. */
export function scatter(count: number, seed = 41): Vec[] {
  const points: Vec[] = [];
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let n = 0; n < count * 20 && points.length < count; n++) {
    const up = direction(random() * TAU, Math.asin(random() * 2 - 1));
    if (
      inWelcomeCourtyard(up) ||
      pathDistance(up) < 2.8 ||
      waterDepth(up) > 0.05 ||
      mountainHeight(up) > 0.7 ||
      buildingClearance(up) < 1.3 ||
      points.some((p) => arcDistance(up, p) < 1.3)
    )
      continue;
    points.push(up);
  }
  return points;
}
