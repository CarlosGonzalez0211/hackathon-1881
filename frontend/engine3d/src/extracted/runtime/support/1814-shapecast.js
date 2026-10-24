/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1342929:1343329.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1814(scope) {
scope.shapecast = function shapecast(r, e, i, s, a, o) {
  scope._box1 = scope.boxPool.getPrimitive(), scope._box2 = scope.boxPool.getPrimitive(), scope.boxStack.push(scope._box1, scope._box2), scope.BufferStack.setBuffer(r._roots[e]);
  const l = scope.shapecastTraverse(0, r.geometry, i, s, a, o);
  scope.BufferStack.clearBuffer(), scope.boxPool.releasePrimitive(scope._box1), scope.boxPool.releasePrimitive(scope._box2), scope.boxStack.pop(), scope.boxStack.pop();
  const c = scope.boxStack.length;
  return c > 0 && (scope._box2 = scope.boxStack[c - 1], scope._box1 = scope.boxStack[c - 2]), l;
};
}
