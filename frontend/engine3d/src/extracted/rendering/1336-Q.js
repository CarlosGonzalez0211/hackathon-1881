/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 773540:774159.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1336(scope) {
scope.Q = class Q {
  init() {
    return scope.A || (scope.A = typeof fetch < "u" ? fetch("data:application/wasm;base64," + scope.C).then(e => e.arrayBuffer()).then(e => WebAssembly.instantiate(e, scope.g)).then(this._init) : WebAssembly.instantiate(Buffer.from(scope.C, "base64"), scope.g).then(this._init), scope.A);
  }
  _init(e) {
    scope.I = e.instance, scope.g.env.emscripten_notify_memory_growth(0);
  }
  decode(e, i = 0) {
    if (!scope.I) throw new Error("ZSTDDecoder: Await .init() before decoding.");
    const s = e.byteLength,
      a = scope.I.exports.malloc(s);
    scope.B.set(e, a), i = i || Number(scope.I.exports.ZSTD_findDecompressedSize(a, s));
    const o = scope.I.exports.malloc(i),
      l = scope.I.exports.ZSTD_decompress(o, i, a, s),
      c = scope.B.slice(o, o + l);
    return scope.I.exports.free(a), scope.I.exports.free(o), c;
  }
};
}
