/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1351151:1351297.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1853(scope) {
scope.intersectsGeometry = function intersectsGeometry(r, e, i, s) {
  scope.BufferStack.setBuffer(r._roots[e]);
  const a = scope._intersectsGeometry$1(0, r, i, s);
  return scope.BufferStack.clearBuffer(), a;
};
}
