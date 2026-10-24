/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 838195:839441.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1375(scope) {
scope.mergeAttributes = function mergeAttributes(r) {
  let e,
    i,
    s,
    a = -1,
    o = 0;
  for (let d = 0; d < r.length; ++d) {
    const p = r[d];
    if (e === void 0 && (e = p.array.constructor), e !== p.array.constructor) return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."), null;
    if (i === void 0 && (i = p.itemSize), i !== p.itemSize) return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."), null;
    if (s === void 0 && (s = p.normalized), s !== p.normalized) return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."), null;
    if (a === -1 && (a = p.gpuType), a !== p.gpuType) return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."), null;
    o += p.count * i;
  }
  const l = new e(o),
    c = new scope.BufferAttribute(l, i, s);
  let h = 0;
  for (let d = 0; d < r.length; ++d) {
    const p = r[d];
    if (p.isInterleavedBufferAttribute) {
      const f = h / i;
      for (let _ = 0, x = p.count; _ < x; _++) for (let b = 0; b < i; b++) {
        const T = p.getComponent(_, b);
        c.setComponent(_ + f, b, T);
      }
    } else l.set(p.array, h);
    h += p.count * i;
  }
  return a !== void 0 && (c.gpuType = a), c;
};
}
