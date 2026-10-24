/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 520064:520220.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1040(scope) {
scope.setValueT6 = function setValueT6(r, e, i) {
  const s = this.cache,
    a = i.allocateTextureUnit();
  s[0] !== a && (r.uniform1i(this.addr, a), s[0] = a), i.setTextureCube(e || scope.emptyCubeTexture, a);
};
}
