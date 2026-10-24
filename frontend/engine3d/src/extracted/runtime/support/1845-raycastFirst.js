/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1350251:1350393.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1845(scope) {
scope.raycastFirst = function raycastFirst(r, e, i, s, a, o) {
  scope.BufferStack.setBuffer(r._roots[e]);
  const l = scope._raycastFirst$1(0, r, i, s, a, o);
  return scope.BufferStack.clearBuffer(), l;
};
}
