/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 968665:971686.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1592(scope) {
scope.BloomEffect = class extends scope.Effect {
  constructor({
    blendFunction: r = scope.BlendFunction.SCREEN,
    luminanceThreshold: e = 1,
    luminanceSmoothing: i = .03,
    mipmapBlur: s = !0,
    intensity: a = 1,
    radius: o = .85,
    levels: l = 8,
    kernelSize: c = scope.KernelSize.LARGE,
    resolutionScale: h = .5,
    width: d = scope.Resolution.AUTO_SIZE,
    height: p = scope.Resolution.AUTO_SIZE,
    resolutionX: f = d,
    resolutionY: _ = p
  } = {}) {
    super("BloomEffect", scope.bloom_default, {
      blendFunction: r,
      uniforms: new Map([["map", new scope.Uniform(null)], ["intensity", new scope.Uniform(a)]])
    }), this.renderTarget = new scope.WebGLRenderTarget(1, 1, {
      depthBuffer: !1
    }), this.renderTarget.texture.name = "Bloom.Target", this.blurPass = new scope.KawaseBlurPass({
      kernelSize: c
    }), this.luminancePass = new scope.LuminancePass({
      colorOutput: !0
    }), this.luminanceMaterial.threshold = e, this.luminanceMaterial.smoothing = i, this.mipmapBlurPass = new scope.MipmapBlurPass(), this.mipmapBlurPass.enabled = s, this.mipmapBlurPass.radius = o, this.mipmapBlurPass.levels = l, this.uniforms.get("map").value = s ? this.mipmapBlurPass.texture : this.renderTarget.texture;
    const x = this.resolution = new scope.Resolution(this, f, _, h);
    scope.__lifecycle.listen(x, "change", b => this.setSize(x.baseWidth, x.baseHeight));
  }
  get texture() {
    return this.mipmapBlurPass.enabled ? this.mipmapBlurPass.texture : this.renderTarget.texture;
  }
  getTexture() {
    return this.texture;
  }
  getResolution() {
    return this.resolution;
  }
  getBlurPass() {
    return this.blurPass;
  }
  getLuminancePass() {
    return this.luminancePass;
  }
  get luminanceMaterial() {
    return this.luminancePass.fullscreenMaterial;
  }
  getLuminanceMaterial() {
    return this.luminancePass.fullscreenMaterial;
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
  get dithering() {
    return this.blurPass.dithering;
  }
  set dithering(r) {
    this.blurPass.dithering = r;
  }
  get kernelSize() {
    return this.blurPass.kernelSize;
  }
  set kernelSize(r) {
    this.blurPass.kernelSize = r;
  }
  get distinction() {
    return console.warn(this.name, "distinction was removed"), 1;
  }
  set distinction(r) {
    console.warn(this.name, "distinction was removed");
  }
  get intensity() {
    return this.uniforms.get("intensity").value;
  }
  set intensity(r) {
    this.uniforms.get("intensity").value = r;
  }
  getIntensity() {
    return this.intensity;
  }
  setIntensity(r) {
    this.intensity = r;
  }
  getResolutionScale() {
    return this.resolution.scale;
  }
  setResolutionScale(r) {
    this.resolution.scale = r;
  }
  update(r, e, i) {
    const s = this.renderTarget,
      a = this.luminancePass;
    a.enabled ? (a.render(r, e), this.mipmapBlurPass.enabled ? this.mipmapBlurPass.render(r, a.renderTarget) : this.blurPass.render(r, a.renderTarget, s)) : this.mipmapBlurPass.enabled ? this.mipmapBlurPass.render(r, e) : this.blurPass.render(r, e, s);
  }
  setSize(r, e) {
    const i = this.resolution;
    i.setBaseSize(r, e), this.renderTarget.setSize(i.width, i.height), this.blurPass.resolution.copy(i), this.luminancePass.setSize(r, e), this.mipmapBlurPass.setSize(r, e);
  }
  initialize(r, e, i) {
    this.blurPass.initialize(r, e, i), this.luminancePass.initialize(r, e, i), this.mipmapBlurPass.initialize(r, e, i), i !== void 0 && (this.renderTarget.texture.type = i, r !== null && r.outputColorSpace === scope.SRGBColorSpace && (this.renderTarget.texture.colorSpace = scope.SRGBColorSpace));
  }
};
}
