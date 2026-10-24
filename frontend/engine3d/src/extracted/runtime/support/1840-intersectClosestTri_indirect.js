/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1349293:1349519.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1840(scope) {
scope.intersectClosestTri_indirect = function intersectClosestTri_indirect(r, e, i, s, a, o, l) {
  const {
    geometry: c,
    _indirectBuffer: h
  } = r;
  let d = 1 / 0,
    p = null;
  for (let f = s, _ = s + a; f < _; f++) {
    let x;
    x = scope.intersectTri(c, e, i, h ? h[f] : f, null, o, l), x && x.distance < d && (p = x, d = x.distance);
  }
  return p;
};
}
