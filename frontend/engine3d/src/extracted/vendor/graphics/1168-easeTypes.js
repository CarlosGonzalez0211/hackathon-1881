/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 710994:711125.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1168(scope) {
scope.easeTypes = {
  in: r => e => r(e),
  out: r => e => 1 - r(1 - e),
  inout: r => e => e < .5 ? r(e * 2) / 2 : 1 - r(e * -2 + 2) / 2,
  outin: r => e => e < .5 ? (1 - r(1 - e * 2)) / 2 : (r(e * 2 - 1) + 1) / 2
};
}
