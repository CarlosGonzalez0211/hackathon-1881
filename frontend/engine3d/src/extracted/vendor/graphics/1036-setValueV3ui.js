/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 519138:519378.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1036(scope) {
scope.setValueV3ui = function setValueV3ui(r, e) {
  const i = this.cache;
  if (e.x !== void 0) (i[0] !== e.x || i[1] !== e.y || i[2] !== e.z) && (r.uniform3ui(this.addr, e.x, e.y, e.z), i[0] = e.x, i[1] = e.y, i[2] = e.z);else {
    if (scope.arraysEqual(i, e)) return;
    r.uniform3uiv(this.addr, e), scope.copyArray(i, e);
  }
};
}
