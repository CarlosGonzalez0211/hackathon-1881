/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1346532:1346819.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1832(scope) {
scope.intersectTri = function intersectTri(r, e, i, s, a, o, l) {
  const c = s * 3;
  let h = c + 0,
    d = c + 1,
    p = c + 2;
  const f = r.index;
  r.index && (h = f.getX(h), d = f.getX(d), p = f.getX(p));
  const {
      position: _,
      normal: x,
      uv: b,
      uv1: T
    } = r.attributes,
    M = scope.checkBufferGeometryIntersection(i, _, x, b, T, h, d, p, e, o, l);
  return M ? (M.faceIndex = s, a && a.push(M), M) : null;
};
}
