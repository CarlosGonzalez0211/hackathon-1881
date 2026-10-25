/**
 * Vertex-colour baking. Every function multiplies into (or creates) a Float32 `color`
 * attribute, so passes compose: `bakeFill` first, then gradient / direction / occlusion.
 * Colours are hex strings read through THREE.Color (sRGB in, linear out, which is what glTF
 * COLOR_0 stores). Use with a material that has `vertexColors: true` and a white base colour.
 *
 *   bakeFill(THREE, g, "#F4E9D8")
 *   bakeGradient(THREE, g, { bottom: "#6E4F3C", top: "#FBF3E4" })   // rule 4: dark base, pale top
 *   bakeDirection(THREE, g, { color: "#3F7A5B", direction: [0, 1, 0], threshold: 0.6 })  // moss
 *   bakeOcclusion(THREE, g, { sdf, strength: 0.5 })                  // cheap cavity darkening
 */

function ensureColor(THREE, geometry, fill = 1) {
  let color = geometry.attributes.color;
  if (!color || color.itemSize !== 3 || !(color.array instanceof Float32Array)) {
    color = new THREE.BufferAttribute(new Float32Array(geometry.attributes.position.count * 3), 3);
    color.array.fill(fill);
    geometry.setAttribute("color", color);
  }
  return color;
}
const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a || 1)));
  return t * t * (3 - 2 * t);
};

/** Replace the colour of every vertex. */
export function bakeFill(THREE, geometry, hex) {
  const c = new THREE.Color(hex);
  const color = ensureColor(THREE, geometry);
  for (let i = 0; i < color.count; i++) color.setXYZ(i, c.r, c.g, c.b);
  return geometry;
}

/**
 * Multiply a bottom-to-top gradient along `axis` (default y). `from`/`to` default to the
 * geometry's extent; `curve` > 1 keeps the base dark for longer.
 */
export function bakeGradient(
  THREE,
  geometry,
  { bottom, top, axis = 1, from, to, curve = 1, strength = 1 },
) {
  const color = ensureColor(THREE, geometry);
  const position = geometry.attributes.position;
  geometry.computeBoundingBox();
  const lo = from ?? geometry.boundingBox.min.getComponent(axis);
  const hi = to ?? geometry.boundingBox.max.getComponent(axis);
  const a = new THREE.Color(bottom);
  const b = new THREE.Color(top);
  const mix = new THREE.Color();
  for (let i = 0; i < color.count; i++) {
    const t = Math.pow(
      Math.min(1, Math.max(0, (position.getComponent(i, axis) - lo) / (hi - lo || 1))),
      curve,
    );
    mix.copy(a).lerp(b, t);
    const s = strength;
    color.setXYZ(
      i,
      color.getX(i) * (1 - s + s * mix.r),
      color.getY(i) * (1 - s + s * mix.g),
      color.getZ(i) * (1 - s + s * mix.b),
    );
  }
  return geometry;
}

/**
 * Tint vertices whose normal faces `direction` (moss on +Y, dirt on the ground-facing side of
 * walls with direction [0, -1, 0]). The tint multiplies at `strength` weighted by how far the
 * normal is past `threshold` (dot product), with a soft edge of `softness`.
 */
export function bakeDirection(
  THREE,
  geometry,
  { color: hex, direction = [0, 1, 0], threshold = 0.5, softness = 0.25, strength = 1 },
) {
  if (!geometry.attributes.normal) geometry.computeVertexNormals();
  const color = ensureColor(THREE, geometry);
  const normal = geometry.attributes.normal;
  const target = new THREE.Color(hex);
  const d = new THREE.Vector3(...direction).normalize();
  for (let i = 0; i < color.count; i++) {
    const dot = normal.getX(i) * d.x + normal.getY(i) * d.y + normal.getZ(i) * d.z;
    const w = smooth(threshold - softness, threshold + softness, dot) * strength;
    color.setXYZ(
      i,
      color.getX(i) * (1 - w) + target.r * w,
      color.getY(i) * (1 - w) + target.g * w,
      color.getZ(i) * (1 - w) + target.b * w,
    );
  }
  return geometry;
}

/**
 * Cheap ambient occlusion. With an SDF scene it samples the field along the normal
 * (occlusion = how much closer the world is than the sample distance). Without one it
 * counts nearby vertices in front of each vertex's normal hemisphere (a coarse cavity
 * estimate that only needs the mesh itself).
 */
export function bakeOcclusion(
  THREE,
  geometry,
  { sdf, radius = 0.25, strength = 0.5, taps = [0.25, 0.5, 0.75, 1] },
) {
  if (!geometry.attributes.normal) geometry.computeVertexNormals();
  const color = ensureColor(THREE, geometry);
  const position = geometry.attributes.position;
  const normal = geometry.attributes.normal;
  const count = color.count;
  const occlusion = new Float32Array(count);
  if (sdf) {
    for (let i = 0; i < count; i++) {
      let sum = 0;
      for (const tap of taps) {
        const d = tap * radius;
        const field = sdf(
          position.getX(i) + normal.getX(i) * d,
          position.getY(i) + normal.getY(i) * d,
          position.getZ(i) + normal.getZ(i) * d,
        );
        sum += Math.max(0, d - field) / d / taps.length;
      }
      occlusion[i] = Math.min(1, sum);
    }
  } else {
    const cell = radius;
    const grid = new Map();
    const key = (x, y, z) =>
      `${Math.floor(x / cell)},${Math.floor(y / cell)},${Math.floor(z / cell)}`;
    for (let i = 0; i < count; i++) {
      const k = key(position.getX(i), position.getY(i), position.getZ(i));
      const list = grid.get(k);
      if (list) list.push(i);
      else grid.set(k, [i]);
    }
    for (let i = 0; i < count; i++) {
      const x = position.getX(i);
      const y = position.getY(i);
      const z = position.getZ(i);
      let sum = 0;
      let seen = 0;
      for (let dx = -1; dx <= 1; dx++)
        for (let dy = -1; dy <= 1; dy++)
          for (let dz = -1; dz <= 1; dz++) {
            const list = grid.get(key(x + dx * cell, y + dy * cell, z + dz * cell));
            if (!list) continue;
            for (const j of list) {
              if (j === i) continue;
              const vx = position.getX(j) - x;
              const vy = position.getY(j) - y;
              const vz = position.getZ(j) - z;
              const distance = Math.hypot(vx, vy, vz);
              if (distance < 1e-6 || distance > radius) continue;
              seen++;
              const front =
                (vx * normal.getX(i) + vy * normal.getY(i) + vz * normal.getZ(i)) / distance;
              if (front > 0.2) sum += (1 - distance / radius) * front;
            }
          }
      occlusion[i] = seen ? Math.min(1, (sum / seen) * 2) : 0;
    }
  }
  for (let i = 0; i < count; i++) {
    const k = 1 - occlusion[i] * strength;
    color.setXYZ(i, color.getX(i) * k, color.getY(i) * k, color.getZ(i) * k);
  }
  return geometry;
}
