/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 521594:521690.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1048(scope) {
scope.setValueM3Array = function setValueM3Array(r, e) {
  const i = scope.flatten(e, this.size, 9);
  r.uniformMatrix3fv(this.addr, !1, i);
};
}
