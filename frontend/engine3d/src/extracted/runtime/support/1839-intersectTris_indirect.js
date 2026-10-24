/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1349135:1349293.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1839(scope) {
scope.intersectTris_indirect = function intersectTris_indirect(r, e, i, s, a, o, l, c) {
  const {
    geometry: h,
    _indirectBuffer: d
  } = r;
  for (let p = s, f = s + a; p < f; p++) {
    let _ = d ? d[p] : p;
    scope.intersectTri(h, e, i, _, o, l, c);
  }
};
}
