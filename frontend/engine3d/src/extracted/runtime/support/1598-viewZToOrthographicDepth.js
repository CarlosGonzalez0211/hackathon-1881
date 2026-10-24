/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 974228:974312.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1598(scope) {
scope.viewZToOrthographicDepth = function viewZToOrthographicDepth(r, e, i) {
  return Math.min(Math.max((r + e) / (e - i), 0), 1);
};
}
