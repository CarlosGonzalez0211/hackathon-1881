/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 218157:218812.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0620(scope) {
scope.DepthTexture = class DepthTexture extends scope.Texture {
  constructor(e, i, s = scope.UnsignedIntType, a, o, l, c = scope.NearestFilter, h = scope.NearestFilter, d, p = scope.DepthFormat, f = 1) {
    if (p !== scope.DepthFormat && p !== scope.DepthStencilFormat) throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");
    const _ = {
      width: e,
      height: i,
      depth: f
    };
    super(_, a, o, l, c, h, p, s, d), this.isDepthTexture = !0, this.flipY = !1, this.generateMipmaps = !1, this.compareFunction = null;
  }
  copy(e) {
    return super.copy(e), this.source = new scope.Source(Object.assign({}, e.image)), this.compareFunction = e.compareFunction, this;
  }
  toJSON(e) {
    const i = super.toJSON(e);
    return this.compareFunction !== null && (i.compareFunction = this.compareFunction), i;
  }
};
}
