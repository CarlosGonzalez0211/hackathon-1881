/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 518121:518333.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1031(scope) {
scope.setValueV2i = function setValueV2i(r, e) {
  const i = this.cache;
  if (e.x !== void 0) (i[0] !== e.x || i[1] !== e.y) && (r.uniform2i(this.addr, e.x, e.y), i[0] = e.x, i[1] = e.y);else {
    if (scope.arraysEqual(i, e)) return;
    r.uniform2iv(this.addr, e), scope.copyArray(i, e);
  }
};
}
