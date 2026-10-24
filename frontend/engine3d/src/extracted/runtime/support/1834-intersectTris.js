/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1347060:1347192.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1834(scope) {
scope.intersectTris = function intersectTris(r, e, i, s, a, o, l, c) {
  const {
    geometry: h,
    _indirectBuffer: d
  } = r;
  for (let p = s, f = s + a; p < f; p++) scope.intersectTri(h, e, i, p, o, l, c);
};
}
