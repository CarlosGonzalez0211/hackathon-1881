/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 516999:517261.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1026(scope) {
scope.setValueV4f = function setValueV4f(r, e) {
  const i = this.cache;
  if (e.x !== void 0) (i[0] !== e.x || i[1] !== e.y || i[2] !== e.z || i[3] !== e.w) && (r.uniform4f(this.addr, e.x, e.y, e.z, e.w), i[0] = e.x, i[1] = e.y, i[2] = e.z, i[3] = e.w);else {
    if (scope.arraysEqual(i, e)) return;
    r.uniform4fv(this.addr, e), scope.copyArray(i, e);
  }
};
}
