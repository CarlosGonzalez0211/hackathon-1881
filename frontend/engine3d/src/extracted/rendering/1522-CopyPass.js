/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 926503:927528.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1522(scope) {
scope.CopyPass = class extends scope.Pass {
  constructor(r, e = !0) {
    super("CopyPass"), this.fullscreenMaterial = new scope.CopyMaterial(), this.needsSwap = !1, this.renderTarget = r, r === void 0 && (this.renderTarget = new scope.WebGLRenderTarget(1, 1, {
      minFilter: scope.LinearFilter,
      magFilter: scope.LinearFilter,
      stencilBuffer: !1,
      depthBuffer: !1
    }), this.renderTarget.texture.name = "CopyPass.Target"), this.autoResize = e;
  }
  get resize() {
    return this.autoResize;
  }
  set resize(r) {
    this.autoResize = r;
  }
  get texture() {
    return this.renderTarget.texture;
  }
  getTexture() {
    return this.renderTarget.texture;
  }
  setAutoResizeEnabled(r) {
    this.autoResize = r;
  }
  render(r, e, i, s, a) {
    this.fullscreenMaterial.inputBuffer = e.texture, r.setRenderTarget(this.renderToScreen ? null : this.renderTarget), r.render(this.scene, this.camera);
  }
  setSize(r, e) {
    this.autoResize && this.renderTarget.setSize(r, e);
  }
  initialize(r, e, i) {
    i !== void 0 && (this.renderTarget.texture.type = i, i !== scope.UnsignedByteType ? this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1" : r !== null && r.outputColorSpace === scope.SRGBColorSpace && (this.renderTarget.texture.colorSpace = scope.SRGBColorSpace));
  }
};
}
