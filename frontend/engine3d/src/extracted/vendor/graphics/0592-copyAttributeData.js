/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 193542:193820.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0592(scope) {
scope.copyAttributeData = function copyAttributeData(r, e, i = 0) {
  const s = e.itemSize;
  if (r.isInterleavedBufferAttribute || r.array.constructor !== e.array.constructor) {
    const a = r.count;
    for (let o = 0; o < a; o++) for (let l = 0; l < s; l++) e.setComponent(o + i, l, r.getComponent(o, l));
  } else e.array.set(r.array, i * s);
  e.needsUpdate = !0;
};
}
