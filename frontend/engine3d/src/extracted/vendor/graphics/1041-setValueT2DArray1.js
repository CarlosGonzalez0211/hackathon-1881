/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 520220:520387.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1041(scope) {
scope.setValueT2DArray1 = function setValueT2DArray1(r, e, i) {
  const s = this.cache,
    a = i.allocateTextureUnit();
  s[0] !== a && (r.uniform1i(this.addr, a), s[0] = a), i.setTexture2DArray(e || scope.emptyArrayTexture, a);
};
}
