/**
 * Alpha cards: leaf fringes, grass tufts, flowers, rune glyphs. Quads textured from a painted
 * atlas (see paint/foliage.mjs) that is attached to the GLB after export (never as a THREE
 * Texture in Node). Pair with a material using `alphaTest`, `side: DoubleSide` and
 * `vertexColors: true` (the vertex colour tints the card, dark at the base).
 *
 *   fringeRing(THREE, { center, radius, count, width, height, rect })   // leaf fringe on a crown
 *   crossCards(THREE, { width, height, count, rect })                    // grass tuft / flower
 *
 * Per-vertex data: `normal` points away from the parent sphere centre (so a card shades as
 * part of the mass it fringes), `athena_center` (exported as `_ATHENA_CENTER`) holds that
 * centre for the runtime wind and shading, `uv` is a rect of the atlas in glTF convention
 * (v runs down the image), `color` is the tint. `rect` is `{ x, y, w, h }` in atlas pixels.
 */
import { lcg } from "./noise.mjs";

/** UV corners of an atlas rect (glTF convention: origin top-left, v down). */
export function atlasRect(rect, atlasSize = 512) {
  return {
    u0: rect.x / atlasSize,
    u1: (rect.x + rect.w) / atlasSize,
    vTop: rect.y / atlasSize,
    vBottom: (rect.y + rect.h) / atlasSize,
  };
}

function assemble(THREE, quads, centre, rect, atlasSize, tint) {
  const uv = atlasRect(rect, atlasSize);
  const bottom = new THREE.Color(tint[0]);
  const top = new THREE.Color(tint[1]);
  const positions = [];
  const normals = [];
  const uvs = [];
  const colors = [];
  const centres = [];
  const indices = [];
  for (const quad of quads) {
    const base = positions.length / 3;
    // quad = [bottomLeft, bottomRight, topRight, topLeft]
    quad.forEach((point, k) => {
      positions.push(point.x, point.y, point.z);
      const n = point.clone().sub(centre).normalize();
      normals.push(n.x, n.y, n.z);
      uvs.push(k === 0 || k === 3 ? uv.u0 : uv.u1, k < 2 ? uv.vBottom : uv.vTop);
      const c = k < 2 ? bottom : top;
      colors.push(c.r, c.g, c.b);
      centres.push(centre.x, centre.y, centre.z);
    });
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute("athena_center", new THREE.Float32BufferAttribute(centres, 3));
  geometry.setIndex(indices);
  return geometry;
}

/**
 * Cards standing on a ring around `center`, leaning outward by `tilt`, with a little seeded
 * variation in size and yaw (rule 5: authored irregularity, bounded).
 */
export function fringeRing(
  THREE,
  {
    center = [0, 0, 0],
    radius = 0.4,
    count = 8,
    width = 0.4,
    height = 0.4,
    tilt = 0.5,
    rect,
    atlasSize = 512,
    tint = ["#3F7A5B", "#A8C97A"],
    seed = 1,
    variation = 0.12,
    startAngle = 0,
  },
) {
  const random = lcg(seed);
  const c = new THREE.Vector3(...center);
  const quads = [];
  for (let k = 0; k < count; k++) {
    const angle = startAngle + (k / count) * Math.PI * 2 + (random() - 0.5) * variation;
    const scale = 1 + (random() - 0.5) * variation * 2;
    const outward = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
    const along = new THREE.Vector3(Math.cos(angle), 0, -Math.sin(angle));
    const base = c.clone().addScaledVector(outward, radius);
    const up = new THREE.Vector3(0, Math.cos(tilt), 0).addScaledVector(outward, Math.sin(tilt));
    const half = (width * scale) / 2;
    const top = base.clone().addScaledVector(up, height * scale);
    quads.push([
      base.clone().addScaledVector(along, -half),
      base.clone().addScaledVector(along, half),
      top.clone().addScaledVector(along, half),
      top.clone().addScaledVector(along, -half),
    ]);
  }
  return assemble(THREE, quads, c, rect, atlasSize, tint);
}

/** `count` vertical quads crossing on the Y axis (2 = a plus-shaped tuft), base at y = 0. */
export function crossCards(
  THREE,
  {
    width = 0.3,
    height = 0.4,
    count = 2,
    rect,
    atlasSize = 512,
    tint = ["#3F7A5B", "#A8C97A"],
    lean = 0,
  },
) {
  const quads = [];
  for (let k = 0; k < count; k++) {
    const angle = (k / count) * Math.PI;
    const along = new THREE.Vector3(Math.cos(angle), 0, -Math.sin(angle));
    const outward = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
    const half = width / 2;
    const lift = new THREE.Vector3(0, height, 0).addScaledVector(outward, lean);
    quads.push([
      along.clone().multiplyScalar(-half),
      along.clone().multiplyScalar(half),
      along.clone().multiplyScalar(half).add(lift),
      along.clone().multiplyScalar(-half).add(lift),
    ]);
  }
  // Shade a tuft as if it grew from a point below it, so the normals fan upward.
  return assemble(THREE, quads, new THREE.Vector3(0, -height * 0.5, 0), rect, atlasSize, tint);
}
