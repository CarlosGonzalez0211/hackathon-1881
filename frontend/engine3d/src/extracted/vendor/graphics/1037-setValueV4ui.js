/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 519378:519643.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1037(scope) {
scope.setValueV4ui = function setValueV4ui(r, e) {
  const i = this.cache;
  if (e.x !== void 0) (i[0] !== e.x || i[1] !== e.y || i[2] !== e.z || i[3] !== e.w) && (r.uniform4ui(this.addr, e.x, e.y, e.z, e.w), i[0] = e.x, i[1] = e.y, i[2] = e.z, i[3] = e.w);else {
    if (scope.arraysEqual(i, e)) return;
    r.uniform4uiv(this.addr, e), scope.copyArray(i, e);
  }
};
}
