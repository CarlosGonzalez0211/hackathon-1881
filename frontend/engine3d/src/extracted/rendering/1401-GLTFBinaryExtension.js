/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 859351:860378.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1401(scope) {
scope.GLTFBinaryExtension = class GLTFBinaryExtension {
  constructor(e) {
    this.name = scope.EXTENSIONS.KHR_BINARY_GLTF, this.content = null, this.body = null;
    const i = new DataView(e, 0, scope.BINARY_EXTENSION_HEADER_LENGTH),
      s = new TextDecoder();
    if (this.header = {
      magic: s.decode(new Uint8Array(e.slice(0, 4))),
      version: i.getUint32(4, !0),
      length: i.getUint32(8, !0)
    }, this.header.magic !== scope.BINARY_EXTENSION_HEADER_MAGIC) throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");
    if (this.header.version < 2) throw new Error("THREE.GLTFLoader: Legacy binary file detected.");
    const a = this.header.length - scope.BINARY_EXTENSION_HEADER_LENGTH,
      o = new DataView(e, scope.BINARY_EXTENSION_HEADER_LENGTH);
    let l = 0;
    for (; l < a;) {
      const c = o.getUint32(l, !0);
      l += 4;
      const h = o.getUint32(l, !0);
      if (l += 4, h === scope.BINARY_EXTENSION_CHUNK_TYPES.JSON) {
        const d = new Uint8Array(e, scope.BINARY_EXTENSION_HEADER_LENGTH + l, c);
        this.content = s.decode(d);
      } else if (h === scope.BINARY_EXTENSION_CHUNK_TYPES.BIN) {
        const d = scope.BINARY_EXTENSION_HEADER_LENGTH + l;
        this.body = e.slice(d, d + c);
      }
      l += c;
    }
    if (this.content === null) throw new Error("THREE.GLTFLoader: JSON content not found.");
  }
};
}
