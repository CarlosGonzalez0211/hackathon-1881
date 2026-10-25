import type { LegacyContext } from "../runtime/legacy-context";

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
