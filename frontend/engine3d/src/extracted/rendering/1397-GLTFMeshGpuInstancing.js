/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 857818:859215.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1397(scope) {
scope.GLTFMeshGpuInstancing = class GLTFMeshGpuInstancing {
  constructor(e) {
    this.name = scope.EXTENSIONS.EXT_MESH_GPU_INSTANCING, this.parser = e;
  }
  createNodeMesh(e) {
    const i = this.parser.json,
      s = i.nodes[e];
    if (!s.extensions || !s.extensions[this.name] || s.mesh === void 0) return null;
    const a = i.meshes[s.mesh];
    for (const d of a.primitives) if (d.mode !== scope.WEBGL_CONSTANTS.TRIANGLES && d.mode !== scope.WEBGL_CONSTANTS.TRIANGLE_STRIP && d.mode !== scope.WEBGL_CONSTANTS.TRIANGLE_FAN && d.mode !== void 0) return null;
    const l = s.extensions[this.name].attributes,
      c = [],
      h = {};
    for (const d in l) c.push(this.parser.getDependency("accessor", l[d]).then(p => (h[d] = p, h[d])));
    return c.length < 1 ? null : (c.push(this.parser.createNodeMesh(e)), Promise.all(c).then(d => {
      const p = d.pop(),
        f = p.isGroup ? p.children : [p],
        _ = d[0].count,
        x = [];
      for (const b of f) {
        const T = new scope.Matrix4(),
          M = new scope.Vector3(),
          w = new scope.Quaternion(),
          D = new scope.Vector3(1, 1, 1),
          R = new scope.InstancedMesh(b.geometry, b.material, _);
        for (let P = 0; P < _; P++) h.TRANSLATION && M.fromBufferAttribute(h.TRANSLATION, P), h.ROTATION && w.fromBufferAttribute(h.ROTATION, P), h.SCALE && D.fromBufferAttribute(h.SCALE, P), R.setMatrixAt(P, T.compose(M, w, D));
        for (const P in h) if (P === "_COLOR_0") {
          const U = h[P];
          R.instanceColor = new scope.InstancedBufferAttribute(U.array, U.itemSize, U.normalized);
        } else P !== "TRANSLATION" && P !== "ROTATION" && P !== "SCALE" && b.geometry.setAttribute(P, h[P]);
        scope.Object3D.prototype.copy.call(R, b), this.parser.assignFinalMaterial(R), x.push(R);
      }
      return p.isGroup ? (p.clear(), p.add(...x), p) : x[0];
    }));
  }
};
}
