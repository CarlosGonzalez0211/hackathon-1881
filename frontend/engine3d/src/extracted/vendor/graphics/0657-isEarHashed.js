/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 237565:238458.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0657(scope) {
scope.isEarHashed = function isEarHashed(r, e, i, s) {
  const a = r.prev,
    o = r,
    l = r.next;
  if (scope.area(a, o, l) >= 0) return !1;
  const c = a.x,
    h = o.x,
    d = l.x,
    p = a.y,
    f = o.y,
    _ = l.y,
    x = Math.min(c, h, d),
    b = Math.min(p, f, _),
    T = Math.max(c, h, d),
    M = Math.max(p, f, _),
    w = scope.zOrder(x, b, e, i, s),
    D = scope.zOrder(T, M, e, i, s);
  let R = r.prevZ,
    P = r.nextZ;
  for (; R && R.z >= w && P && P.z <= D;) {
    if (R.x >= x && R.x <= T && R.y >= b && R.y <= M && R !== a && R !== l && scope.pointInTriangleExceptFirst(c, p, h, f, d, _, R.x, R.y) && scope.area(R.prev, R, R.next) >= 0 || (R = R.prevZ, P.x >= x && P.x <= T && P.y >= b && P.y <= M && P !== a && P !== l && scope.pointInTriangleExceptFirst(c, p, h, f, d, _, P.x, P.y) && scope.area(P.prev, P, P.next) >= 0)) return !1;
    P = P.nextZ;
  }
  for (; R && R.z >= w;) {
    if (R.x >= x && R.x <= T && R.y >= b && R.y <= M && R !== a && R !== l && scope.pointInTriangleExceptFirst(c, p, h, f, d, _, R.x, R.y) && scope.area(R.prev, R, R.next) >= 0) return !1;
    R = R.prevZ;
  }
  for (; P && P.z <= D;) {
    if (P.x >= x && P.x <= T && P.y >= b && P.y <= M && P !== a && P !== l && scope.pointInTriangleExceptFirst(c, p, h, f, d, _, P.x, P.y) && scope.area(P.prev, P, P.next) >= 0) return !1;
    P = P.nextZ;
  }
  return !0;
};
}
