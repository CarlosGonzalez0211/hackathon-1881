/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 678517:678607.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1147(scope) {
scope.addToIdle = function addToIdle(r) {
  scope.idleCbs.push(r), scope._idle === null && (scope._idle = requestIdleCallback(scope.idleTick));
};
}
