/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1339578:1340333.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1803(scope) {
scope.OrientedBox.prototype.intersectsTriangle = function () {
  const r = new scope.ExtendedTriangle(),
    e = new Array(3),
    i = new scope.SeparatingAxisBounds(),
    s = new scope.SeparatingAxisBounds(),
    a = new scope.Vector3();
  return function (l) {
    this.needsUpdate && this.update(), l.isExtendedTriangle ? l.needsUpdate && l.update() : (r.copy(l), r.update(), l = r);
    const c = this.satBounds,
      h = this.satAxes;
    e[0] = l.a, e[1] = l.b, e[2] = l.c;
    for (let _ = 0; _ < 3; _++) {
      const x = c[_],
        b = h[_];
      if (i.setFromPoints(b, e), x.isSeparated(i)) return !1;
    }
    const d = l.satBounds,
      p = l.satAxes,
      f = this.points;
    for (let _ = 0; _ < 3; _++) {
      const x = d[_],
        b = p[_];
      if (i.setFromPoints(b, f), x.isSeparated(i)) return !1;
    }
    for (let _ = 0; _ < 3; _++) {
      const x = h[_];
      for (let b = 0; b < 4; b++) {
        const T = p[b];
        if (a.crossVectors(x, T), i.setFromPoints(a, e), s.setFromPoints(a, f), i.isSeparated(s)) return !1;
      }
    }
    return !0;
  };
}();
}
