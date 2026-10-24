/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1332115:1332741.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1791(scope) {
scope.closestPointsSegmentToSegment = function () {
  const r = new scope.Vector2(),
    e = new scope.Vector3(),
    i = new scope.Vector3();
  return function (a, o, l, c) {
    scope.closestPointLineToLine(a, o, r);
    let h = r.x,
      d = r.y;
    if (h >= 0 && h <= 1 && d >= 0 && d <= 1) {
      a.at(h, l), o.at(d, c);
      return;
    } else if (h >= 0 && h <= 1) {
      d < 0 ? o.at(0, c) : o.at(1, c), a.closestPointToPoint(c, !0, l);
      return;
    } else if (d >= 0 && d <= 1) {
      h < 0 ? a.at(0, l) : a.at(1, l), o.closestPointToPoint(l, !0, c);
      return;
    } else {
      let p;
      h < 0 ? p = a.start : p = a.end;
      let f;
      d < 0 ? f = o.start : f = o.end;
      const _ = e,
        x = i;
      if (a.closestPointToPoint(f, !0, e), o.closestPointToPoint(p, !0, i), _.distanceToSquared(f) <= x.distanceToSquared(p)) {
        l.copy(_), c.copy(f);
        return;
      } else {
        l.copy(p), c.copy(x);
        return;
      }
    }
  };
}();
}
