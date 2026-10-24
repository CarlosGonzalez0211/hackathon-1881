/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1321716:1321932.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1753(scope) {
scope.ensureIndex = function ensureIndex(r, e) {
  if (!r.index) {
    const i = r.attributes.position.count,
      s = e.useSharedArrayBuffer ? SharedArrayBuffer : ArrayBuffer,
      a = scope.getIndexArray(i, s);
    r.setIndex(new scope.BufferAttribute(a, 1));
    for (let o = 0; o < i; o++) a[o] = o;
  }
};
}
