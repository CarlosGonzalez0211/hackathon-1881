import type { AthenaInstallContext } from "../athena/install";
import { roundedBox } from "./geometry";
import type { LegacyContext } from "../runtime/legacy-context";
import { mergeStaticMeshes } from "../athena/merge";
import { add, cross, dot, mul, norm, surfacePoint, type Vec } from "./layout";

const hash = (x: number, y: number) => {
  const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return v - Math.floor(v);
};
const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** A connected stone foundation meets the curved ground; it never deforms the paths. */
export function createTerrace(
  ctx: AthenaInstallContext,
  up: Vec,
  forward: Vec,
  bounds: { min: Vec; max: Vec },
  scale: number,
) {
  const s = ctx.scope,
    root = new s.Group();
  root.name = "athena-connected-stone-terrace";
  const base = surfacePoint(up),
    baseRadius = Math.hypot(...base),
    side = cross(up, forward);
  const x0 = bounds.min[0] * scale - 0.12,
    x1 = bounds.max[0] * scale + 0.12,
    z0 = bounds.min[2] * scale - 0.12,
    z1 = bounds.max[2] * scale + 0.12;
  // Vertex-coloured stone (courses, coping, moss) and plain sandstone for the steps.
  const material = new s.MeshStandardMaterial({
    color: "#ffffff",
    vertexColors: true,
    roughness: 1,
  });
  const stepMaterial = new s.MeshStandardMaterial({ color: "#cdbd9d", roughness: 1 });
  const floors: {
    up: Vec;
    forward: Vec;
    side: Vec;
    radius: number;
    x0: number;
    x1: number;
    z0: number;
    z1: number;
  }[] = [];
  // The foundation top is walkable: with colliders fitted to the walls, the student can
  // step onto the stone platform and stand right against the house instead of sinking in.
  floors.push({ up, forward, side, radius: baseRadius - 0.035, x0, x1, z0, z1 });
  const world = (x: number, y: number, z: number) =>
    add(base, add(mul(up, y), add(mul(side, x), mul(forward, z))));
  const corner = 0.34;
  const corners: Vec[] = [
    [x0 + corner, 0, z0],
    [x1 - corner, 0, z0],
    [x1, 0, z0 + corner],
    [x1, 0, z1 - corner],
    [x1 - corner, 0, z1],
    [x0 + corner, 0, z1],
    [x0, 0, z1 - corner],
    [x0, 0, z0 + corner],
  ];
  root.add(new s.Mesh(buildStone(s, corners, world, up, baseRadius), material));
  // Four shallow steps are joined to the front edge of the same foundation.
  const width = Math.min(2.1, x1 - x0 - 0.3);
  const doorGround = dot(surfacePoint(norm(world(0, 0, z1 + 1.15))), up) - baseRadius;
  for (let i = 0; i < 4; i++) {
    const z = z1 + 0.15 + i * 0.3,
      top = -0.035 + ((doorGround + 0.035) * (i + 1)) / 4;
    const ground = dot(surfacePoint(norm(world(0, 0, z))), up) - baseRadius - 0.2;
    const height = Math.max(0.08, top - ground);
    floors.push({
      up,
      forward,
      side,
      radius: baseRadius + top,
      x0: -width / 2,
      x1: width / 2,
      z0: z - 0.16,
      z1: z + 0.16,
    });
    const step = new s.Mesh(roundedBox(s, width, height, 0.32), stepMaterial);
    step.position.set(...world(0, top - height / 2, z));
    const y = new s.Vector3(...up),
      f = new s.Vector3(...forward),
      x = new s.Vector3(...side);
    step.quaternion.setFromRotationMatrix(new s.Matrix4().makeBasis(x, y, f));
    root.add(step);
  }
  mergeStaticMeshes(s, root, new Set());
  ctx.toon.apply(root);
  root.traverse((part: LegacyContext) => {
    if (part.isMesh && !part.userData.athenaInk) {
      part.castShadow = true;
      part.receiveShadow = true;
    }
  });
  return { root, floors };
}

interface Rim {
  x: number;
  z: number;
  nx: number;
  nz: number;
  /** Height of the stone foot relative to the terrace base (below the ground). */
  bottom: number;
}

/**
 * The stone body of a terrace: a flat sandstone top, a chamfered coping, three curved courses
 * (each a soft bulge between darker seams) and a moss line where the stone meets the ground.
 * Vertex colour only. Every strip owns its vertices, so the seams stay crisp while each course
 * shades as a rounded stone.
 */
