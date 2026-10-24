/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 517518:517775.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1028(scope) {
scope.setValueM3 = function setValueM3(r, e) {
  const i = this.cache,
    s = e.elements;
  if (s === void 0) {
    if (scope.arraysEqual(i, e)) return;
    r.uniformMatrix3fv(this.addr, !1, e), scope.copyArray(i, e);
  } else {
    if (scope.arraysEqual(i, s)) return;
    scope.mat3array.set(s), r.uniformMatrix3fv(this.addr, !1, scope.mat3array), scope.copyArray(i, s);
  }
};
}
