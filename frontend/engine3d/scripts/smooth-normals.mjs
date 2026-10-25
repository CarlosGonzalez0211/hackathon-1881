/**
 * Crease-aware vertex normals. The kit authors many solids as faceted, split-vertex meshes
 * (12-sided towers, icosahedral rocks, flat-shaded roofs). Each vertex here takes the
 * area-weighted normals of every face that touches its position and lies within the crease
 * angle of the vertex's own faces: shallow facets read as continuous curves while roof eaves,
 * steps and plank edges stay crisp. Topology is unchanged, so rigs and UVs are untouched.
 */
const QUANTUM = 1e4;

export function smoothNormals(document, creaseDegrees = 55) {
  const limit = Math.cos((creaseDegrees * Math.PI) / 180);
  let touched = 0;
  for (const mesh of document.getRoot().listMeshes())
    for (const primitive of mesh.listPrimitives()) {
      if (primitive.getMode() !== 4) continue; // TRIANGLES only
      const position = primitive.getAttribute("POSITION");
      if (!position) continue;
      const count = position.getCount();
      const indexAccessor = primitive.getIndices();
      const indices = indexAccessor
        ? Array.from(indexAccessor.getArray())
        : Array.from({ length: count }, (_, i) => i);
      const p = position.getArray();
      const faces = indices.length / 3;
      const faceNormal = new Float64Array(faces * 3);
      const vertexFaces = Array.from({ length: count }, () => []);
      for (let f = 0; f < faces; f++) {
        const a = indices[f * 3] * 3,
          b = indices[f * 3 + 1] * 3,
          c = indices[f * 3 + 2] * 3;
        const ux = p[b] - p[a],
          uy = p[b + 1] - p[a + 1],
          uz = p[b + 2] - p[a + 2];
        const vx = p[c] - p[a],
          vy = p[c + 1] - p[a + 1],
          vz = p[c + 2] - p[a + 2];
        // Unnormalised cross product: its length is twice the area, the weight we want.
        faceNormal[f * 3] = uy * vz - uz * vy;
        faceNormal[f * 3 + 1] = uz * vx - ux * vz;
        faceNormal[f * 3 + 2] = ux * vy - uy * vx;
        for (let k = 0; k < 3; k++) vertexFaces[indices[f * 3 + k]].push(f);
      }
      const unit = (f) => {
        const x = faceNormal[f * 3],
          y = faceNormal[f * 3 + 1],
          z = faceNormal[f * 3 + 2];
        const length = Math.hypot(x, y, z) || 1;
        return [x / length, y / length, z / length];
      };
      const groups = new Map();
      const key = (v) =>
        `${Math.round(p[v * 3] * QUANTUM)},${Math.round(p[v * 3 + 1] * QUANTUM)},${Math.round(p[v * 3 + 2] * QUANTUM)}`;
      for (let v = 0; v < count; v++) {
        const k = key(v);
        const group = groups.get(k);
        if (group) group.push(...vertexFaces[v]);
        else groups.set(k, [...vertexFaces[v]]);
      }
      const normals = new Float32Array(count * 3);
      for (let v = 0; v < count; v++) {
        const own = vertexFaces[v];
        if (!own.length) {
          normals[v * 3 + 1] = 1;
          continue;
        }
        let ox = 0,
          oy = 0,
          oz = 0;
        for (const f of own) {
          ox += faceNormal[f * 3];
          oy += faceNormal[f * 3 + 1];
          oz += faceNormal[f * 3 + 2];
        }
        const ol = Math.hypot(ox, oy, oz) || 1;
        const reference = [ox / ol, oy / ol, oz / ol];
        let nx = 0,
          ny = 0,
          nz = 0;
        for (const f of new Set(groups.get(key(v)))) {
          const n = unit(f);
          if (n[0] * reference[0] + n[1] * reference[1] + n[2] * reference[2] < limit) continue;
          nx += faceNormal[f * 3];
          ny += faceNormal[f * 3 + 1];
          nz += faceNormal[f * 3 + 2];
        }
        const length = Math.hypot(nx, ny, nz);
        const n = length > 1e-12 ? [nx / length, ny / length, nz / length] : reference;
        normals.set(n, v * 3);
      }
      let normal = primitive.getAttribute("NORMAL");
      if (!normal) {
        normal = document.createAccessor().setType("VEC3");
        const buffer = position.getBuffer();
        if (buffer) normal.setBuffer(buffer);
        primitive.setAttribute("NORMAL", normal);
      }
      normal.setArray(normals);
      touched++;
    }
  return touched;
}
