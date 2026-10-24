/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 494340:495535.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0979(scope) {
scope.WebGLClipping = function WebGLClipping(r) {
  const e = this;
  let i = null,
    s = 0,
    a = !1,
    o = !1;
  const l = new scope.Plane(),
    c = new scope.Matrix3(),
    h = {
      value: null,
      needsUpdate: !1
    };
  this.uniform = h, this.numPlanes = 0, this.numIntersection = 0, this.init = function (f, _) {
    const x = f.length !== 0 || _ || s !== 0 || a;
    return a = _, s = f.length, x;
  }, this.beginShadows = function () {
    o = !0, p(null);
  }, this.endShadows = function () {
    o = !1;
  }, this.setGlobalState = function (f, _) {
    i = p(f, _, 0);
  }, this.setState = function (f, _, x) {
    const b = f.clippingPlanes,
      T = f.clipIntersection,
      M = f.clipShadows,
      w = r.get(f);
    if (!a || b === null || b.length === 0 || o && !M) o ? p(null) : d();else {
      const D = o ? 0 : s,
        R = D * 4;
      let P = w.clippingState || null;
      h.value = P, P = p(b, _, R, x);
      for (let U = 0; U !== R; ++U) P[U] = i[U];
      w.clippingState = P, this.numIntersection = T ? this.numPlanes : 0, this.numPlanes += D;
    }
  };
  function d() {
    h.value !== i && (h.value = i, h.needsUpdate = s > 0), e.numPlanes = s, e.numIntersection = 0;
  }
  function p(f, _, x, b) {
    const T = f !== null ? f.length : 0;
    let M = null;
    if (T !== 0) {
      if (M = h.value, b !== !0 || M === null) {
        const w = x + T * 4,
          D = _.matrixWorldInverse;
        c.getNormalMatrix(D), (M === null || M.length < w) && (M = new Float32Array(w));
        for (let R = 0, P = x; R !== T; ++R, P += 4) l.copy(f[R]).applyMatrix4(D, c), l.normal.toArray(M, P), M[P + 3] = l.constant;
      }
      h.value = M, h.needsUpdate = !0;
    }
    return e.numPlanes = T, e.numIntersection = 0, M;
  }
};
}
