/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1123156:1124901.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1650(scope) {
scope.GaussianBlurPass = class extends scope.Pass {
  constructor({
    kernelSize: r = 35,
    iterations: e = 1,
    resolutionScale: i = 1,
    resolutionX: s = scope.Resolution.AUTO_SIZE,
    resolutionY: a = scope.Resolution.AUTO_SIZE
  } = {}) {
    super("GaussianBlurPass"), this.renderTargetA = new scope.WebGLRenderTarget(1, 1, {
      depthBuffer: !1
    }), this.renderTargetA.texture.name = "Blur.Target.A", this.renderTargetB = this.renderTargetA.clone(), this.renderTargetB.texture.name = "Blur.Target.B", this.blurMaterial = new scope.GaussianBlurMaterial({
      kernelSize: r
    }), this.copyMaterial = new scope.CopyMaterial(), this.copyMaterial.inputBuffer = this.renderTargetB.texture;
    const o = this.resolution = new scope.Resolution(this, s, a, i);
    scope.__lifecycle.listen(o, "change", l => this.setSize(o.baseWidth, o.baseHeight)), this.iterations = e;
  }
  render(r, e, i, s, a) {
    const o = this.scene,
      l = this.camera,
      c = this.renderTargetA,
      h = this.renderTargetB,
      d = this.blurMaterial;
    this.fullscreenMaterial = d;
    let p = e;
    for (let f = 0, _ = Math.max(this.iterations, 1); f < _; ++f) d.direction.set(1, 0), d.inputBuffer = p.texture, r.setRenderTarget(c), r.render(o, l), d.direction.set(0, 1), d.inputBuffer = c.texture, r.setRenderTarget(h), r.render(o, l), f === 0 && _ > 1 && (p = h);
    this.fullscreenMaterial = this.copyMaterial, r.setRenderTarget(this.renderToScreen ? null : i), r.render(o, l);
  }
  setSize(r, e) {
    const i = this.resolution;
    i.setBaseSize(r, e);
    const s = i.width,
      a = i.height;
    this.renderTargetA.setSize(s, a), this.renderTargetB.setSize(s, a), this.blurMaterial.setSize(r, e);
  }
  initialize(r, e, i) {
    i !== void 0 && (this.renderTargetA.texture.type = i, this.renderTargetB.texture.type = i, i !== scope.UnsignedByteType ? (this.blurMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1", this.copyMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1") : r !== null && r.outputColorSpace === scope.SRGBColorSpace && (this.renderTargetA.texture.colorSpace = scope.SRGBColorSpace, this.renderTargetB.texture.colorSpace = scope.SRGBColorSpace));
  }
};
}
