/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 521410:521498.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1046(scope) {
scope.setValueV4fArray = function setValueV4fArray(r, e) {
  const i = scope.flatten(e, this.size, 4);
  r.uniform4fv(this.addr, i);
};
}
