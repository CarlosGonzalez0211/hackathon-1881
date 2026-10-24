/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 237216:237565.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0656(scope) {
scope.isEar = function isEar(r) {
  const e = r.prev,
    i = r,
    s = r.next;
  if (scope.area(e, i, s) >= 0) return !1;
  const a = e.x,
    o = i.x,
    l = s.x,
    c = e.y,
    h = i.y,
    d = s.y,
    p = Math.min(a, o, l),
    f = Math.min(c, h, d),
    _ = Math.max(a, o, l),
    x = Math.max(c, h, d);
  let b = s.next;
  for (; b !== e;) {
    if (b.x >= p && b.x <= _ && b.y >= f && b.y <= x && scope.pointInTriangleExceptFirst(a, c, o, h, l, d, b.x, b.y) && scope.area(b.prev, b, b.next) >= 0) return !1;
    b = b.next;
  }
  return !0;
};
}
