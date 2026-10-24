/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 518333:518570.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1032(scope) {
scope.setValueV3i = function setValueV3i(r, e) {
  const i = this.cache;
  if (e.x !== void 0) (i[0] !== e.x || i[1] !== e.y || i[2] !== e.z) && (r.uniform3i(this.addr, e.x, e.y, e.z), i[0] = e.x, i[1] = e.y, i[2] = e.z);else {
    if (scope.arraysEqual(i, e)) return;
    r.uniform3iv(this.addr, e), scope.copyArray(i, e);
  }
};
}
