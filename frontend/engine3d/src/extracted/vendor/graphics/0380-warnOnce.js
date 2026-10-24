/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 54323:54388.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0380(scope) {
scope.warnOnce = function warnOnce(r) {
  r in scope._cache || (scope._cache[r] = !0, console.warn(r));
};
}
