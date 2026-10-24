/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 32594:32670.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0352(scope) {
scope.smoothstep = function smoothstep(r, e, i) {
  return r <= e ? 0 : r >= i ? 1 : (r = (r - e) / (i - e), r * r * (3 - 2 * r));
};
}
