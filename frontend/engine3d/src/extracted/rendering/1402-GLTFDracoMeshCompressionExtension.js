/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 860378:861281.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1402(scope) {
scope.GLTFDracoMeshCompressionExtension = class GLTFDracoMeshCompressionExtension {
  constructor(e, i) {
    if (!i) throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");
    this.name = scope.EXTENSIONS.KHR_DRACO_MESH_COMPRESSION, this.json = e, this.dracoLoader = i, this.dracoLoader.preload();
  }
  decodePrimitive(e, i) {
    const s = this.json,
      a = this.dracoLoader,
      o = e.extensions[this.name].bufferView,
      l = e.extensions[this.name].attributes,
      c = {},
      h = {},
      d = {};
    for (const p in l) {
      const f = scope.ATTRIBUTES[p] || p.toLowerCase();
      c[f] = l[p];
    }
    for (const p in e.attributes) {
      const f = scope.ATTRIBUTES[p] || p.toLowerCase();
      if (l[p] !== void 0) {
        const _ = s.accessors[e.attributes[p]],
          x = scope.WEBGL_COMPONENT_TYPES[_.componentType];
        d[f] = x.name, h[f] = _.normalized === !0;
      }
    }
    return i.getDependency("bufferView", o).then(function (p) {
      return new Promise(function (f, _) {
        a.decodeDracoFile(p, function (x) {
          for (const b in x.attributes) {
            const T = x.attributes[b],
              M = h[b];
            M !== void 0 && (T.normalized = M);
          }
          f(x);
        }, c, d, scope.LinearSRGBColorSpace, _);
      });
    });
  }
};
}
