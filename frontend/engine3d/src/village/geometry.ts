import type { LegacyContext } from "../runtime/legacy-context";
import type { Vec } from "./layout";

/** Smooth tapered lathe, using the recovered runtime's BufferGeometry primitives. */
export function taperedTube(
  s: LegacyContext,
  top: number,
  bottom: number,
  height: number,
  segments = 12,
  rings = 3,
) {
  const positions: number[] = [],
    uvs: number[] = [],
    indices: number[] = [];
  for (let y = 0; y <= rings; y++)
    for (let x = 0; x <= segments; x++) {
      const t = y / rings,
        a = (x / segments) * Math.PI * 2,
        r = bottom + (top - bottom) * t;
      positions.push(Math.sin(a) * r, (t - 0.5) * height, Math.cos(a) * r);
      uvs.push(x / segments, t);
    }
  for (let y = 0; y < rings; y++)
    for (let x = 0; x < segments; x++) {
      const a = y * (segments + 1) + x,
        b = a + segments + 1;
      indices.push(a, a + 1, b, a + 1, b + 1, b);
    }
  for (const [y, r, reverse] of [
    [-height / 2, bottom, 1],
    [height / 2, top, 0],
  ]) {
    const center = positions.length / 3;
    positions.push(0, y!, 0);
    uvs.push(0.5, 0.5);
    for (let x = 0; x <= segments; x++) {
      const a = (x / segments) * Math.PI * 2;
      positions.push(Math.sin(a) * r!, y!, Math.cos(a) * r!);
      uvs.push(0.5 + Math.sin(a) * 0.5, 0.5 + Math.cos(a) * 0.5);
      if (x) indices.push(center, center + x + (reverse ? 1 : 0), center + x + (reverse ? 0 : 1));
    }
  }
  const geometry = new s.BufferGeometry();
  geometry.setAttribute("position", new s.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new s.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Pillowy box: a superellipsoid with smooth normals, so planks, crates and steps catch soft
 * highlights along their edges instead of reading as hard polygons. `exponent` near 0 is
 * boxier, 1 is an ellipsoid.
 */
export function roundedBox(
  s: LegacyContext,
  width: number,
  height: number,
  depth: number,
  exponent = 0.22,
  segments = 10,
) {
  const positions: number[] = [],
    uvs: number[] = [],
    indices: number[] = [];
  const shape = (v: number, half: number) => Math.sign(v) * Math.pow(Math.abs(v), exponent) * half;
  for (let y = 0; y <= segments; y++)
    for (let x = 0; x <= segments * 2; x++) {
      const u = x / (segments * 2),
        v = y / segments;
      const theta = u * Math.PI * 2,
        phi = v * Math.PI;
      const dx = Math.sin(phi) * Math.sin(theta),
        dy = Math.cos(phi),
        dz = Math.sin(phi) * Math.cos(theta);
      positions.push(shape(dx, width / 2), shape(dy, height / 2), shape(dz, depth / 2));
      uvs.push(u, 1 - v);
    }
  const row = segments * 2 + 1;
  for (let y = 0; y < segments; y++)
    for (let x = 0; x < segments * 2; x++) {
      const a = y * row + x,
        b = a + row;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  const geometry = new s.BufferGeometry();
  geometry.setAttribute("position", new s.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new s.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** Smooth ring (the recovered bundle has no TorusGeometry), lying in the XZ plane. */
export function ring(
  s: LegacyContext,
  radius: number,
  tube: number,
  radial = 16,
  tubular = 96,
  /** Vertical squash of the tube profile: 1 is round, larger is a taller band. */
  stretch = 1,
) {
  const positions: number[] = [],
    uvs: number[] = [],
    indices: number[] = [];
  for (let j = 0; j <= radial; j++)
    for (let i = 0; i <= tubular; i++) {
      const u = (i / tubular) * Math.PI * 2,
        v = (j / radial) * Math.PI * 2;
      const r = radius + tube * Math.cos(v);
      positions.push(Math.cos(u) * r, tube * stretch * Math.sin(v), Math.sin(u) * r);
      uvs.push(i / tubular, j / radial);
    }
  for (let j = 0; j < radial; j++)
    for (let i = 0; i < tubular; i++) {
      const a = j * (tubular + 1) + i,
        b = a + tubular + 1;
      indices.push(a, a + 1, b, a + 1, b + 1, b);
    }
  const geometry = new s.BufferGeometry();
  geometry.setAttribute("position", new s.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new s.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** Uniform Catmull-Rom between `b` and `c` (`a`/`d` are their neighbours), `t` in 0..1. */
function catmull(a: number, b: number, c: number, d: number, t: number) {
  const t2 = t * t,
    t3 = t2 * t;
  return (
    0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3)
  );
}

/** `count + 1` samples spread evenly over the control-point index of a Catmull-Rom spline. */
function resampleSpline(points: readonly (readonly number[])[], count: number) {
  const n = points.length,
    dims = points[0]!.length,
    out: number[][] = [];
  for (let i = 0; i <= count; i++) {
    const f = (i / count) * (n - 1),
      k = Math.min(n - 2, Math.floor(f)),
      t = f - k,
      a = points[Math.max(0, k - 1)]!,
      b = points[k]!,
      c = points[k + 1]!,
      d = points[Math.min(n - 1, k + 2)]!;
    const sample: number[] = [];
    for (let axis = 0; axis < dims; axis++)
      sample.push(catmull(a[axis]!, b[axis]!, c[axis]!, d[axis]!, t));
    out.push(sample);
  }
  return out;
}

export interface LatheOptions {
  /** `folds` evenly spaced lobes whose radius swings by `depth` (a fraction of the radius). */
  readonly scallop?: { readonly folds: number; readonly depth: number };
  /** Cap open profile ends that are off the axis with discs, so the solid is watertight. */
  readonly closed?: boolean;
  /** Catmull-Rom samples per profile span (default 4). */
  readonly smooth?: number;
}

/**
 * Profile lathe: revolves a Catmull-Rom smoothed `[radius, y]` profile around +Y (the recovered
 * bundle has no LatheGeometry). A profile listed bottom to top faces outward. Normals come
 * from the surface tangents, so they stay smooth across the seam and under a scallop; uv is
 * (angle, arc length along the profile).
 */
export function lathe(
  s: LegacyContext,
  profile: readonly (readonly [number, number])[],
  segments = 24,
  { scallop, closed = false, smooth = 4 }: LatheOptions = {},
) {
  if (profile.length < 2) throw new Error("lathe needs at least two profile points");
  const spans = Math.max(1, Math.round(smooth)) * (profile.length - 1);
  const samples = resampleSpline(profile, spans).map(
    (p) => [Math.max(0, p[0]!), p[1]!] as [number, number],
  );
  const rows = samples.length,
    columns = segments + 1;
  const length: number[] = [0];
  for (let i = 1; i < rows; i++)
    length.push(
      length[i - 1]! +
        Math.hypot(samples[i]![0] - samples[i - 1]![0], samples[i]![1] - samples[i - 1]![1]),
    );
  const total = length[rows - 1]! || 1;
  const positions: number[] = [],
    normals: number[] = [],
    uvs: number[] = [],
    indices: number[] = [];
  const radiusAt = (r: number, angle: number) =>
    scallop ? r * (1 + scallop.depth * Math.cos(scallop.folds * angle)) : r;
  const grid = new Float64Array(rows * columns * 3);
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < columns; j++) {
      const a = (j / segments) * Math.PI * 2,
        r = radiusAt(samples[i]![0], a),
        o = (i * columns + j) * 3;
      grid[o] = Math.sin(a) * r;
      grid[o + 1] = samples[i]![1];
      grid[o + 2] = Math.cos(a) * r;
    }
  const at = (i: number, j: number) => {
    const o = (Math.min(rows - 1, Math.max(0, i)) * columns + ((j + segments) % segments)) * 3;
    return [grid[o]!, grid[o + 1]!, grid[o + 2]!] as const;
  };
  for (let i = 0; i < rows; i++) {
    // Profile direction in the (radius, y) plane, for the rings that collapse onto the axis.
    const before = samples[Math.max(0, i - 1)]!,
      after = samples[Math.min(rows - 1, i + 1)]!;
    const dr = after[0] - before[0],
      dy = after[1] - before[1],
      plane = Math.hypot(dr, dy) || 1;
    for (let j = 0; j < columns; j++) {
      const a = (j / segments) * Math.PI * 2,
        o = (i * columns + j) * 3;
      positions.push(grid[o]!, grid[o + 1]!, grid[o + 2]!);
      uvs.push(j / segments, length[i]! / total);
      // Ring and profile tangents give the true normal of a scalloped surface.
      const left = at(i, j - 1),
        right = at(i, j + 1),
        down = at(i - 1, j),
        up = at(i + 1, j);
      const tx = right[0] - left[0],
        ty = right[1] - left[1],
        tz = right[2] - left[2],
        px = up[0] - down[0],
        py = up[1] - down[1],
        pz = up[2] - down[2];
      let nx = ty * pz - tz * py,
        ny = tz * px - tx * pz,
        nz = tx * py - ty * px;
      const size = Math.hypot(nx, ny, nz);
      if (size > 1e-9) {
        nx /= size;
        ny /= size;
        nz /= size;
      } else {
        nx = (dy / plane) * Math.sin(a);
        ny = -dr / plane;
        nz = (dy / plane) * Math.cos(a);
      }
      normals.push(nx, ny, nz);
    }
  }
  for (let i = 0; i < rows - 1; i++)
    for (let j = 0; j < segments; j++) {
      const a = i * columns + j,
        b = a + columns;
      indices.push(a, a + 1, b, a + 1, b + 1, b);
    }
  if (closed)
    for (const end of [0, rows - 1]) {
      const [r, y] = samples[end]!;
      if (r < 1e-6) continue;
      const neighbour = samples[end === 0 ? 1 : rows - 2]!;
      // The disc faces away from the rest of the profile.
      const facing = neighbour[1] > y ? -1 : neighbour[1] < y ? 1 : end === 0 ? -1 : 1;
      const centre = positions.length / 3;
      positions.push(0, y, 0);
      normals.push(0, facing, 0);
      uvs.push(0.5, 0.5);
      for (let j = 0; j <= segments; j++) {
        const a = (j / segments) * Math.PI * 2,
          rr = radiusAt(r, a);
        positions.push(Math.sin(a) * rr, y, Math.cos(a) * rr);
        normals.push(0, facing, 0);
        uvs.push(0.5 + Math.sin(a) * 0.5, 0.5 + Math.cos(a) * 0.5);
        if (j)
          indices.push(
            centre,
            centre + j + (facing > 0 ? 0 : 1),
            centre + j + (facing > 0 ? 1 : 0),
          );
      }
    }
  const geometry = new s.BufferGeometry();
  geometry.setAttribute("position", new s.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new s.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new s.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  return geometry;
}

export interface SweepOptions {
  /** Close both ends with a disc, so a thick branch or tail has no hollow stump. */
  readonly caps?: boolean;
  /**
   * Wind the tube so its faces look outward. The default keeps the winding Lumen's tail was
   * built with (inward, so the far inner wall shows), which the ink hull and cull side of
   * any new family should not rely on.
   */
  readonly outward?: boolean;
}

/**
 * Tube swept along a polyline with a radius profile `radius(t)`, t in 0..1 (no TubeGeometry in
 * the bundle). With `segments` the points are spline control points resampled into that many
 * spans; without it every point is a ring and the result is exactly what Lumen's tail used.
 */
export function sweep(
  s: LegacyContext,
  points: readonly Vec[],
  radius: (t: number) => number,
  segments?: number,
  radial = 18,
  { caps = false, outward = false }: SweepOptions = {},
) {
  const positions: number[] = [],
    uvs: number[] = [],
    indices: number[] = [];
  const path: readonly (readonly number[])[] =
    segments && points.length > 1 ? resampleSpline(points, Math.max(1, segments)) : points;
  const P = path.map((p) => new s.Vector3(p[0], p[1], p[2]));
  const last = Math.max(1, P.length - 1);
  let normal = new s.Vector3(1, 0, 0);
  for (let i = 0; i < P.length; i++) {
    const tangent = new s.Vector3()
      .subVectors(P[Math.min(i + 1, P.length - 1)], P[Math.max(i - 1, 0)])
      .normalize();
    // Parallel transport keeps the ring frame from twisting along the curl.
    const next = new s.Vector3()
      .crossVectors(tangent, new s.Vector3().crossVectors(normal, tangent))
      .normalize();
    if (next.lengthSq() > 1e-12) normal = next;
    else if (tangent.lengthSq() > 1e-12) {
      // The frame collapsed (a hairpin, or a stalled path): restart from any perpendicular.
      const axis = Math.abs(tangent.y) < 0.9 ? new s.Vector3(0, 1, 0) : new s.Vector3(1, 0, 0);
      normal = new s.Vector3().crossVectors(tangent, axis).normalize();
    }
    const binormal = new s.Vector3().crossVectors(tangent, normal);
    const r = radius(i / last);
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const offset = normal
        .clone()
        .multiplyScalar(Math.cos(a) * r)
        .addScaledVector(binormal, Math.sin(a) * r);
      positions.push(P[i].x + offset.x, P[i].y + offset.y, P[i].z + offset.z);
      uvs.push(j / radial, i / last);
      if (i < P.length - 1 && j < radial) {
        const q = i * (radial + 1) + j;
        if (outward) indices.push(q, q + 1, q + radial + 1, q + 1, q + radial + 2, q + radial + 1);
        else indices.push(q, q + radial + 1, q + 1, q + 1, q + radial + 1, q + radial + 2);
      }
    }
  }
  if (caps && P.length > 1)
    for (const end of [0, P.length - 1]) {
      const first = end === 0,
        centre = positions.length / 3,
        ringStart = end * (radial + 1);
      positions.push(P[end].x, P[end].y, P[end].z);
      uvs.push(0.5, 0.5);
      // Ring vertices are copied so the disc keeps its own flat normal.
      const forward = outward ? !first : first;
      for (let j = 0; j <= radial; j++) {
        const o = (ringStart + j) * 3,
          a = (j / radial) * Math.PI * 2;
        positions.push(positions[o]!, positions[o + 1]!, positions[o + 2]!);
        uvs.push(0.5 + Math.cos(a) * 0.5, 0.5 + Math.sin(a) * 0.5);
        if (j) indices.push(centre, centre + j + (forward ? 0 : 1), centre + j + (forward ? 1 : 0));
      }
    }
  const geometry = new s.BufferGeometry();
  geometry.setAttribute("position", new s.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new s.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Pushes every vertex along its normal by `fn(position, normal)` metres and recomputes normals.
 * Mutates and returns `geometry`; the vectors given to `fn` are reused, so do not keep them.
 * A non-finite result moves nothing. Derive the offset from the position (not the normal) so
 * vertices that duplicate a seam move together instead of cracking it.
 */
export function displace(
  s: LegacyContext,
  geometry: LegacyContext,
  fn: (p: LegacyContext, n: LegacyContext) => number,
) {
  if (!geometry.attributes.normal) geometry.computeVertexNormals();
  const position = geometry.attributes.position,
    normal = geometry.attributes.normal;
  const p = new s.Vector3(),
    n = new s.Vector3();
  const moved = new Float32Array(position.count * 3);
  for (let i = 0; i < position.count; i++) {
    p.fromBufferAttribute(position, i);
    n.fromBufferAttribute(normal, i);
    const offset = fn(p, n),
      d = Number.isFinite(offset) ? offset : 0;
    moved[i * 3] = p.x + n.x * d;
    moved[i * 3 + 1] = p.y + n.y * d;
    moved[i * 3 + 2] = p.z + n.z * d;
  }
  position.array.set(moved);
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

/**
 * Writes (or overwrites) the `color` attribute from `fn(position, normal)` returning linear
 * `[r, g, b]`: height gradients, cavity and direction bakes. Pair it with `vertexColors`.
 * Mutates and returns `geometry`; the vectors given to `fn` are reused, so do not keep them.
 * Non-finite channels become 0.
 */
export function bakeVertexColor(
  s: LegacyContext,
  geometry: LegacyContext,
  fn: (p: LegacyContext, n: LegacyContext) => readonly [number, number, number],
) {
  if (!geometry.attributes.normal) geometry.computeVertexNormals();
  const position = geometry.attributes.position,
    normal = geometry.attributes.normal;
  const p = new s.Vector3(),
    n = new s.Vector3();
  const colors = new Float32Array(position.count * 3);
  for (let i = 0; i < position.count; i++) {
    p.fromBufferAttribute(position, i);
    n.fromBufferAttribute(normal, i);
    const rgb = fn(p, n);
    for (let c = 0; c < 3; c++) colors[i * 3 + c] = Number.isFinite(rgb[c]) ? rgb[c]! : 0;
  }
  geometry.setAttribute("color", new s.Float32BufferAttribute(colors, 3));
  return geometry;
}
