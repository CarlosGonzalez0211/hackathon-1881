/**
 * Connected components of a recovered terrain batch geometry, measured in the local
 * tangent frame of the spherical planet (+up = away from the planet centre).
 *
 * Batches are spatial tiles (2-9 m) that merge ground, buildings and props; their
 * `surfaceId`/`elementId` attributes are opaque. Components (triangles sharing vertices,
 * welded by position across UV seams) are the smallest units the art swap can reason about.
 */
export interface ComponentStats {
  /** Vertex indices of the component. */
  readonly vertices: Uint32Array;
  readonly triangleCount: number;
  /** Centroid (planet space). */
  readonly centroid: readonly [number, number, number];
  /** Unit planet normal at the centroid. */
  readonly up: readonly [number, number, number];
  /** Radial distance of the lowest / highest vertex from the planet centre. */
  readonly radialMin: number;
  readonly radialMax: number;
  /** Extents along the two tangent axes (m). */
  readonly extentA: number;
  readonly extentB: number;
  /** Lowest point (planet space): the base centre used for placement. */
  readonly base: readonly [number, number, number];
}

interface PositionLike {
  readonly count: number;
  getX(index: number): number;
  getY(index: number): number;
  getZ(index: number): number;
}
interface IndexLike {
  readonly count: number;
  getX(index: number): number;
}

/** Union-find over triangle connectivity plus position welding (1 mm). */
export function connectedComponents(position: PositionLike, index: IndexLike | null) {
  const count = position.count;
  const parent = new Int32Array(count);
  for (let i = 0; i < count; i++) parent[i] = i;
  const find = (i: number) => {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]!]!;
      i = parent[i]!;
    }
    return i;
  };
  const union = (a: number, b: number) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[rb] = ra;
  };
  const indexAt = (i: number) => (index ? index.getX(i) : i);
  const triangles = index ? index.count : count;
  for (let t = 0; t + 2 < triangles; t += 3) {
    union(indexAt(t), indexAt(t + 1));
    union(indexAt(t), indexAt(t + 2));
  }
  const welded = new Map<string, number>();
  for (let i = 0; i < count; i++) {
    const key = `${Math.round(position.getX(i) * 1000)},${Math.round(position.getY(i) * 1000)},${Math.round(position.getZ(i) * 1000)}`;
    const other = welded.get(key);
    if (other === undefined) welded.set(key, i);
    else union(i, other);
  }
  const roots = new Map<number, number[]>();
  for (let i = 0; i < count; i++) {
    const root = find(i);
    let list = roots.get(root);
    if (!list) roots.set(root, (list = []));
    list.push(i);
  }
  const triangleCounts = new Map<number, number>();
  for (let t = 0; t + 2 < triangles; t += 3) {
    const root = find(indexAt(t));
    triangleCounts.set(root, (triangleCounts.get(root) ?? 0) + 1);
  }
  return [...roots].map(([root, list]) =>
    measure(position, Uint32Array.from(list), triangleCounts.get(root) ?? 0),
  );
}

function measure(position: PositionLike, vertices: Uint32Array, triangleCount: number) {
  let cx = 0;
  let cy = 0;
  let cz = 0;
  for (const i of vertices) {
    cx += position.getX(i);
    cy += position.getY(i);
    cz += position.getZ(i);
  }
  const n = vertices.length || 1;
  cx /= n;
  cy /= n;
  cz /= n;
  const length = Math.hypot(cx, cy, cz) || 1;
  const up = [cx / length, cy / length, cz / length] as const;
  // Tangent axes: any stable pair perpendicular to `up`.
  let ax = -up[2];
  let ay = 0;
  let az = up[0];
  if (Math.hypot(ax, ay, az) < 1e-6) [ax, ay, az] = [1, 0, 0];
  const al = Math.hypot(ax, ay, az);
  ax /= al;
  ay /= al;
  az /= al;
  const bx = up[1] * az - up[2] * ay;
  const by = up[2] * ax - up[0] * az;
  const bz = up[0] * ay - up[1] * ax;
  let radialMin = Infinity;
  let radialMax = -Infinity;
  let aMin = Infinity;
  let aMax = -Infinity;
  let bMin = Infinity;
  let bMax = -Infinity;
  let lowest = 0;
  for (const i of vertices) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    const radial = Math.hypot(x, y, z);
    if (radial < radialMin) {
      radialMin = radial;
      lowest = i;
    }
    radialMax = Math.max(radialMax, radial);
    const a = (x - cx) * ax + (y - cy) * ay + (z - cz) * az;
    const b = (x - cx) * bx + (y - cy) * by + (z - cz) * bz;
    aMin = Math.min(aMin, a);
    aMax = Math.max(aMax, a);
    bMin = Math.min(bMin, b);
    bMax = Math.max(bMax, b);
  }
  // Base centre: the centroid column, dropped to the lowest vertex's radius.
  const base = [up[0] * radialMin, up[1] * radialMin, up[2] * radialMin] as const;
  void lowest;
  return {
    vertices,
    triangleCount,
    centroid: [cx, cy, cz] as const,
    up,
    radialMin,
    radialMax,
    extentA: aMax - aMin,
    extentB: bMax - bMin,
    base,
  } satisfies ComponentStats;
}
