/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 519643:519910.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1038(scope) {
scope.setValueT1 = function setValueT1(r, e, i) {
  const s = this.cache,
    a = i.allocateTextureUnit();
  s[0] !== a && (r.uniform1i(this.addr, a), s[0] = a);
  let o;
  this.type === r.SAMPLER_2D_SHADOW ? (scope.emptyShadowTexture.compareFunction = scope.LessEqualCompare, o = scope.emptyShadowTexture) : o = scope.emptyTexture, i.setTexture2D(e || o, a);
};
}
