/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 955172:957723.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1580(scope) {
scope.KawaseBlurPass = class extends scope.Pass {
  constructor({
    kernelSize: r = scope.KernelSize.MEDIUM,
    resolutionScale: e = .5,
    width: i = scope.Resolution.AUTO_SIZE,
    height: s = scope.Resolution.AUTO_SIZE,
    resolutionX: a = i,
    resolutionY: o = s
  } = {}) {
    super("KawaseBlurPass"), this.renderTargetA = new scope.WebGLRenderTarget(1, 1, {
      depthBuffer: !1
    }), this.renderTargetA.texture.name = "Blur.Target.A", this.renderTargetB = this.renderTargetA.clone(), this.renderTargetB.texture.name = "Blur.Target.B";
    const l = this.resolution = new scope.Resolution(this, a, o, e);
    scope.__lifecycle.listen(l, "change", c => this.setSize(l.baseWidth, l.baseHeight)), this._blurMaterial = new scope.KawaseBlurMaterial(), this._blurMaterial.kernelSize = r, this.copyMaterial = new scope.CopyMaterial();
  }
  getResolution() {
    return this.resolution;
  }
  get blurMaterial() {
    return this._blurMaterial;
  }
  set blurMaterial(r) {
    this._blurMaterial = r;
  }
  get dithering() {
    return this.copyMaterial.dithering;
  }
  set dithering(r) {
    this.copyMaterial.dithering = r;
  }
  get kernelSize() {
    return this.blurMaterial.kernelSize;
  }
  set kernelSize(r) {
    this.blurMaterial.kernelSize = r;
  }
  get width() {
    return this.resolution.width;
  }
  set width(r) {
    this.resolution.preferredWidth = r;
  }
  get height() {
    return this.resolution.height;
  }
  set height(r) {
    this.resolution.preferredHeight = r;
  }
  get scale() {
    return this.blurMaterial.scale;
  }
  set scale(r) {
    this.blurMaterial.scale = r;
  }
  getScale() {
    return this.blurMaterial.scale;
  }
  setScale(r) {
    this.blurMaterial.scale = r;
  }
  getKernelSize() {
    return this.kernelSize;
  }
  setKernelSize(r) {
    this.kernelSize = r;
  }
  getResolutionScale() {
    return this.resolution.scale;
  }
  setResolutionScale(r) {
    this.resolution.scale = r;
  }
  render(r, e, i, s, a) {
    const o = this.scene,
      l = this.camera,
      c = this.renderTargetA,
      h = this.renderTargetB,
      d = this.blurMaterial,
      p = d.kernelSequence;
    let f = e;
    this.fullscreenMaterial = d;
    for (let _ = 0, x = p.length; _ < x; ++_) {
      const b = (_ & 1) === 0 ? c : h;
      d.kernel = p[_], d.inputBuffer = f.texture, r.setRenderTarget(b), r.render(o, l), f = b;
    }
    this.fullscreenMaterial = this.copyMaterial, this.copyMaterial.inputBuffer = f.texture, r.setRenderTarget(this.renderToScreen ? null : i), r.render(o, l);
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
  static get AUTO_SIZE() {
    return scope.Resolution.AUTO_SIZE;
  }
};
}
