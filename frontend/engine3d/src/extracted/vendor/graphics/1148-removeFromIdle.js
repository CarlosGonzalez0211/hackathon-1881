/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 678607:678687.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1148(scope) {
scope.removeFromIdle = function removeFromIdle(r) {
  const e = scope.idleCbs.indexOf(r);
  e > -1 && scope.idleCbs.splice(e, 1);
};
}
