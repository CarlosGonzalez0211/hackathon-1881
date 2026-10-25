/**
 * Cage + subdivision: hand-place a low-poly cage, Loop-subdivide it into a soft mass.
 *
 *   const rock = subdivide(THREE, cage(THREE, { vertices, faces }), 2);
 *
 * - `cage`: `vertices: [[x, y, z], ...]`, `faces: [[a, b, c] | [a, b, c, d], ...]` with
 *   counter-clockwise winding seen from outside. Quads are split along a-c.
 * - `subdivide`: three-subdivide LoopSubdivision with `split: false` (no coplanar splitting, so
 *   a flat cage face stays flat-ish and the silhouette is the cage's, softened). The library
 *   hashes positions at two decimals, so the cage is scaled to a ~10 unit radius for the
 *   subdivision and scaled back. The result is welded (indexed) with smooth normals.
 *
 * Typical follow-up: `displace` with low-frequency noise, `smoothNormals` with a crease angle,
 * then `bake*` for vertex colour. ES import from the build file: the package `main` is a UMD
 * bundle that would load a second copy of three.
 */
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { LoopSubdivision } from "three-subdivide/build/index.module.js";

/** @param {import("three")} THREE */
export function cage(THREE, { vertices, faces }) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices.flat(), 3));
  const indices = [];
  for (const face of faces) {
    if (face.length === 3) indices.push(face[0], face[1], face[2]);
    else if (face.length === 4) indices.push(face[0], face[1], face[2], face[0], face[2], face[3]);
    else throw new Error(`cage faces must be triangles or quads, got ${face.length} vertices`);
  }
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * @param {import("three")} THREE
 * @param {import("three").BufferGeometry} geometry
 */
export function subdivide(THREE, geometry, iterations = 2, params = {}) {
  const source = new THREE.BufferGeometry();
  source.setAttribute("position", geometry.attributes.position.clone());
  if (geometry.index) source.setIndex(geometry.index.clone());
  source.computeBoundingSphere();
  const radius = source.boundingSphere.radius || 1;
  const scale = 10 / radius;
  source.scale(scale, scale, scale);
  const options = {
    split: false,
    uvSmooth: false,
    preserveEdges: false,
    flatOnly: false,
    ...params,
  };
  const raw = LoopSubdivision.modify(source, iterations, options);
  const bare = new THREE.BufferGeometry();
  bare.setAttribute("position", raw.attributes.position);
  const welded = mergeVertices(bare, 1e-4);
  welded.scale(1 / scale, 1 / scale, 1 / scale);
  welded.computeVertexNormals();
  welded.computeBoundingBox();
  welded.computeBoundingSphere();
  return welded;
}
