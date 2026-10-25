/**
 * SDF scenes: smooth-min unions of ellipsoids, capsules and rounded boxes, polygonised with
 * three's MarchingCubes.
 *
 *   const crown = sdf.smin(0.12, sdf.ellipsoid([0, 0.5, 0], [0.4, 0.3, 0.4]), sdf.sphere(...));
 *   const geometry = await polygonise(THREE, crown, { size: 64, maxTriangles: 1200 });
 *
 * A scene node is a plain function `(x, y, z) => signed distance` (negative inside) with a
 * `.bounds = [[minx, miny, minz], [maxx, maxy, maxz]]` box. Primitives: `sphere`, `ellipsoid`,
 * `capsule`, `roundBox`, `halfspace`. Operators: `union` (hard), `smin(k, ...nodes)` (smooth
 * union), `subtract(a, b, k = 0)` (smooth when k > 0), `intersect`, `translate`.
 *
 * `polygonise` samples the field on a size^3 grid over the scene bounds (a cube, padded),
 * runs marching cubes, welds the soup, reorients triangles to the field gradient, optionally
 * decimates with meshoptimizer to `maxTriangles`, snaps vertices back onto the surface and
 * computes smooth normals from the analytic gradient. Marching cubes at 64^3 yields thousands
 * of triangles for a unit-sized mass; the decimation is what brings it inside the budgets.
 * The returned geometry has position, normal and index only.
 */
import { MarchingCubes } from "three/addons/objects/MarchingCubes.js";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { MeshoptSimplifier } from "meshoptimizer";

const node = (fn, bounds) => Object.assign(fn, { bounds });
const grow = (bounds, amount) => [
  bounds[0].map((v) => v - amount),
  bounds[1].map((v) => v + amount),
];
const mergeBounds = (list) => [
  [0, 1, 2].map((i) => Math.min(...list.map((b) => b[0][i]))),
  [0, 1, 2].map((i) => Math.max(...list.map((b) => b[1][i]))),
];

