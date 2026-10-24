/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1350393:1350986.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1846(scope) {
scope._raycastFirst$1 = function _raycastFirst$1(r, e, i, s, a, o) {
  const {
    float32Array: l,
    uint16Array: c,
    uint32Array: h
  } = scope.BufferStack;
  let d = r * 2;
  if (scope.IS_LEAF(d, c)) {
    const f = scope.OFFSET(r, h),
      _ = scope.COUNT(d, c);
    return scope.intersectClosestTri(e, i, s, f, _, a, o);
  } else {
    const f = scope.SPLIT_AXIS(r, h),
      _ = scope._xyzFields$1[f],
      b = s.direction[_] >= 0;
    let T, M;
    b ? (T = scope.LEFT_NODE(r), M = scope.RIGHT_NODE(r, h)) : (T = scope.RIGHT_NODE(r, h), M = scope.LEFT_NODE(r));
    const D = scope.intersectRay(T, l, s, a, o) ? scope._raycastFirst$1(T, e, i, s, a, o) : null;
    if (D) {
      const U = D.point[_];
      if (b ? U <= l[M + f] : U >= l[M + f + 3]) return D;
    }
    const P = scope.intersectRay(M, l, s, a, o) ? scope._raycastFirst$1(M, e, i, s, a, o) : null;
    return D && P ? D.distance <= P.distance ? D : P : D || P || null;
  }
};
}
