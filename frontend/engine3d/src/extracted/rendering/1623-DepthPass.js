/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1006982:1008277.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1623(scope) {
scope.DepthPass = class extends scope.Pass {
  constructor(r, e, {
    renderTarget: i,
    resolutionScale: s = 1,
    width: a = scope.Resolution.AUTO_SIZE,
    height: o = scope.Resolution.AUTO_SIZE,
    resolutionX: l = a,
    resolutionY: c = o
  } = {}) {
    super("DepthPass"), this.needsSwap = !1, this.renderPass = new scope.RenderPass(r, e, new scope.MeshDepthMaterial({
      depthPacking: scope.RGBADepthPacking
    }));
    const h = this.renderPass;
    h.skipShadowMapUpdate = !0, h.ignoreBackground = !0;
    const d = h.clearPass;
    d.overrideClearColor = new scope.Color(16777215), d.overrideClearAlpha = 1, this.renderTarget = i, this.renderTarget === void 0 && (this.renderTarget = new scope.WebGLRenderTarget(1, 1, {
      minFilter: scope.NearestFilter,
      magFilter: scope.NearestFilter
    }), this.renderTarget.texture.name = "DepthPass.Target");
    const p = this.resolution = new scope.Resolution(this, l, c, s);
    scope.__lifecycle.listen(p, "change", f => this.setSize(p.baseWidth, p.baseHeight));
  }
  set mainScene(r) {
    this.renderPass.mainScene = r;
  }
  set mainCamera(r) {
    this.renderPass.mainCamera = r;
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
  getResolutionScale() {
    return this.resolution.scale;
  }
  setResolutionScale(r) {
    this.resolution.scale = r;
  }
  render(r, e, i, s, a) {
    const o = this.renderToScreen ? null : this.renderTarget;
    this.renderPass.render(r, o);
  }
  setSize(r, e) {
    const i = this.resolution;
    i.setBaseSize(r, e), this.renderTarget.setSize(i.width, i.height);
  }
};
}