export const sdf = {
  sphere([cx, cy, cz], r) {
    return node(
      (x, y, z) => Math.hypot(x - cx, y - cy, z - cz) - r,
      [
        [cx - r, cy - r, cz - r],
        [cx + r, cy + r, cz + r],
      ],
    );
  },
  /** Approximate ellipsoid distance (Inigo Quilez): exact on the surface, good near it. */
  ellipsoid([cx, cy, cz], [rx, ry, rz]) {
    return node(
      (x, y, z) => {
        const px = x - cx;
        const py = y - cy;
        const pz = z - cz;
        const k0 = Math.hypot(px / rx, py / ry, pz / rz);
        const k1 = Math.hypot(px / (rx * rx), py / (ry * ry), pz / (rz * rz));
        return k1 < 1e-9 ? -Math.min(rx, ry, rz) : (k0 * (k0 - 1)) / k1;
      },
      [
        [cx - rx, cy - ry, cz - rz],
        [cx + rx, cy + ry, cz + rz],
      ],
    );
  },
  capsule([ax, ay, az], [bx, by, bz], r) {
    const dx = bx - ax;
    const dy = by - ay;
    const dz = bz - az;
    const length2 = dx * dx + dy * dy + dz * dz || 1;
    return node(
      (x, y, z) => {
        const t = Math.min(
          1,
          Math.max(0, ((x - ax) * dx + (y - ay) * dy + (z - az) * dz) / length2),
        );
        return Math.hypot(x - ax - dx * t, y - ay - dy * t, z - az - dz * t) - r;
      },
      [
        [Math.min(ax, bx) - r, Math.min(ay, by) - r, Math.min(az, bz) - r],
        [Math.max(ax, bx) + r, Math.max(ay, by) + r, Math.max(az, bz) + r],
      ],
    );
  },
  /** Box with half extents `half`, corners rounded by `round` (round <= min(half)). */
  roundBox([cx, cy, cz], [hx, hy, hz], round = 0) {
    return node(
      (x, y, z) => {
        const qx = Math.abs(x - cx) - hx + round;
        const qy = Math.abs(y - cy) - hy + round;
        const qz = Math.abs(z - cz) - hz + round;
        return (
          Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) +
          Math.min(Math.max(qx, qy, qz), 0) -
          round
        );
      },
      [
        [cx - hx, cy - hy, cz - hz],
        [cx + hx, cy + hy, cz + hz],
      ],
    );
  },
  /** Everything with `dot(n, p) < offset` is inside; handy as a cutter for flat bases. */
  halfspace(normal, offset = 0) {
    const length = Math.hypot(...normal) || 1;
    const [nx, ny, nz] = normal.map((v) => v / length);
    return node(
      (x, y, z) => nx * x + ny * y + nz * z - offset,
      [
        [-1e3, -1e3, -1e3],
        [1e3, 1e3, 1e3],
      ],
    );
  },
  union: (...nodes) =>
    node(
      (x, y, z) => Math.min(...nodes.map((n) => n(x, y, z))),
      mergeBounds(nodes.map((n) => n.bounds)),
    ),
  /** Polynomial smooth minimum: blends nodes within distance `k` of each other. */
  smin(k, ...nodes) {
    const blend = (a, b) => {
      const h = Math.max(k - Math.abs(a - b), 0) / k;
      return Math.min(a, b) - h * h * k * 0.25;
    };
    return node(
      (x, y, z) => nodes.map((n) => n(x, y, z)).reduce(blend),
      grow(mergeBounds(nodes.map((n) => n.bounds)), k * 0.25),
    );
  },
  subtract(a, b, k = 0) {
    if (k <= 0) return node((x, y, z) => Math.max(a(x, y, z), -b(x, y, z)), a.bounds);
    return node((x, y, z) => {
      const d1 = a(x, y, z);
      const d2 = -b(x, y, z);
      const h = Math.max(k - Math.abs(d1 - d2), 0) / k;
      return Math.max(d1, d2) + h * h * k * 0.25;
    }, a.bounds);
  },
  intersect: (a, b) => node((x, y, z) => Math.max(a(x, y, z), b(x, y, z)), a.bounds),
  translate: (a, [tx, ty, tz]) =>
    node(
      (x, y, z) => a(x - tx, y - ty, z - tz),
      [
        [a.bounds[0][0] + tx, a.bounds[0][1] + ty, a.bounds[0][2] + tz],
        [a.bounds[1][0] + tx, a.bounds[1][1] + ty, a.bounds[1][2] + tz],
      ],
    ),
};

/** Central-difference gradient of the field. */
export function gradient(scene, x, y, z, h = 1e-3) {
  const gx = scene(x + h, y, z) - scene(x - h, y, z);
  const gy = scene(x, y + h, z) - scene(x, y - h, z);
  const gz = scene(x, y, z + h) - scene(x, y, z - h);
  const length = Math.hypot(gx, gy, gz) || 1;
  return [gx / length, gy / length, gz / length];
}

/**
 * @param {import("three")} THREE
 * @param {ReturnType<typeof node>} scene
 * @param {{ size?: number, bounds?: [number[], number[]], maxTriangles?: number, padding?: number, project?: boolean }} [options]
 */
