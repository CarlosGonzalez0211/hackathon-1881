/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 517775:518032.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1029(scope) {
scope.setValueM4 = function setValueM4(r, e) {
  const i = this.cache,
    s = e.elements;
  if (s === void 0) {
    if (scope.arraysEqual(i, e)) return;
    r.uniformMatrix4fv(this.addr, !1, e), scope.copyArray(i, e);
  } else {
    if (scope.arraysEqual(i, s)) return;
    scope.mat4array.set(s), r.uniformMatrix4fv(this.addr, !1, scope.mat4array), scope.copyArray(i, s);
  }
};
}
