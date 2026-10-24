/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1332742:1333243.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1792(scope) {
scope.sphereIntersectTriangle = function () {
  const r = new scope.Vector3(),
    e = new scope.Vector3(),
    i = new scope.Plane(),
    s = new scope.Line3();
  return function (o, l) {
    const {
        radius: c,
        center: h
      } = o,
      {
        a: d,
        b: p,
        c: f
      } = l;
    if (s.start = d, s.end = p, s.closestPointToPoint(h, !0, r).distanceTo(h) <= c || (s.start = d, s.end = f, s.closestPointToPoint(h, !0, r).distanceTo(h) <= c) || (s.start = p, s.end = f, s.closestPointToPoint(h, !0, r).distanceTo(h) <= c)) return !0;
    const T = l.getPlane(i);
    if (Math.abs(T.distanceToPoint(h)) <= c) {
      const w = T.projectPoint(h, e);
      if (l.containsPoint(w)) return !0;
    }
    return !1;
  };
}();
}
