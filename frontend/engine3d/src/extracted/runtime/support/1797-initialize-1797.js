/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1334690:1336927.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1797(scope) {
scope.ExtendedTriangle.prototype.intersectsTriangle = function () {
  const r = new scope.ExtendedTriangle(),
    e = new Array(3),
    i = new Array(3),
    s = new scope.SeparatingAxisBounds(),
    a = new scope.SeparatingAxisBounds(),
    o = new scope.Vector3(),
    l = new scope.Vector3(),
    c = new scope.Vector3(),
    h = new scope.Vector3(),
    d = new scope.Vector3(),
    p = new scope.Line3(),
    f = new scope.Line3(),
    _ = new scope.Line3(),
    x = new scope.Vector3();
  function b(T, M, w) {
    const D = T.points;
    let R = 0,
      P = -1;
    for (let U = 0; U < 3; U++) {
      const {
        start: O,
        end: N
      } = p;
      O.copy(D[U]), N.copy(D[(U + 1) % 3]), p.delta(l);
      const H = scope.isNearZero(M.distanceToPoint(O));
      if (scope.isNearZero(M.normal.dot(l)) && H) {
        w.copy(p), R = 2;
        break;
      }
      const F = M.intersectLine(p, x);
      if (!F && H && x.copy(O), (F || H) && !scope.isNearZero(x.distanceTo(N))) {
        if (R <= 1) (R === 1 ? w.start : w.end).copy(x), H && (P = R);else if (R >= 2) {
          (P === 1 ? w.start : w.end).copy(x), R = 2;
          break;
        }
        if (R++, R === 2 && P === -1) break;
      }
    }
    return R;
  }
  return function (M, w = null, D = !1) {
    this.needsUpdate && this.update(), M.isExtendedTriangle ? M.needsUpdate && M.update() : (r.copy(M), r.update(), M = r);
    const R = this.plane,
      P = M.plane;
    if (Math.abs(R.normal.dot(P.normal)) > 1 - 1e-10) {
      const U = this.satBounds,
        O = this.satAxes;
      i[0] = M.a, i[1] = M.b, i[2] = M.c;
      for (let F = 0; F < 4; F++) {
        const k = U[F],
          W = O[F];
        if (s.setFromPoints(W, i), k.isSeparated(s)) return !1;
      }
      const N = M.satBounds,
        H = M.satAxes;
      e[0] = this.a, e[1] = this.b, e[2] = this.c;
      for (let F = 0; F < 4; F++) {
        const k = N[F],
          W = H[F];
        if (s.setFromPoints(W, e), k.isSeparated(s)) return !1;
      }
      for (let F = 0; F < 4; F++) {
        const k = O[F];
        for (let W = 0; W < 4; W++) {
          const $ = H[W];
          if (o.crossVectors(k, $), s.setFromPoints(o, e), a.setFromPoints(o, i), s.isSeparated(a)) return !1;
        }
      }
      return w && (D || console.warn("ExtendedTriangle.intersectsTriangle: Triangles are coplanar which does not support an output edge. Setting edge to 0, 0, 0."), w.start.set(0, 0, 0), w.end.set(0, 0, 0)), !0;
    } else {
      const U = b(this, P, f);
      if (U === 1 && M.containsPoint(f.end)) return w && (w.start.copy(f.end), w.end.copy(f.end)), !0;
      if (U !== 2) return !1;
      const O = b(M, R, _);
      if (O === 1 && this.containsPoint(_.end)) return w && (w.start.copy(_.end), w.end.copy(_.end)), !0;
      if (O !== 2) return !1;
      if (f.delta(c), _.delta(h), c.dot(h) < 0) {
        let Z = _.start;
        _.start = _.end, _.end = Z;
      }
      const N = f.start.dot(c),
        H = f.end.dot(c),
        F = _.start.dot(c),
        k = _.end.dot(c),
        W = H < F,
        $ = N < k;
      return N !== k && F !== H && W === $ ? !1 : (w && (d.subVectors(f.start, _.start), d.dot(c) > 0 ? w.start.copy(f.start) : w.start.copy(_.start), d.subVectors(f.end, _.end), d.dot(c) < 0 ? w.end.copy(f.end) : w.end.copy(_.end)), !0);
    }
  };
}();
}
