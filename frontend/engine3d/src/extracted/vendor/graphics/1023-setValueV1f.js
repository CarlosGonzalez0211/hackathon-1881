/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 516338:516427.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1023(scope) {
scope.setValueV1f = function setValueV1f(r, e) {
  const i = this.cache;
  i[0] !== e && (r.uniform1f(this.addr, e), i[0] = e);
};
}
