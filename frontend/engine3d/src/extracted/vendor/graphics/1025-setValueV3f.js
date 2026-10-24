/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 516639:516999.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1025(scope) {
scope.setValueV3f = function setValueV3f(r, e) {
  const i = this.cache;
  if (e.x !== void 0) (i[0] !== e.x || i[1] !== e.y || i[2] !== e.z) && (r.uniform3f(this.addr, e.x, e.y, e.z), i[0] = e.x, i[1] = e.y, i[2] = e.z);else if (e.r !== void 0) (i[0] !== e.r || i[1] !== e.g || i[2] !== e.b) && (r.uniform3f(this.addr, e.r, e.g, e.b), i[0] = e.r, i[1] = e.g, i[2] = e.b);else {
    if (scope.arraysEqual(i, e)) return;
    r.uniform3fv(this.addr, e), scope.copyArray(i, e);
  }
};
}
