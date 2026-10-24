/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1328373:1329087.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1784(scope) {
scope._populateBuffer = function _populateBuffer(r, e) {
  const i = r / 4,
    s = r / 2,
    a = "count" in e,
    o = e.boundingData;
  for (let l = 0; l < 6; l++) scope.float32Array[i + l] = o[l];
  if (a) {
    if (e.buffer) {
      const l = e.buffer;
      scope.uint8Array.set(new Uint8Array(l), r);
      for (let c = r, h = r + l.byteLength; c < h; c += scope.BYTES_PER_NODE) {
        const d = c / 2;
        scope.IS_LEAF(d, scope.uint16Array) || (scope.uint32Array[c / 4 + 6] += i);
      }
      return r + l.byteLength;
    } else {
      const l = e.offset,
        c = e.count;
      return scope.uint32Array[i + 6] = l, scope.uint16Array[s + 14] = c, scope.uint16Array[s + 15] = scope.IS_LEAFNODE_FLAG, r + scope.BYTES_PER_NODE;
    }
  } else {
    const l = e.left,
      c = e.right,
      h = e.splitAxis;
    let d;
    if (d = scope._populateBuffer(r + scope.BYTES_PER_NODE, l), d / 4 > scope.MAX_POINTER) throw new Error("MeshBVH: Cannot store child pointer greater than 32 bits.");
    return scope.uint32Array[i + 6] = d / 4, d = scope._populateBuffer(d, c), scope.uint32Array[i + 7] = h, d;
  }
};
}
