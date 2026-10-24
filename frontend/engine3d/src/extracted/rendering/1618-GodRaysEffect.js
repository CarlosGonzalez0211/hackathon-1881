/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1002185:1006752.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1618(scope) {
scope.GodRaysEffect = class extends scope.Effect {
  constructor(r, e, {
    blendFunction: i = scope.BlendFunction.SCREEN,
    samples: s = 60,
    density: a = .96,
    decay: o = .9,
    weight: l = .4,
    exposure: c = .6,
    clampMax: h = 1,
    blur: d = !0,
    kernelSize: p = scope.KernelSize.SMALL,
    resolutionScale: f = .5,
    width: _ = scope.Resolution.AUTO_SIZE,
    height: x = scope.Resolution.AUTO_SIZE,
    resolutionX: b = _,
    resolutionY: T = x
  } = {}) {
    super("GodRaysEffect", scope.god_rays_default, {
      blendFunction: i,
      attributes: scope.EffectAttribute.DEPTH,
      uniforms: new Map([["map", new scope.Uniform(null)]])
    }), this.camera = r, this._lightSource = e, this.lightSource = e, this.lightScene = new scope.Scene(), this.screenPosition = new scope.Vector2(), this.renderTargetA = new scope.WebGLRenderTarget(1, 1, {
      depthBuffer: !1
    }), this.renderTargetA.texture.name = "GodRays.Target.A", this.renderTargetB = this.renderTargetA.clone(), this.renderTargetB.texture.name = "GodRays.Target.B", this.uniforms.get("map").value = this.renderTargetB.texture, this.renderTargetLight = new scope.WebGLRenderTarget(1, 1), this.renderTargetLight.texture.name = "GodRays.Light", this.renderTargetLight.depthTexture = new scope.DepthTexture(), this.renderPassLight = new scope.RenderPass(this.lightScene, r), this.renderPassLight.clearPass.overrideClearColor = new scope.Color(0), this.clearPass = new scope.ClearPass(!0, !1, !1), this.clearPass.overrideClearColor = new scope.Color(0), this.blurPass = new scope.KawaseBlurPass({
      kernelSize: p
    }), this.blurPass.enabled = d, this.depthMaskPass = new scope.ShaderPass(new scope.DepthMaskMaterial());
    const M = this.depthMaskMaterial;
    M.depthBuffer1 = this.renderTargetLight.depthTexture, M.copyCameraSettings(r), this.godRaysPass = new scope.ShaderPass(new scope.GodRaysMaterial(this.screenPosition));
    const w = this.godRaysMaterial;
    w.density = a, w.decay = o, w.weight = l, w.exposure = c, w.maxIntensity = h, w.samples = s;
    const D = this.resolution = new scope.Resolution(this, b, T, f);
    scope.__lifecycle.listen(D, "change", R => this.setSize(D.baseWidth, D.baseHeight));
  }
  set mainCamera(r) {
    this.camera = r, this.renderPassLight.mainCamera = r, this.depthMaskMaterial.copyCameraSettings(r);
  }
  get lightSource() {
    return this._lightSource;
  }
  set lightSource(r) {
    this._lightSource = r, r !== null && (r.material.depthWrite = !1, r.material.transparent = !0);
  }
  getBlurPass() {
    return this.blurPass;
  }
  get texture() {
    return this.renderTargetB.texture;
  }
  getTexture() {
    return this.texture;
  }
  get depthMaskMaterial() {
    return this.depthMaskPass.fullscreenMaterial;
  }
  get godRaysMaterial() {
    return this.godRaysPass.fullscreenMaterial;
  }
  getGodRaysMaterial() {
    return this.godRaysMaterial;
  }
  getResolution() {
    return this.resolution;
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
    return this.godRaysMaterial.dithering;
  }
  set dithering(r) {
    const e = this.godRaysMaterial;
    e.dithering = r, e.needsUpdate = !0;
  }
  get blur() {
    return this.blurPass.enabled;
  }
  set blur(r) {
    this.blurPass.enabled = r;
  }
  get kernelSize() {
    return this.blurPass.kernelSize;
  }
  set kernelSize(r) {
    this.blurPass.kernelSize = r;
  }
  getResolutionScale() {
    return this.resolution.scale;
  }
  setResolutionScale(r) {
    this.resolution.scale = r;
  }
  get samples() {
    return this.godRaysMaterial.samples;
  }
  set samples(r) {
    this.godRaysMaterial.samples = r;
  }
  setDepthTexture(r, e = scope.BasicDepthPacking) {
    this.depthMaskPass.fullscreenMaterial.depthBuffer0 = r, this.depthMaskPass.fullscreenMaterial.depthPacking0 = e;
  }
  update(r, e, i) {
    const s = this.lightSource,
      a = s.parent,
      o = s.matrixAutoUpdate,
      l = this.renderTargetA,
      c = this.renderTargetLight;
    s.material.depthWrite = !0, s.matrixAutoUpdate = !1, s.updateWorldMatrix(!0, !1), a !== null && (o || scope.m.copy(s.matrix), s.matrix.copy(s.matrixWorld)), this.lightScene.add(s), this.renderPassLight.render(r, c), this.clearPass.render(r, l), this.depthMaskPass.render(r, c, l), s.material.depthWrite = !1, s.matrixAutoUpdate = o, a !== null && (o || s.matrix.copy(scope.m), a.add(s)), scope.v.setFromMatrixPosition(s.matrixWorld).project(this.camera), this.screenPosition.set(Math.min(Math.max((scope.v.x + 1) * .5, -1), 2), Math.min(Math.max((scope.v.y + 1) * .5, -1), 2)), this.blurPass.enabled && this.blurPass.render(r, l, l), this.godRaysPass.render(r, l, this.renderTargetB);
  }
  setSize(r, e) {
    const i = this.resolution;
    i.setBaseSize(r, e);
    const s = i.width,
      a = i.height;
    this.renderTargetA.setSize(s, a), this.renderTargetB.setSize(s, a), this.renderTargetLight.setSize(s, a), this.blurPass.resolution.copy(i);
  }
  initialize(r, e, i) {
    this.blurPass.initialize(r, e, i), this.renderPassLight.initialize(r, e, i), this.depthMaskPass.initialize(r, e, i), this.godRaysPass.initialize(r, e, i), i !== void 0 && (this.renderTargetA.texture.type = i, this.renderTargetB.texture.type = i, this.renderTargetLight.texture.type = i, r !== null && r.outputColorSpace === scope.SRGBColorSpace && (this.renderTargetA.texture.colorSpace = scope.SRGBColorSpace, this.renderTargetB.texture.colorSpace = scope.SRGBColorSpace, this.renderTargetLight.texture.colorSpace = scope.SRGBColorSpace));
  }
};
}
