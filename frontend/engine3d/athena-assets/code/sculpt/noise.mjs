/**
 * Seeded noise and displacement.
 *
 * - `lcg(seed)`        small deterministic random source (0..1), the only randomness the kit uses.
 * - `createNoise(seed)` simplex noise (three/addons SimplexNoise) fed by that source, so the same
 *                      seed always produces the same rock.
 * - `displace(...)`    move vertices along their (position-averaged) normal by a scalar field.
 *                      Vertices that share a position move together, so split or UV-seamed
 *                      meshes never crack.
 *
 * Rule 5 of the art direction: displacement is low-frequency and authored (a few octaves at
 * most). Never use it as per-vertex jitter.
 */
import { SimplexNoise } from "three/addons/math/SimplexNoise.js";

/** Numerical Recipes LCG. Returns a function producing floats in [0, 1). */
export function lcg(seed = 1) {
  let state = seed >>> 0 || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** @returns {{ noise2(x:number,y:number):number, noise3(x:number,y:number,z:number):number, fbm3(x:number,y:number,z:number,o?:object):number }} */
export function createNoise(seed = 1) {
  const simplex = new SimplexNoise({ random: lcg(seed) });
  const noise3 = (x, y, z) => simplex.noise3d(x, y, z);
  return {
    noise2: (x, y) => simplex.noise(x, y),
    noise3,
    /** Fractal sum, normalised to roughly [-1, 1]. */
    fbm3(x, y, z, { octaves = 3, lacunarity = 2, gain = 0.5 } = {}) {
      let sum = 0;
      let amplitude = 1;
      let frequency = 1;
      let total = 0;
      for (let i = 0; i < octaves; i++) {
        sum += amplitude * noise3(x * frequency, y * frequency, z * frequency);
        total += amplitude;
        amplitude *= gain;
        frequency *= lacunarity;
      }
      return sum / total;
    },
  };
}

const QUANTUM = 1e4;

/**
 * @param {import("three")} THREE
 * @param {import("three").BufferGeometry} geometry
 * @param {(position: import("three").Vector3, normal: import("three").Vector3, index: number) => number | [number, number, number]} fn
 *   Scalar = distance along the normal, array = world-space offset.
 */
export function displace(THREE, geometry, fn) {
  const position = geometry.attributes.position;
  if (!geometry.attributes.normal) geometry.computeVertexNormals();
  const normal = geometry.attributes.normal;
  const count = position.count;
  // Average the normal of every vertex that shares a position.
  const keyOf = (i) =>
    `${Math.round(position.getX(i) * QUANTUM)},${Math.round(position.getY(i) * QUANTUM)},${Math.round(position.getZ(i) * QUANTUM)}`;
  const groups = new Map();
  const keys = new Array(count);
  for (let i = 0; i < count; i++) {
    const key = (keys[i] = keyOf(i));
    const group = groups.get(key) ?? { n: new THREE.Vector3(), first: i };
    group.n.x += normal.getX(i);
    group.n.y += normal.getY(i);
    group.n.z += normal.getZ(i);
    groups.set(key, group);
  }
  const offsets = new Map();
  const p = new THREE.Vector3();
  const n = new THREE.Vector3();
  for (const [key, group] of groups) {
    p.fromBufferAttribute(position, group.first);
    n.copy(group.n);
    if (n.lengthSq() < 1e-12) n.set(0, 1, 0);
    n.normalize();
    const result = fn(p.clone(), n.clone(), group.first);
    offsets.set(
      key,
      typeof result === "number"
        ? [n.x * result, n.y * result, n.z * result]
        : [result[0], result[1], result[2]],
    );
  }
  for (let i = 0; i < count; i++) {
    const o = offsets.get(keys[i]);
    position.setXYZ(i, position.getX(i) + o[0], position.getY(i) + o[1], position.getZ(i) + o[2]);
  }
  position.needsUpdate = true;
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}
