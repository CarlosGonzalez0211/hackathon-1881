/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1348650:1349135.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1838(scope) {
scope.intersectRay = function intersectRay(r, e, i, s, a) {
  let o, l, c, h, d, p;
  const f = 1 / i.direction.x,
    _ = 1 / i.direction.y,
    x = 1 / i.direction.z,
    b = i.origin.x,
    T = i.origin.y,
    M = i.origin.z;
  let w = e[r],
    D = e[r + 3],
    R = e[r + 1],
    P = e[r + 3 + 1],
    U = e[r + 2],
    O = e[r + 3 + 2];
  return f >= 0 ? (o = (w - b) * f, l = (D - b) * f) : (o = (D - b) * f, l = (w - b) * f), _ >= 0 ? (c = (R - T) * _, h = (P - T) * _) : (c = (P - T) * _, h = (R - T) * _), o > h || c > l || ((c > o || isNaN(o)) && (o = c), (h < l || isNaN(l)) && (l = h), x >= 0 ? (d = (U - M) * x, p = (O - M) * x) : (d = (O - M) * x, p = (U - M) * x), o > p || d > l) ? !1 : ((d > o || o !== o) && (o = d), (p < l || l !== l) && (l = p), o <= a && l >= s);
};
}
