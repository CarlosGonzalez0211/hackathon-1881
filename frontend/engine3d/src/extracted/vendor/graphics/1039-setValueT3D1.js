/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 519910:520064.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1039(scope) {
scope.setValueT3D1 = function setValueT3D1(r, e, i) {
  const s = this.cache,
    a = i.allocateTextureUnit();
  s[0] !== a && (r.uniform1i(this.addr, a), s[0] = a), i.setTexture3D(e || scope.empty3dTexture, a);
};
}
