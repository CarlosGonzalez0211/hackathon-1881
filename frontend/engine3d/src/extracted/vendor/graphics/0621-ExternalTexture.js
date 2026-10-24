/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 218812:218995.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0621(scope) {
scope.ExternalTexture = class ExternalTexture extends scope.Texture {
  constructor(e = null) {
    super(), this.sourceTexture = e, this.isExternalTexture = !0;
  }
  copy(e) {
    return super.copy(e), this.sourceTexture = e.sourceTexture, this;
  }
};
}
