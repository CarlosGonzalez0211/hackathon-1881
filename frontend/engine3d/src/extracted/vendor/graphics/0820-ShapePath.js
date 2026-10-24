/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 323304:325190.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0820(scope) {
scope.ShapePath = class ShapePath {
  constructor() {
    this.type = "ShapePath", this.color = new scope.Color(), this.subPaths = [], this.currentPath = null;
  }
  moveTo(e, i) {
    return this.currentPath = new scope.Path(), this.subPaths.push(this.currentPath), this.currentPath.moveTo(e, i), this;
  }
  lineTo(e, i) {
    return this.currentPath.lineTo(e, i), this;
  }
  quadraticCurveTo(e, i, s, a) {
    return this.currentPath.quadraticCurveTo(e, i, s, a), this;
  }
  bezierCurveTo(e, i, s, a, o, l) {
    return this.currentPath.bezierCurveTo(e, i, s, a, o, l), this;
  }
  splineThru(e) {
    return this.currentPath.splineThru(e), this;
  }
  toShapes(e) {
    function i(w) {
      const D = [];
      for (let R = 0, P = w.length; R < P; R++) {
        const U = w[R],
          O = new scope.Shape();
        O.curves = U.curves, D.push(O);
      }
      return D;
    }
    function s(w, D) {
      const R = D.length;
      let P = !1;
      for (let U = R - 1, O = 0; O < R; U = O++) {
        let N = D[U],
          H = D[O],
          F = H.x - N.x,
          k = H.y - N.y;
        if (Math.abs(k) > Number.EPSILON) {
          if (k < 0 && (N = D[O], F = -F, H = D[U], k = -k), w.y < N.y || w.y > H.y) continue;
          if (w.y === N.y) {
            if (w.x === N.x) return !0;
          } else {
            const W = k * (w.x - N.x) - F * (w.y - N.y);
            if (W === 0) return !0;
            if (W < 0) continue;
            P = !P;
          }
        } else {
          if (w.y !== N.y) continue;
          if (H.x <= w.x && w.x <= N.x || N.x <= w.x && w.x <= H.x) return !0;
        }
      }
      return P;
    }
    const a = scope.ShapeUtils.isClockWise,
      o = this.subPaths;
    if (o.length === 0) return [];
    let l, c, h;
    const d = [];
    if (o.length === 1) return c = o[0], h = new scope.Shape(), h.curves = c.curves, d.push(h), d;
    let p = !a(o[0].getPoints());
    p = e ? !p : p;
    const f = [],
      _ = [];
    let x = [],
      b = 0,
      T;
    _[b] = void 0, x[b] = [];
    for (let w = 0, D = o.length; w < D; w++) c = o[w], T = c.getPoints(), l = a(T), l = e ? !l : l, l ? (!p && _[b] && b++, _[b] = {
      s: new scope.Shape(),
      p: T
    }, _[b].s.curves = c.curves, p && b++, x[b] = []) : x[b].push({
      h: c,
      p: T[0]
    });
    if (!_[0]) return i(o);
    if (_.length > 1) {
      let w = !1,
        D = 0;
      for (let R = 0, P = _.length; R < P; R++) f[R] = [];
      for (let R = 0, P = _.length; R < P; R++) {
        const U = x[R];
        for (let O = 0; O < U.length; O++) {
          const N = U[O];
          let H = !0;
          for (let F = 0; F < _.length; F++) s(N.p, _[F].p) && (R !== F && D++, H ? (H = !1, f[F].push(N)) : w = !0);
          H && f[R].push(N);
        }
      }
      D > 0 && w === !1 && (x = f);
    }
    let M;
    for (let w = 0, D = _.length; w < D; w++) {
      h = _[w].s, d.push(h), M = x[w];
      for (let R = 0, P = M.length; R < P; R++) h.holes.push(M[R].h);
    }
    return d;
  }
};
}
