/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 522666:522878.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1060(scope) {
scope.setValueT6Array = function setValueT6Array(r, e, i) {
  const s = this.cache,
    a = e.length,
    o = scope.allocTexUnits(i, a);
  scope.arraysEqual(s, o) || (r.uniform1iv(this.addr, o), scope.copyArray(s, o));
  for (let l = 0; l !== a; ++l) i.setTextureCube(e[l] || scope.emptyCubeTexture, o[l]);
};
}
