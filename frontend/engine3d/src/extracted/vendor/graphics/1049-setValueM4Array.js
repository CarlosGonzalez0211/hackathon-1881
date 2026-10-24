/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 521690:521787.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1049(scope) {
scope.setValueM4Array = function setValueM4Array(r, e) {
  const i = scope.flatten(e, this.size, 16);
  r.uniformMatrix4fv(this.addr, !1, i);
};
}
