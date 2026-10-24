/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1356241:1356390.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1867(scope) {
scope.raycastFirst_indirect = function raycastFirst_indirect(r, e, i, s, a, o) {
  scope.BufferStack.setBuffer(r._roots[e]);
  const l = scope._raycastFirst(0, r, i, s, a, o);
  return scope.BufferStack.clearBuffer(), l;
};
}
