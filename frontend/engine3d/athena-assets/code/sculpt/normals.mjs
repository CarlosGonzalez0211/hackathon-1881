/**
 * Crease-aware vertex normals for BufferGeometry (port of scripts/smooth-normals.mjs, which
 * does the same on glTF documents inside the asset build).
 *
 * Each vertex takes the area-weighted normals of every face that touches its position and
 * lies within the crease angle of the vertex's own faces, so shallow facets read as one
 * continuous curve while real edges (eaves, cap rims, steps) stay crisp. Topology is
 * unchanged; split vertices that share a position end up with matching normals when their
 * faces are inside the crease, which also closes UV seams and lathe seams.
 *
 * Pure array maths: no THREE import needed.
 */
const QUANTUM = 1e4;

/** @param {import("three").BufferGeometry} geometry */
export function smoothNormals(geometry, creaseDegrees = 55) {
  const position = geometry.attributes.position;
  const count = position.count;
  const p = position.array;
  const indices = geometry.index
    ? Array.from(geometry.index.array)
    : Array.from({ length: count }, (_, i) => i);
  const limit = Math.cos((creaseDegrees * Math.PI) / 180);
  const faces = indices.length / 3;
  const faceNormal = new Float64Array(faces * 3);
  const vertexFaces = Array.from({ length: count }, () => []);
  for (let f = 0; f < faces; f++) {
    const a = indices[f * 3] * 3;
    const b = indices[f * 3 + 1] * 3;
    const c = indices[f * 3 + 2] * 3;
    const ux = p[b] - p[a];
    const uy = p[b + 1] - p[a + 1];
    const uz = p[b + 2] - p[a + 2];
    const vx = p[c] - p[a];
    const vy = p[c + 1] - p[a + 1];
    const vz = p[c + 2] - p[a + 2];
    // Unnormalised cross product: its length is twice the area, the weight we want.
    faceNormal[f * 3] = uy * vz - uz * vy;
    faceNormal[f * 3 + 1] = uz * vx - ux * vz;
    faceNormal[f * 3 + 2] = ux * vy - uy * vx;
    for (let k = 0; k < 3; k++) vertexFaces[indices[f * 3 + k]].push(f);
  }
  const unit = (f) => {
    const x = faceNormal[f * 3];
    const y = faceNormal[f * 3 + 1];
    const z = faceNormal[f * 3 + 2];
    const length = Math.hypot(x, y, z) || 1;
    return [x / length, y / length, z / length];
  };
  const key = (v) =>
    `${Math.round(p[v * 3] * QUANTUM)},${Math.round(p[v * 3 + 1] * QUANTUM)},${Math.round(p[v * 3 + 2] * QUANTUM)}`;
  const keys = new Array(count);
  const groups = new Map();
  for (let v = 0; v < count; v++) {
    const k = (keys[v] = key(v));
    const group = groups.get(k);
    if (group) group.push(...vertexFaces[v]);
    else groups.set(k, [...vertexFaces[v]]);
  }
  const previous = geometry.attributes.normal;
  const normals = new Float32Array(count * 3);
  for (let v = 0; v < count; v++) {
    const own = vertexFaces[v];
    if (!own.length) {
      normals[v * 3 + 1] = 1;
      continue;
    }
    let ox = 0;
    let oy = 0;
    let oz = 0;
    for (const f of own) {
      ox += faceNormal[f * 3];
      oy += faceNormal[f * 3 + 1];
      oz += faceNormal[f * 3 + 2];
    }
    const ol = Math.hypot(ox, oy, oz);
    // Degenerate faces have no direction: never emit a zero normal (NaN in shading).
    if (ol < 1e-12) {
      const kept = previous ? [previous.getX(v), previous.getY(v), previous.getZ(v)] : [0, 1, 0];
      normals.set(Math.hypot(...kept) > 1e-6 ? kept : [0, 1, 0], v * 3);
      continue;
    }
    const reference = [ox / ol, oy / ol, oz / ol];
    let nx = 0;
    let ny = 0;
    let nz = 0;
    for (const f of new Set(groups.get(keys[v]))) {
      const n = unit(f);
      if (n[0] * reference[0] + n[1] * reference[1] + n[2] * reference[2] < limit) continue;
      nx += faceNormal[f * 3];
      ny += faceNormal[f * 3 + 1];
      nz += faceNormal[f * 3 + 2];
    }
    const length = Math.hypot(nx, ny, nz);
    normals.set(length > 1e-12 ? [nx / length, ny / length, nz / length] : reference, v * 3);
  }
  geometry.setAttribute("normal", new geometry.attributes.position.constructor(normals, 3));
  return geometry;
}

/** Number of zero-area triangles (used by the geometry tests and the generator report). */
export function degenerateTriangles(geometry, epsilon = 1e-10) {
  const p = geometry.attributes.position.array;
  const index = geometry.index?.array;
  const triangles = (index ? index.length : geometry.attributes.position.count) / 3;
  let degenerate = 0;
  for (let t = 0; t < triangles; t++) {
    const [a, b, c] = [0, 1, 2].map((k) => (index ? index[t * 3 + k] : t * 3 + k) * 3);
    const ux = p[b] - p[a];
    const uy = p[b + 1] - p[a + 1];
    const uz = p[b + 2] - p[a + 2];
    const vx = p[c] - p[a];
    const vy = p[c + 1] - p[a + 1];
    const vz = p[c + 2] - p[a + 2];
    const area = Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx) / 2;
    if (!(area > epsilon)) degenerate++;
  }
  return degenerate;
}
