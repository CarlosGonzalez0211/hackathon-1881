/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1347192:1347402.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1835(scope) {
scope.intersectClosestTri = function intersectClosestTri(r, e, i, s, a, o, l) {
  const {
    geometry: c,
    _indirectBuffer: h
  } = r;
  let d = 1 / 0,
    p = null;
  for (let f = s, _ = s + a; f < _; f++) {
    let x;
    x = scope.intersectTri(c, e, i, f, null, o, l), x && x.distance < d && (p = x, d = x.distance);
  }
  return p;
};
}
