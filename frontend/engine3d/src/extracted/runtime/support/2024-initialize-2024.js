/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1586818:1586931.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2024(scope) {
Object.keys(scope.QUESTINFO).forEach(r => {
  scope.anyStepInitiated || scope.QUESTINFO[r].steps.some(e => e === !0) && (scope.anyStepInitiated = !0);
});
}
