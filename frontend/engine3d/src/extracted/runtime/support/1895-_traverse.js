/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1361621:1363444.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1895(scope) {
scope._traverse = function _traverse(r, e, i, s, a, o = 0, l = 0, c = 0, h = 0, d = null, p = !1) {
  let f, _;
  p ? (f = scope._bufferStack2, _ = scope._bufferStack1) : (f = scope._bufferStack1, _ = scope._bufferStack2);
  const x = f.float32Array,
    b = f.uint32Array,
    T = f.uint16Array,
    M = _.float32Array,
    w = _.uint32Array,
    D = _.uint16Array,
    R = r * 2,
    P = e * 2,
    U = scope.IS_LEAF(R, T),
    O = scope.IS_LEAF(P, D);
  let N = !1;
  if (O && U) p ? N = a(scope.OFFSET(e, w), scope.COUNT(e * 2, D), scope.OFFSET(r, b), scope.COUNT(r * 2, T), h, l + e, c, o + r) : N = a(scope.OFFSET(r, b), scope.COUNT(r * 2, T), scope.OFFSET(e, w), scope.COUNT(e * 2, D), c, o + r, h, l + e);else if (O) {
    const H = scope._boxPool.getPrimitive();
    scope.arrayToBox(e, M, H), H.applyMatrix4(i);
    const F = scope.LEFT_NODE(r),
      k = scope.RIGHT_NODE(r, b);
    scope.arrayToBox(F, x, scope._leftBox1), scope.arrayToBox(k, x, scope._rightBox1);
    const W = H.intersectsBox(scope._leftBox1),
      $ = H.intersectsBox(scope._rightBox1);
    N = W && scope._traverse(e, F, s, i, a, l, o, h, c + 1, H, !p) || $ && scope._traverse(e, k, s, i, a, l, o, h, c + 1, H, !p), scope._boxPool.releasePrimitive(H);
  } else {
    const H = scope.LEFT_NODE(e),
      F = scope.RIGHT_NODE(e, w);
    scope.arrayToBox(H, M, scope._leftBox2), scope.arrayToBox(F, M, scope._rightBox2);
    const k = d.intersectsBox(scope._leftBox2),
      W = d.intersectsBox(scope._rightBox2);
    if (k && W) N = scope._traverse(r, H, i, s, a, o, l, c, h + 1, d, p) || scope._traverse(r, F, i, s, a, o, l, c, h + 1, d, p);else if (k) {
      if (U) N = scope._traverse(r, H, i, s, a, o, l, c, h + 1, d, p);else {
        const $ = scope._boxPool.getPrimitive();
        $.copy(scope._leftBox2).applyMatrix4(i);
        const Z = scope.LEFT_NODE(r),
          J = scope.RIGHT_NODE(r, b);
        scope.arrayToBox(Z, x, scope._leftBox1), scope.arrayToBox(J, x, scope._rightBox1);
        const se = $.intersectsBox(scope._leftBox1),
          re = $.intersectsBox(scope._rightBox1);
        N = se && scope._traverse(H, Z, s, i, a, l, o, h, c + 1, $, !p) || re && scope._traverse(H, J, s, i, a, l, o, h, c + 1, $, !p), scope._boxPool.releasePrimitive($);
      }
    } else if (W) if (U) N = scope._traverse(r, F, i, s, a, o, l, c, h + 1, d, p);else {
      const $ = scope._boxPool.getPrimitive();
      $.copy(scope._rightBox2).applyMatrix4(i);
      const Z = scope.LEFT_NODE(r),
        J = scope.RIGHT_NODE(r, b);
      scope.arrayToBox(Z, x, scope._leftBox1), scope.arrayToBox(J, x, scope._rightBox1);
      const se = $.intersectsBox(scope._leftBox1),
        re = $.intersectsBox(scope._rightBox1);
      N = se && scope._traverse(F, Z, s, i, a, l, o, h, c + 1, $, !p) || re && scope._traverse(F, J, s, i, a, l, o, h, c + 1, $, !p), scope._boxPool.releasePrimitive($);
    }
  }
  return N;
};
}
