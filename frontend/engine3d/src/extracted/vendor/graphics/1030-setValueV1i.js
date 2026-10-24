/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 518032:518121.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1030(scope) {
scope.setValueV1i = function setValueV1i(r, e) {
  const i = this.cache;
  i[0] !== e && (r.uniform1i(this.addr, e), i[0] = e);
};
}