function buildStone(
  s: LegacyContext,
  corners: readonly Vec[],
  world: (x: number, y: number, z: number) => Vec,
  up: Vec,
  baseRadius: number,
) {
  const sand = new s.Color("#d9c3a3");
  const deepSand = new s.Color("#a88e6e");
  const coping = new s.Color("#e3d3b4");
  const moss = new s.Color("#3f7a5b");
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  const push = (point: Vec, color: LegacyContext, k = 1) => {
    positions.push(...point);
    colors.push(color.r * k, color.g * k, color.b * k);
    return positions.length / 3 - 1;
  };
  const topY = -0.035;

  // Top: a fan from the middle (same winding as before), sandstone a little darker inside.
  let cx = 0;
  let cz = 0;
  for (const [x, , z] of corners) {
    cx += x / corners.length;
    cz += z / corners.length;
  }
  const middle = push(world(cx, topY, cz), sand, 0.94);
  const ring = corners.map(([x, , z], i) =>
    push(world(x, topY, z), sand, 0.96 + 0.05 * hash(i, 3)),
  );
  for (let i = 0; i < corners.length; i++)
    indices.push(middle, ring[(i + 1) % corners.length]!, ring[i]!);

  // Perimeter: the corners with every edge cut about each 0.9 m so courses follow the ground.
  const loop: Rim[] = [];
  for (let i = 0; i < corners.length; i++) {
    const from = corners[i]!;
    const to = corners[(i + 1) % corners.length]!;
    const parts = Math.max(1, Math.round(Math.hypot(to[0] - from[0], to[2] - from[2]) / 0.9));
    for (let part = 0; part < parts; part++) {
      const t = part / parts;
      loop.push({
        x: from[0] + (to[0] - from[0]) * t,
        z: from[2] + (to[2] - from[2]) * t,
        nx: 0,
        nz: 0,
        bottom: 0,
      });
    }
  }
  let mx = 0;
  let mz = 0;
  for (const point of loop) {
    mx += point.x / loop.length;
    mz += point.z / loop.length;
  }
  loop.forEach((point, i) => {
    const before = loop[(i + loop.length - 1) % loop.length]!;
    const after = loop[(i + 1) % loop.length]!;
    let nx = after.z - before.z;
    let nz = -(after.x - before.x);
    if (nx * (point.x - mx) + nz * (point.z - mz) < 0) {
      nx = -nx;
      nz = -nz;
    }
    const length = Math.hypot(nx, nz) || 1;
    point.nx = nx / length;
    point.nz = nz / length;
    const ground = surfacePointOf(world(point.x, topY, point.z));
    point.bottom = dot(ground, up) - baseRadius - 0.25;
  });

  const count = loop.length;
  type Row = {
    out: number;
    y: (point: Rim) => number;
    color: (i: number, y: number, point: Rim) => [LegacyContext, number];
  };
  const strip = (rows: Row[]) => {
    const index: number[][] = rows.map(() => []);
    rows.forEach((row, r) => {
      loop.forEach((point, i) => {
        const y = row.y(point);
        const [color, k] = row.color(i, y, point);
        index[r]!.push(
          push(world(point.x + point.nx * row.out, y, point.z + point.nz * row.out), color, k),
        );
      });
    });
    // Same winding as the old skirt: (top_i, top_j, low_i) and (top_j, low_j, low_i).
    for (let r = 0; r < rows.length - 1; r++)
      for (let i = 0; i < count; i++) {
        const j = (i + 1) % count;
        indices.push(index[r]![i]!, index[r]![j]!, index[r + 1]![i]!);
        indices.push(index[r]![j]!, index[r + 1]![j]!, index[r + 1]![i]!);
      }
  };
  // Chamfered coping: the top edge steps out and down, then a short vertical face.
  strip([
    { out: 0.0, y: () => topY, color: (i) => [coping, 1 + 0.04 * hash(i, 1)] },
    { out: 0.06, y: () => topY - 0.045, color: (i) => [coping, 0.97 + 0.04 * hash(i, 2)] },
  ]);
  strip([
    { out: 0.06, y: () => topY - 0.045, color: () => [coping, 0.9] },
    { out: 0.06, y: () => topY - 0.15, color: (i) => [coping, 0.82 + 0.05 * hash(i, 4)] },
  ]);
  // Three curved courses: seam, belly, seam. Each course has its own tone.
  const top = topY - 0.15;
  for (let course = 0; course < 3; course++) {
    const at = (point: Rim, t: number) => top + (point.bottom - top) * ((course + t) / 3);
    const tone = 0.9 + 0.12 * hash(course, 7);
    const shade = (i: number, y: number, point: Rim, seam: number): [LegacyContext, number] => {
      const aboveGround = y - point.bottom;
      // The moss line: a wavering band hugging the ground, fading out within ~0.6 m.
      const mossWeight =
        (1 - smooth(0.2, 0.62, aboveGround + 0.12 * Math.sin(i * 2.3 + hash(i, course) * 3))) * 0.9;
      const color = sand
        .clone()
        .lerp(deepSand, 0.25 + 0.45 * ((course + 1) / 3) + 0.15 * hash(i, course + 11))
        .lerp(moss, mossWeight);
      return [color, tone * seam * (0.94 + 0.08 * hash(i, course + 5))];
    };
    strip([
      { out: 0.0, y: (p) => at(p, 0), color: (i, y, p) => shade(i, y, p, 0.78) },
      { out: 0.04, y: (p) => at(p, 0.5), color: (i, y, p) => shade(i, y, p, 1.04) },
      { out: 0.0, y: (p) => at(p, 1), color: (i, y, p) => shade(i, y, p, 0.78) },
    ]);
  }

  const geometry = new s.BufferGeometry();
  geometry.setAttribute("position", new s.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new s.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** The terrain point under (or over) `point`: same direction, ground radius. */
function surfacePointOf(point: Vec): Vec {
  return surfacePoint(norm(point));
}
