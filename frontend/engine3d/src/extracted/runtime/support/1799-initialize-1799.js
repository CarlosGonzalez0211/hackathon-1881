/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1337077:1337867.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1799(scope) {
scope.ExtendedTriangle.prototype.distanceToTriangle = function () {
  const r = new scope.Vector3(),
    e = new scope.Vector3(),
    i = ["a", "b", "c"],
    s = new scope.Line3(),
    a = new scope.Line3();
  return function (l, c = null, h = null) {
    const d = c || h ? s : null;
    if (this.intersectsTriangle(l, d)) return (c || h) && (c && d.getCenter(c), h && d.getCenter(h)), 0;
    let p = 1 / 0;
    for (let f = 0; f < 3; f++) {
      let _;
      const x = i[f],
        b = l[x];
      this.closestPointToPoint(b, r), _ = b.distanceToSquared(r), _ < p && (p = _, c && c.copy(r), h && h.copy(b));
      const T = this[x];
      l.closestPointToPoint(T, r), _ = T.distanceToSquared(r), _ < p && (p = _, c && c.copy(T), h && h.copy(r));
    }
    for (let f = 0; f < 3; f++) {
      const _ = i[f],
        x = i[(f + 1) % 3];
      s.set(this[_], this[x]);
      for (let b = 0; b < 3; b++) {
        const T = i[b],
          M = i[(b + 1) % 3];
        a.set(l[T], l[M]), scope.closestPointsSegmentToSegment(s, a, r, e);
        const w = r.distanceToSquared(e);
        w < p && (p = w, c && c.copy(r), h && h.copy(e));
      }
    }
    return Math.sqrt(p);
  };
}();
}
