/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 522251:522457.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1058(scope) {
scope.setValueT1Array = function setValueT1Array(r, e, i) {
  const s = this.cache,
    a = e.length,
    o = scope.allocTexUnits(i, a);
  scope.arraysEqual(s, o) || (r.uniform1iv(this.addr, o), scope.copyArray(s, o));
  for (let l = 0; l !== a; ++l) i.setTexture2D(e[l] || scope.emptyTexture, o[l]);
};
}
