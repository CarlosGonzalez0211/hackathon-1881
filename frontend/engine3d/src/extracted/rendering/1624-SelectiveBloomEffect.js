/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1008278:1010649.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1624(scope) {
scope.SelectiveBloomEffect = class extends scope.BloomEffect {
  constructor(r, e, i) {
    super(i), this.setAttributes(this.getAttributes() | scope.EffectAttribute.DEPTH), this.camera = e, this.depthPass = new scope.DepthPass(r, e), this.clearPass = new scope.ClearPass(!0, !1, !1), this.clearPass.overrideClearColor = new scope.Color(0), this.depthMaskPass = new scope.ShaderPass(new scope.DepthMaskMaterial());
    const s = this.depthMaskMaterial;
    s.copyCameraSettings(e), s.depthBuffer1 = this.depthPass.texture, s.depthPacking1 = scope.RGBADepthPacking, s.depthMode = scope.EqualDepth, this.renderTargetMasked = new scope.WebGLRenderTarget(1, 1, {
      depthBuffer: !1
    }), this.renderTargetMasked.texture.name = "Bloom.Masked", this.selection = new scope.Selection(), this._inverted = !1, this._ignoreBackground = !1;
  }
  set mainScene(r) {
    this.depthPass.mainScene = r;
  }
  set mainCamera(r) {
    this.camera = r, this.depthPass.mainCamera = r, this.depthMaskMaterial.copyCameraSettings(r);
  }
  getSelection() {
    return this.selection;
  }
  get depthMaskMaterial() {
    return this.depthMaskPass.fullscreenMaterial;
  }
  get inverted() {
    return this._inverted;
  }
  set inverted(r) {
    this._inverted = r, this.depthMaskMaterial.depthMode = r ? scope.NotEqualDepth : scope.EqualDepth;
  }
  isInverted() {
    return this.inverted;
  }
  setInverted(r) {
    this.inverted = r;
  }
  get ignoreBackground() {
    return this._ignoreBackground;
  }
  set ignoreBackground(r) {
    this._ignoreBackground = r, this.depthMaskMaterial.maxDepthStrategy = r ? scope.DepthTestStrategy.DISCARD_MAX_DEPTH : scope.DepthTestStrategy.KEEP_MAX_DEPTH;
  }
  isBackgroundDisabled() {
    return this.ignoreBackground;
  }
  setBackgroundDisabled(r) {
    this.ignoreBackground = r;
  }
  setDepthTexture(r, e = scope.BasicDepthPacking) {
    this.depthMaskMaterial.depthBuffer0 = r, this.depthMaskMaterial.depthPacking0 = e;
  }
  update(r, e, i) {
    const s = this.camera,
      a = this.selection,
      o = this.inverted;
    let l = e;
    if (this.ignoreBackground || !o || a.size > 0) {
      const c = s.layers.mask;
      s.layers.set(a.layer), this.depthPass.render(r), s.layers.mask = c, l = this.renderTargetMasked, this.clearPass.render(r, l), this.depthMaskPass.render(r, e, l);
    }
    super.update(r, l, i);
  }
  setSize(r, e) {
    super.setSize(r, e), this.renderTargetMasked.setSize(r, e), this.depthPass.setSize(r, e);
  }
  initialize(r, e, i) {
    super.initialize(r, e, i), this.clearPass.initialize(r, e, i), this.depthPass.initialize(r, e, i), this.depthMaskPass.initialize(r, e, i), r !== null && r.capabilities.logarithmicDepthBuffer && (this.depthMaskPass.fullscreenMaterial.defines.LOG_DEPTH = "1"), i !== void 0 && (this.renderTargetMasked.texture.type = i, r !== null && r.outputColorSpace === scope.SRGBColorSpace && (this.renderTargetMasked.texture.colorSpace = scope.SRGBColorSpace));
  }
};
}
