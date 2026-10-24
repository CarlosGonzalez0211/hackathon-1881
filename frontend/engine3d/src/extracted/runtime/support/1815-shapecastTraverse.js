/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1343329:1344407.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1815(scope) {
scope.shapecastTraverse = function shapecastTraverse(r, e, i, s, a = null, o = 0, l = 0) {
  const {
    float32Array: c,
    uint16Array: h,
    uint32Array: d
  } = scope.BufferStack;
  let p = r * 2;
  if (scope.IS_LEAF(p, h)) {
    const _ = scope.OFFSET(r, d),
      x = scope.COUNT(p, h);
    return scope.arrayToBox(r, c, scope._box1), s(_, x, !1, l, o + r, scope._box1);
  } else {
    let k = function ($) {
        const {
          uint16Array: Z,
          uint32Array: J
        } = scope.BufferStack;
        let se = $ * 2;
        for (; !scope.IS_LEAF(se, Z);) $ = scope.LEFT_NODE($), se = $ * 2;
        return scope.OFFSET($, J);
      },
      W = function ($) {
        const {
          uint16Array: Z,
          uint32Array: J
        } = scope.BufferStack;
        let se = $ * 2;
        for (; !scope.IS_LEAF(se, Z);) $ = scope.RIGHT_NODE($, J), se = $ * 2;
        return scope.OFFSET($, J) + scope.COUNT(se, Z);
      };
    const _ = scope.LEFT_NODE(r),
      x = scope.RIGHT_NODE(r, d);
    let b = _,
      T = x,
      M,
      w,
      D,
      R;
    if (a && (D = scope._box1, R = scope._box2, scope.arrayToBox(b, c, D), scope.arrayToBox(T, c, R), M = a(D), w = a(R), w < M)) {
      b = x, T = _;
      const $ = M;
      M = w, w = $, D = R;
    }
    D || (D = scope._box1, scope.arrayToBox(b, c, D));
    const P = scope.IS_LEAF(b * 2, h),
      U = i(D, P, M, l + 1, o + b);
    let O;
    if (U === scope.CONTAINED) {
      const $ = k(b),
        J = W(b) - $;
      O = s($, J, !0, l + 1, o + b, D);
    } else O = U && scope.shapecastTraverse(b, e, i, s, a, o, l + 1);
    if (O) return !0;
    R = scope._box2, scope.arrayToBox(T, c, R);
    const N = scope.IS_LEAF(T * 2, h),
      H = i(R, N, w, l + 1, o + T);
    let F;
    if (H === scope.CONTAINED) {
      const $ = k(T),
        J = W(T) - $;
      F = s($, J, !0, l + 1, o + T, R);
    } else F = H && scope.shapecastTraverse(T, e, i, s, a, o, l + 1);
    return !!F;
  }
};
}
