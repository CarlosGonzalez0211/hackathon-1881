/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 32468:32525.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0350(scope) {
scope.damp = function damp(r, e, i, s) {
  return scope.lerp(r, e, 1 - Math.exp(-i * s));
};
}
