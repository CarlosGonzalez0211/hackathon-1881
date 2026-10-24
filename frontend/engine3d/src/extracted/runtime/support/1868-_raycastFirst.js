/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1356390:1356984.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1868(scope) {
scope._raycastFirst = function _raycastFirst(r, e, i, s, a, o) {
  const {
    float32Array: l,
    uint16Array: c,
    uint32Array: h
  } = scope.BufferStack;
  let d = r * 2;
  if (scope.IS_LEAF(d, c)) {
    const f = scope.OFFSET(r, h),
      _ = scope.COUNT(d, c);
    return scope.intersectClosestTri_indirect(e, i, s, f, _, a, o);
  } else {
    const f = scope.SPLIT_AXIS(r, h),
      _ = scope._xyzFields[f],
      b = s.direction[_] >= 0;
    let T, M;
    b ? (T = scope.LEFT_NODE(r), M = scope.RIGHT_NODE(r, h)) : (T = scope.RIGHT_NODE(r, h), M = scope.LEFT_NODE(r));
    const D = scope.intersectRay(T, l, s, a, o) ? scope._raycastFirst(T, e, i, s, a, o) : null;
    if (D) {
      const U = D.point[_];
      if (b ? U <= l[M + f] : U >= l[M + f + 3]) return D;
    }
    const P = scope.intersectRay(M, l, s, a, o) ? scope._raycastFirst(M, e, i, s, a, o) : null;
    return D && P ? D.distance <= P.distance ? D : P : D || P || null;
  }
};
}
