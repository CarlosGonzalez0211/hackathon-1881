/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1340687:1342042.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1806(scope) {
scope.OrientedBox.prototype.distanceToBox = function () {
  const r = ["x", "y", "z"],
    e = new Array(12).fill().map(() => new scope.Line3()),
    i = new Array(12).fill().map(() => new scope.Line3()),
    s = new scope.Vector3(),
    a = new scope.Vector3();
  return function (l, c = 0, h = null, d = null) {
    if (this.needsUpdate && this.update(), this.intersectsBox(l)) return (h || d) && (l.getCenter(a), this.closestPointToPoint(a, s), l.closestPointToPoint(s, a), h && h.copy(s), d && d.copy(a)), 0;
    const p = c * c,
      f = l.min,
      _ = l.max,
      x = this.points;
    let b = 1 / 0;
    for (let M = 0; M < 8; M++) {
      const w = x[M];
      a.copy(w).clamp(f, _);
      const D = w.distanceToSquared(a);
      if (D < b && (b = D, h && h.copy(w), d && d.copy(a), D < p)) return Math.sqrt(D);
    }
    let T = 0;
    for (let M = 0; M < 3; M++) for (let w = 0; w <= 1; w++) for (let D = 0; D <= 1; D++) {
      const R = (M + 1) % 3,
        P = (M + 2) % 3,
        U = w << R | D << P,
        O = 1 << M | w << R | D << P,
        N = x[U],
        H = x[O];
      e[T].set(N, H);
      const k = r[M],
        W = r[R],
        $ = r[P],
        Z = i[T],
        J = Z.start,
        se = Z.end;
      J[k] = f[k], J[W] = w ? f[W] : _[W], J[$] = D ? f[$] : _[W], se[k] = _[k], se[W] = w ? f[W] : _[W], se[$] = D ? f[$] : _[W], T++;
    }
    for (let M = 0; M <= 1; M++) for (let w = 0; w <= 1; w++) for (let D = 0; D <= 1; D++) {
      a.x = M ? _.x : f.x, a.y = w ? _.y : f.y, a.z = D ? _.z : f.z, this.closestPointToPoint(a, s);
      const R = a.distanceToSquared(s);
      if (R < b && (b = R, h && h.copy(s), d && d.copy(a), R < p)) return Math.sqrt(R);
    }
    for (let M = 0; M < 12; M++) {
      const w = e[M];
      for (let D = 0; D < 12; D++) {
        const R = i[D];
        scope.closestPointsSegmentToSegment(w, R, s, a);
        const P = s.distanceToSquared(a);
        if (P < b && (b = P, h && h.copy(s), d && d.copy(a), P < p)) return Math.sqrt(P);
      }
    }
    return Math.sqrt(b);
  };
}();
}
