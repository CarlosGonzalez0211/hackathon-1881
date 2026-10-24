/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 522457:522666.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1059(scope) {
scope.setValueT3DArray = function setValueT3DArray(r, e, i) {
  const s = this.cache,
    a = e.length,
    o = scope.allocTexUnits(i, a);
  scope.arraysEqual(s, o) || (r.uniform1iv(this.addr, o), scope.copyArray(s, o));
  for (let l = 0; l !== a; ++l) i.setTexture3D(e[l] || scope.empty3dTexture, o[l]);
};
}
