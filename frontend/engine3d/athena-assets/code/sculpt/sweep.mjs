/**
 * Sweep: a tube of varying radius along a curve.
 *
 *   sweep(THREE, curve, { radius, tubular, radial, caps, twist })
 *
 * - `curve`   any THREE.Curve (typically a CatmullRomCurve3 through authored points).
 * - `radius`  a number, or `r(t)` for t in 0..1 along the curve (taper, flare, swell). A
 *             radius of 0 at an end closes it to a point without zero-area triangles.
 * - `caps`    false | "flat" | "round" (true = "flat"). Round caps add a quarter-circle of
 *             three extra rings, enough for hair-lock tips, rail ends and branch stubs.
 * - `twist`   total extra rotation of the cross-section along the curve (radians).
 *
 * Branches, hair locks, scarf tails, rails, vines, tails and smoke are all sweeps. Returns an
 * indexed BufferGeometry with position, normal (crease-aware) and uv (u around, v along).
 */
import { smoothNormals } from "./normals.mjs";

const TAU = Math.PI * 2;

export function sweep(
  THREE,
  curve,
  { radius = 0.05, tubular = 24, radial = 8, caps = false, twist = 0, crease = 60 } = {},
) {
  const radiusAt = typeof radius === "function" ? radius : () => radius;
  const frames = curve.computeFrenetFrames(tubular, false);
  const capMode = caps === true ? "flat" : caps;
  const rings = []; // { c: Vector3, r, n: Vector3, b: Vector3, v }
  const along = [];
  for (let i = 0; i <= tubular; i++) {
    const t = i / tubular;
    const angle = twist * t;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const n = frames.normals[i]
      .clone()
      .multiplyScalar(cos)
      .addScaledVector(frames.binormals[i], sin);
    const b = frames.binormals[i]
      .clone()
      .multiplyScalar(cos)
      .addScaledVector(frames.normals[i], -sin);
    along.push({ c: curve.getPoint(t), r: Math.max(0, radiusAt(t)), n, b, v: t });
  }
  if (capMode === "round") {
    const first = along[0];
    const last = along[tubular];
    const startTangent = frames.tangents[0];
    const endTangent = frames.tangents[tubular];
    const make = (end, tangent, sign, phi) => ({
      c: end.c.clone().addScaledVector(tangent, sign * end.r * Math.sin(phi)),
      r: end.r * Math.cos(phi),
      n: end.n,
      b: end.b,
      v: end.v,
    });
    const phis = [Math.PI / 2, Math.PI / 3, Math.PI / 6];
    for (const phi of phis) rings.push(make(first, startTangent, -1, phi));
    rings.push(...along);
    for (const phi of [...phis].reverse()) rings.push(make(last, endTangent, 1, phi));
  } else rings.push(...along);

  const positions = [];
  const uvs = [];
  const indices = [];
  for (const ring of rings)
    for (let k = 0; k <= radial; k++) {
      const a = (k / radial) * TAU;
      const x = Math.cos(a) * ring.r;
      const y = Math.sin(a) * ring.r;
      positions.push(
        ring.c.x + ring.n.x * x + ring.b.x * y,
        ring.c.y + ring.n.y * x + ring.b.y * y,
        ring.c.z + ring.n.z * x + ring.b.z * y,
      );
      uvs.push(k / radial, ring.v);
    }
  const stride = radial + 1;
  for (let j = 0; j < rings.length - 1; j++)
    for (let k = 0; k < radial; k++) {
      const a = j * stride + k;
      const b = a + 1;
      const c = a + stride;
      const d = c + 1;
      if (rings[j].r > 1e-7) indices.push(a, b, c);
      if (rings[j + 1].r > 1e-7) indices.push(b, d, c);
    }

  if (capMode === "flat") {
    for (const [end, sign] of [
      [along[0], -1],
      [along[tubular], 1],
    ]) {
      if (end.r <= 1e-7) continue;
      const centre = positions.length / 3;
      positions.push(end.c.x, end.c.y, end.c.z);
      uvs.push(0.5, end.v);
      const ringStart = centre + 1;
      for (let k = 0; k <= radial; k++) {
        const source = (sign < 0 ? 0 : tubular) * stride + k;
        positions.push(positions[source * 3], positions[source * 3 + 1], positions[source * 3 + 2]);
        uvs.push(k / radial, end.v);
      }
      for (let k = 0; k < radial; k++)
        if (sign < 0) indices.push(centre, ringStart + k + 1, ringStart + k);
        else indices.push(centre, ringStart + k, ringStart + k + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  return smoothNormals(geometry, crease);
}
