/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1357141:1357294.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1875(scope) {
scope.intersectsGeometry_indirect = function intersectsGeometry_indirect(r, e, i, s) {
  scope.BufferStack.setBuffer(r._roots[e]);
  const a = scope._intersectsGeometry(0, r, i, s);
  return scope.BufferStack.clearBuffer(), a;
};
}
