/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1355870:1356210.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1865(scope) {
scope._raycast = function _raycast(r, e, i, s, a, o, l) {
  const {
      float32Array: c,
      uint16Array: h,
      uint32Array: d
    } = scope.BufferStack,
    p = r * 2;
  if (scope.IS_LEAF(p, h)) {
    const _ = scope.OFFSET(r, d),
      x = scope.COUNT(p, h);
    scope.intersectTris_indirect(e, i, s, _, x, a, o, l);
  } else {
    const _ = scope.LEFT_NODE(r);
    scope.intersectRay(_, c, s, o, l) && scope._raycast(_, e, i, s, a, o, l);
    const x = scope.RIGHT_NODE(r, d);
    scope.intersectRay(x, c, s, o, l) && scope._raycast(x, e, i, s, a, o, l);
  }
};
}
