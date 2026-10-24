/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 516427:516639.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1024(scope) {
scope.setValueV2f = function setValueV2f(r, e) {
  const i = this.cache;
  if (e.x !== void 0) (i[0] !== e.x || i[1] !== e.y) && (r.uniform2f(this.addr, e.x, e.y), i[0] = e.x, i[1] = e.y);else {
    if (scope.arraysEqual(i, e)) return;
    r.uniform2fv(this.addr, e), scope.copyArray(i, e);
  }
};
}
