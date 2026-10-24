/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1585937:1586046.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2019(scope) {
scope.reset = function reset() {
  scope.progress = {}, Object.keys(scope.QUESTINFO).forEach(r => {
    scope.progress[r] = scope.QUESTINFO[r].steps.map(() => !1);
  });
};
}
