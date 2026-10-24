/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1103391:1104587.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1638(scope) {
scope.AdaptiveLuminancePass = class extends scope.Pass {
  constructor(r, {
    minLuminance: e = .01,
    adaptationRate: i = 1
  } = {}) {
    super("AdaptiveLuminancePass"), this.fullscreenMaterial = new scope.AdaptiveLuminanceMaterial(), this.needsSwap = !1, this.renderTargetPrevious = new scope.WebGLRenderTarget(1, 1, {
      minFilter: scope.NearestFilter,
      magFilter: scope.NearestFilter,
      depthBuffer: !1
    }), this.renderTargetPrevious.texture.name = "Luminance.Previous";
    const s = this.fullscreenMaterial;
    s.luminanceBuffer0 = this.renderTargetPrevious.texture, s.luminanceBuffer1 = r, s.minLuminance = e, s.adaptationRate = i, this.renderTargetAdapted = this.renderTargetPrevious.clone(), this.renderTargetAdapted.texture.name = "Luminance.Adapted", this.copyPass = new scope.CopyPass(this.renderTargetPrevious, !1);
  }
  get texture() {
    return this.renderTargetAdapted.texture;
  }
  getTexture() {
    return this.renderTargetAdapted.texture;
  }
  set mipLevel1x1(r) {
    this.fullscreenMaterial.mipLevel1x1 = r;
  }
  get adaptationRate() {
    return this.fullscreenMaterial.adaptationRate;
  }
  set adaptationRate(r) {
    this.fullscreenMaterial.adaptationRate = r;
  }
  render(r, e, i, s, a) {
    this.fullscreenMaterial.deltaTime = s, r.setRenderTarget(this.renderToScreen ? null : this.renderTargetAdapted), r.render(this.scene, this.camera), this.copyPass.render(r, this.renderTargetAdapted);
  }
};
}
