/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 558898:559017.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1113(scope) {
scope.shadowCastingAndTexturingLightsFirst = function shadowCastingAndTexturingLightsFirst(r, e) {
  return (e.castShadow ? 2 : 0) - (r.castShadow ? 2 : 0) + (e.map ? 1 : 0) - (r.map ? 1 : 0);
};
}
