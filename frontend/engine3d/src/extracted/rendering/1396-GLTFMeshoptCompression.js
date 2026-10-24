/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 856918:857818.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1396(scope) {
scope.GLTFMeshoptCompression = class GLTFMeshoptCompression {
  constructor(e) {
    this.name = scope.EXTENSIONS.EXT_MESHOPT_COMPRESSION, this.parser = e;
  }
  loadBufferView(e) {
    const i = this.parser.json,
      s = i.bufferViews[e];
    if (s.extensions && s.extensions[this.name]) {
      const a = s.extensions[this.name],
        o = this.parser.getDependency("buffer", a.buffer),
        l = this.parser.options.meshoptDecoder;
      if (!l || !l.supported) {
        if (i.extensionsRequired && i.extensionsRequired.indexOf(this.name) >= 0) throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");
        return null;
      }
      return o.then(function (c) {
        const h = a.byteOffset || 0,
          d = a.byteLength || 0,
          p = a.count,
          f = a.byteStride,
          _ = new Uint8Array(c, h, d);
        return l.decodeGltfBufferAsync ? l.decodeGltfBufferAsync(p, f, _, a.mode, a.filter).then(function (x) {
          return x.buffer;
        }) : l.ready.then(function () {
          const x = new ArrayBuffer(p * f);
          return l.decodeGltfBuffer(new Uint8Array(x), p, f, _, a.mode, a.filter), x;
        });
      });
    } else return null;
  }
};
}
