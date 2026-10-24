/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1328106:1328190.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1782(scope) {
scope.countNodes = function countNodes(r) {
  return "count" in r ? 1 : 1 + scope.countNodes(r.left) + scope.countNodes(r.right);
};
}
