/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 32525:32594.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0351(scope) {
scope.pingpong = function pingpong(r, e = 1) {
  return e - Math.abs(scope.euclideanModulo(r, e * 2) - e);
};
}
