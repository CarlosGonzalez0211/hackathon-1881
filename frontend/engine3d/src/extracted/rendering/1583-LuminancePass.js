/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 960112:961252.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1583(scope) {
scope.LuminancePass = class extends scope.Pass {
  constructor({
    renderTarget: r,
    luminanceRange: e,
    colorOutput: i,
    resolutionScale: s = 1,
    width: a = scope.Resolution.AUTO_SIZE,
    height: o = scope.Resolution.AUTO_SIZE,
    resolutionX: l = a,
    resolutionY: c = o
  } = {}) {
    super("LuminancePass"), this.fullscreenMaterial = new scope.LuminanceMaterial(i, e), this.needsSwap = !1, this.renderTarget = r, this.renderTarget === void 0 && (this.renderTarget = new scope.WebGLRenderTarget(1, 1, {
      depthBuffer: !1
    }), this.renderTarget.texture.name = "LuminancePass.Target");
    const h = this.resolution = new scope.Resolution(this, l, c, s);
    scope.__lifecycle.listen(h, "change", d => this.setSize(h.baseWidth, h.baseHeight));
  }
  get texture() {
    return this.renderTarget.texture;
  }
  getTexture() {
    return this.renderTarget.texture;
  }
  getResolution() {
    return this.resolution;
  }
  render(r, e, i, s, a) {
    const o = this.fullscreenMaterial;
    o.inputBuffer = e.texture, r.setRenderTarget(this.renderToScreen ? null : this.renderTarget), r.render(this.scene, this.camera);
  }
  setSize(r, e) {
    const i = this.resolution;
    i.setBaseSize(r, e), this.renderTarget.setSize(i.width, i.height);
  }
  initialize(r, e, i) {
    i !== void 0 && i !== scope.UnsignedByteType && (this.renderTarget.texture.type = i, this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1");
  }
};
}