export async function polygonise(
  THREE,
  scene,
  {
    size = 64,
    bounds = scene.bounds,
    maxTriangles = Infinity,
    padding = 0.08,
    project = true,
  } = {},
) {
  // The grid is a cube; marching cubes ignores the two outermost cell layers, so pad.
  const lo = bounds[0];
  const hi = bounds[1];
  const centre = [0, 1, 2].map((i) => (lo[i] + hi[i]) / 2);
  const extent = Math.max(...[0, 1, 2].map((i) => hi[i] - lo[i]));
  const half = (extent / 2) * (1 + padding) * (size / (size - 6));
  const marching = new MarchingCubes(size, new THREE.MeshBasicMaterial(), false, false, 120000);
  marching.isolation = 0;
  const field = marching.field;
  const step = half / (size / 2);
  for (let z = 0; z < size; z++)
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        const px = centre[0] + (x - size / 2) * step;
        const py = centre[1] + (y - size / 2) * step;
        const pz = centre[2] + (z - size / 2) * step;
        field[x + y * size + z * size * size] = -scene(px, py, pz);
      }
  marching.update();
  const vertexCount = marching.count;
  const soup = new Float32Array(vertexCount * 3);
  for (let i = 0; i < vertexCount; i++) {
    // Marching cubes space is [-1, 1) on every axis; the sample spacing is `step`.
    soup[i * 3] = centre[0] + marching.positionArray[i * 3] * half;
    soup[i * 3 + 1] = centre[1] + marching.positionArray[i * 3 + 1] * half;
    soup[i * 3 + 2] = centre[2] + marching.positionArray[i * 3 + 2] * half;
  }
  let geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(soup, 3));
  geometry = mergeVertices(geometry, step * 1e-3);

  // Orient triangles to the field gradient (outward = increasing distance).
  const probe = geometry.attributes.position.array;
  const index = geometry.index.array;
  let agree = 0;
  for (let t = 0; t < index.length; t += 3) {
    const a = index[t] * 3;
    const b = index[t + 1] * 3;
    const c = index[t + 2] * 3;
    const ux = probe[b] - probe[a];
    const uy = probe[b + 1] - probe[a + 1];
    const uz = probe[b + 2] - probe[a + 2];
    const vx = probe[c] - probe[a];
    const vy = probe[c + 1] - probe[a + 1];
    const vz = probe[c + 2] - probe[a + 2];
    const n = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
    const g = gradient(
      scene,
      (probe[a] + probe[b] + probe[c]) / 3,
      (probe[a + 1] + probe[b + 1] + probe[c + 1]) / 3,
      (probe[a + 2] + probe[b + 2] + probe[c + 2]) / 3,
    );
    agree += Math.sign(n[0] * g[0] + n[1] * g[1] + n[2] * g[2]);
  }
  if (agree < 0)
    for (let t = 0; t < index.length; t += 3) {
      const swap = index[t + 1];
      index[t + 1] = index[t + 2];
      index[t + 2] = swap;
    }

  let positions = Float32Array.from(geometry.attributes.position.array);
  let indices = Uint32Array.from(geometry.index.array);
  if (indices.length / 3 > maxTriangles) {
    await MeshoptSimplifier.ready;
    const [simplified] = MeshoptSimplifier.simplify(indices, positions, 3, maxTriangles * 3, 1);
    // Compact: drop vertices the simplifier no longer references.
    const remap = new Map();
    const kept = [];
    indices = Uint32Array.from(simplified, (old) => {
      if (!remap.has(old)) {
        remap.set(old, kept.length / 3);
        kept.push(positions[old * 3], positions[old * 3 + 1], positions[old * 3 + 2]);
      }
      return remap.get(old);
    });
    positions = Float32Array.from(kept);
  }
  const normals = new Float32Array(positions.length);
  for (let i = 0; i < positions.length; i += 3) {
    let x = positions[i];
    let y = positions[i + 1];
    let z = positions[i + 2];
    if (project)
      for (let pass = 0; pass < 2; pass++) {
        const d = scene(x, y, z);
        const g = gradient(scene, x, y, z);
        x -= g[0] * d;
        y -= g[1] * d;
        z -= g[2] * d;
      }
    positions[i] = x;
    positions[i + 1] = y;
    positions[i + 2] = z;
    normals.set(gradient(scene, x, y, z), i);
  }
  const result = new THREE.BufferGeometry();
  result.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  result.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  result.setIndex(new THREE.BufferAttribute(indices, 1));
  result.computeBoundingBox();
  result.computeBoundingSphere();
  return result;
}
