/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 522878:523100.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1061(scope) {
scope.setValueT2DArrayArray = function setValueT2DArrayArray(r, e, i) {
  const s = this.cache,
    a = e.length,
    o = scope.allocTexUnits(i, a);
  scope.arraysEqual(s, o) || (r.uniform1iv(this.addr, o), scope.copyArray(s, o));
  for (let l = 0; l !== a; ++l) i.setTexture2DArray(e[l] || scope.emptyArrayTexture, o[l]);
};
}
