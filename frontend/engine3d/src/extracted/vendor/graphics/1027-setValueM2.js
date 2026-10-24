/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 517261:517518.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1027(scope) {
scope.setValueM2 = function setValueM2(r, e) {
  const i = this.cache,
    s = e.elements;
  if (s === void 0) {
    if (scope.arraysEqual(i, e)) return;
    r.uniformMatrix2fv(this.addr, !1, e), scope.copyArray(i, e);
  } else {
    if (scope.arraysEqual(i, s)) return;
    scope.mat2array.set(s), r.uniformMatrix2fv(this.addr, !1, scope.mat2array), scope.copyArray(i, s);
  }
};
}
