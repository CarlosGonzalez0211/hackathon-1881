/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 635450:638721.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1131(scope) {
scope.WebGLUniformsGroups = function WebGLUniformsGroups(r, e, i, s) {
  let a = {},
    o = {},
    l = [];
  const c = r.getParameter(r.MAX_UNIFORM_BUFFER_BINDINGS);
  function h(D, R) {
    const P = R.program;
    s.uniformBlockBinding(D, P);
  }
  function d(D, R) {
    let P = a[D.id];
    P === void 0 && (b(D), P = p(D), a[D.id] = P, scope.__lifecycle.listen(D, "dispose", M));
    const U = R.program;
    s.updateUBOMapping(D, U);
    const O = e.render.frame;
    o[D.id] !== O && (_(D), o[D.id] = O);
  }
  function p(D) {
    const R = f();
    D.__bindingPointIndex = R;
    const P = r.createBuffer(),
      U = D.__size,
      O = D.usage;
    return r.bindBuffer(r.UNIFORM_BUFFER, P), r.bufferData(r.UNIFORM_BUFFER, U, O), r.bindBuffer(r.UNIFORM_BUFFER, null), r.bindBufferBase(r.UNIFORM_BUFFER, R, P), P;
  }
  function f() {
    for (let D = 0; D < c; D++) if (l.indexOf(D) === -1) return l.push(D), D;
    return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."), 0;
  }
  function _(D) {
    const R = a[D.id],
      P = D.uniforms,
      U = D.__cache;
    r.bindBuffer(r.UNIFORM_BUFFER, R);
    for (let O = 0, N = P.length; O < N; O++) {
      const H = Array.isArray(P[O]) ? P[O] : [P[O]];
      for (let F = 0, k = H.length; F < k; F++) {
        const W = H[F];
        if (x(W, O, F, U) === !0) {
          const $ = W.__offset,
            Z = Array.isArray(W.value) ? W.value : [W.value];
          let J = 0;
          for (let se = 0; se < Z.length; se++) {
            const re = Z[se],
              he = T(re);
            typeof re == "number" || typeof re == "boolean" ? (W.__data[0] = re, r.bufferSubData(r.UNIFORM_BUFFER, $ + J, W.__data)) : re.isMatrix3 ? (W.__data[0] = re.elements[0], W.__data[1] = re.elements[1], W.__data[2] = re.elements[2], W.__data[3] = 0, W.__data[4] = re.elements[3], W.__data[5] = re.elements[4], W.__data[6] = re.elements[5], W.__data[7] = 0, W.__data[8] = re.elements[6], W.__data[9] = re.elements[7], W.__data[10] = re.elements[8], W.__data[11] = 0) : (re.toArray(W.__data, J), J += he.storage / Float32Array.BYTES_PER_ELEMENT);
          }
          r.bufferSubData(r.UNIFORM_BUFFER, $, W.__data);
        }
      }
    }
    r.bindBuffer(r.UNIFORM_BUFFER, null);
  }
  function x(D, R, P, U) {
    const O = D.value,
      N = R + "_" + P;
    if (U[N] === void 0) return typeof O == "number" || typeof O == "boolean" ? U[N] = O : U[N] = O.clone(), !0;
    {
      const H = U[N];
      if (typeof O == "number" || typeof O == "boolean") {
        if (H !== O) return U[N] = O, !0;
      } else if (H.equals(O) === !1) return H.copy(O), !0;
    }
    return !1;
  }
  function b(D) {
    const R = D.uniforms;
    let P = 0;
    const U = 16;
    for (let N = 0, H = R.length; N < H; N++) {
      const F = Array.isArray(R[N]) ? R[N] : [R[N]];
      for (let k = 0, W = F.length; k < W; k++) {
        const $ = F[k],
          Z = Array.isArray($.value) ? $.value : [$.value];
        for (let J = 0, se = Z.length; J < se; J++) {
          const re = Z[J],
            he = T(re),
            ee = P % U,
            Ie = ee % he.boundary,
            Te = ee + Ie;
          P += Ie, Te !== 0 && U - Te < he.storage && (P += U - Te), $.__data = new Float32Array(he.storage / Float32Array.BYTES_PER_ELEMENT), $.__offset = P, P += he.storage;
        }
      }
    }
    const O = P % U;
    return O > 0 && (P += U - O), D.__size = P, D.__cache = {}, this;
  }
  function T(D) {
    const R = {
      boundary: 0,
      storage: 0
    };
    return typeof D == "number" || typeof D == "boolean" ? (R.boundary = 4, R.storage = 4) : D.isVector2 ? (R.boundary = 8, R.storage = 8) : D.isVector3 || D.isColor ? (R.boundary = 16, R.storage = 12) : D.isVector4 ? (R.boundary = 16, R.storage = 16) : D.isMatrix3 ? (R.boundary = 48, R.storage = 48) : D.isMatrix4 ? (R.boundary = 64, R.storage = 64) : D.isTexture ? console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.") : console.warn("THREE.WebGLRenderer: Unsupported uniform value type.", D), R;
  }
  function M(D) {
    const R = D.target;
    scope.__lifecycle.unlisten(R, "dispose", M);
    const P = l.indexOf(R.__bindingPointIndex);
    l.splice(P, 1), r.deleteBuffer(a[R.id]), delete a[R.id], delete o[R.id];
  }
  function w() {
    for (const D in a) r.deleteBuffer(a[D]);
    l = [], a = {}, o = {};
  }
  return {
    bind: h,
    update: d,
    dispose: w
  };
};
}
