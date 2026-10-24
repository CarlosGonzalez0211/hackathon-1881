/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 32670:32758.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0353(scope) {
scope.smootherstep = function smootherstep(r, e, i) {
  return r <= e ? 0 : r >= i ? 1 : (r = (r - e) / (i - e), r * r * r * (r * (r * 6 - 15) + 10));
};
}
