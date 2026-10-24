/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 521322:521410.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1045(scope) {
scope.setValueV3fArray = function setValueV3fArray(r, e) {
  const i = scope.flatten(e, this.size, 3);
  r.uniform3fv(this.addr, i);
};
}
