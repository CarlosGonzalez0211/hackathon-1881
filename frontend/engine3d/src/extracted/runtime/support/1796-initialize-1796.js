/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1334120:1334690.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1796(scope) {
scope.ExtendedTriangle.prototype.closestPointToSegment = function () {
  const r = new scope.Vector3(),
    e = new scope.Vector3(),
    i = new scope.Line3();
  return function (a, o = null, l = null) {
    const {
        start: c,
        end: h
      } = a,
      d = this.points;
    let p,
      f = 1 / 0;
    for (let _ = 0; _ < 3; _++) {
      const x = (_ + 1) % 3;
      i.start.copy(d[_]), i.end.copy(d[x]), scope.closestPointsSegmentToSegment(i, a, r, e), p = r.distanceToSquared(e), p < f && (f = p, o && o.copy(r), l && l.copy(e));
    }
    return this.closestPointToPoint(c, r), p = c.distanceToSquared(r), p < f && (f = p, o && o.copy(r), l && l.copy(c)), this.closestPointToPoint(h, r), p = h.distanceToSquared(r), p < f && (f = p, o && o.copy(r), l && l.copy(h)), Math.sqrt(f);
  };
}();
}
