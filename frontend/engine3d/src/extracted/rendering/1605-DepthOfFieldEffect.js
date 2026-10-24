/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 981162:987122.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1605(scope) {
scope.DepthOfFieldEffect = class extends scope.Effect {
  constructor(r, {
    blendFunction: e,
    worldFocusDistance: i,
    worldFocusRange: s,
    focusDistance: a = 0,
    focalLength: o = .1,
    focusRange: l = o,
    bokehScale: c = 1,
    resolutionScale: h = 1,
    width: d = scope.Resolution.AUTO_SIZE,
    height: p = scope.Resolution.AUTO_SIZE,
    resolutionX: f = d,
    resolutionY: _ = p
  } = {}) {
    super("DepthOfFieldEffect", scope.depth_of_field_default, {
      blendFunction: e,
      attributes: scope.EffectAttribute.DEPTH,
      uniforms: new Map([["nearColorBuffer", new scope.Uniform(null)], ["farColorBuffer", new scope.Uniform(null)], ["nearCoCBuffer", new scope.Uniform(null)], ["farCoCBuffer", new scope.Uniform(null)], ["scale", new scope.Uniform(1)]])
    }), this.camera = r, this.renderTarget = new scope.WebGLRenderTarget(1, 1, {
      depthBuffer: !1
    }), this.renderTarget.texture.name = "DoF.Intermediate", this.renderTargetMasked = this.renderTarget.clone(), this.renderTargetMasked.texture.name = "DoF.Masked.Far", this.renderTargetNear = this.renderTarget.clone(), this.renderTargetNear.texture.name = "DoF.Bokeh.Near", this.uniforms.get("nearColorBuffer").value = this.renderTargetNear.texture, this.renderTargetFar = this.renderTarget.clone(), this.renderTargetFar.texture.name = "DoF.Bokeh.Far", this.uniforms.get("farColorBuffer").value = this.renderTargetFar.texture, this.renderTargetCoC = this.renderTarget.clone(), this.renderTargetCoC.texture.name = "DoF.CoC", this.uniforms.get("farCoCBuffer").value = this.renderTargetCoC.texture, this.renderTargetCoCBlurred = this.renderTargetCoC.clone(), this.renderTargetCoCBlurred.texture.name = "DoF.CoC.Blurred", this.uniforms.get("nearCoCBuffer").value = this.renderTargetCoCBlurred.texture, this.cocPass = new scope.ShaderPass(new scope.CircleOfConfusionMaterial(r));
    const x = this.cocMaterial;
    x.focusDistance = a, x.focusRange = l, i !== void 0 && (x.worldFocusDistance = i), s !== void 0 && (x.worldFocusRange = s), this.blurPass = new scope.KawaseBlurPass({
      resolutionScale: h,
      resolutionX: f,
      resolutionY: _,
      kernelSize: scope.KernelSize.MEDIUM
    }), this.maskPass = new scope.ShaderPass(new scope.MaskMaterial(this.renderTargetCoC.texture));
    const b = this.maskPass.fullscreenMaterial;
    b.colorChannel = scope.ColorChannel.GREEN, this.maskFunction = scope.MaskFunction.MULTIPLY_RGB, this.bokehNearBasePass = new scope.ShaderPass(new scope.BokehMaterial(!1, !0)), this.bokehNearBasePass.fullscreenMaterial.cocBuffer = this.renderTargetCoCBlurred.texture, this.bokehNearFillPass = new scope.ShaderPass(new scope.BokehMaterial(!0, !0)), this.bokehNearFillPass.fullscreenMaterial.cocBuffer = this.renderTargetCoCBlurred.texture, this.bokehFarBasePass = new scope.ShaderPass(new scope.BokehMaterial(!1, !1)), this.bokehFarBasePass.fullscreenMaterial.cocBuffer = this.renderTargetCoC.texture, this.bokehFarFillPass = new scope.ShaderPass(new scope.BokehMaterial(!0, !1)), this.bokehFarFillPass.fullscreenMaterial.cocBuffer = this.renderTargetCoC.texture, this.target = null;
    const T = this.resolution = new scope.Resolution(this, f, _, h);
    scope.__lifecycle.listen(T, "change", M => this.setSize(T.baseWidth, T.baseHeight)), this.bokehScale = c;
  }
  set mainCamera(r) {
    this.camera = r, this.cocMaterial.copyCameraSettings(r);
  }
  get cocTexture() {
    return this.renderTargetCoC.texture;
  }
  get maskFunction() {
    return this.maskPass.fullscreenMaterial.maskFunction;
  }
  set maskFunction(r) {
    this.maskFunction !== r && (this.defines.set("MASK_FUNCTION", r.toFixed(0)), this.maskPass.fullscreenMaterial.maskFunction = r, this.setChanged());
  }
  get cocMaterial() {
    return this.cocPass.fullscreenMaterial;
  }
  get circleOfConfusionMaterial() {
    return this.cocMaterial;
  }
  getCircleOfConfusionMaterial() {
    return this.cocMaterial;
  }
  getBlurPass() {
    return this.blurPass;
  }
  getResolution() {
    return this.resolution;
  }
  get bokehScale() {
    return this.uniforms.get("scale").value;
  }
  set bokehScale(r) {
    this.bokehNearBasePass.fullscreenMaterial.scale = r, this.bokehNearFillPass.fullscreenMaterial.scale = r, this.bokehFarBasePass.fullscreenMaterial.scale = r, this.bokehFarFillPass.fullscreenMaterial.scale = r, this.maskPass.fullscreenMaterial.strength = r, this.uniforms.get("scale").value = r;
  }
  getBokehScale() {
    return this.bokehScale;
  }
  setBokehScale(r) {
    this.bokehScale = r;
  }
  getTarget() {
    return this.target;
  }
  setTarget(r) {
    this.target = r;
  }
  calculateFocusDistance(r) {
    const e = this.camera,
      i = e.position.distanceTo(r);
    return scope.viewZToOrthographicDepth(-i, e.near, e.far);
  }
  setDepthTexture(r, e = scope.BasicDepthPacking) {
    this.cocMaterial.depthBuffer = r, this.cocMaterial.depthPacking = e;
  }
  update(r, e, i) {
    const s = this.renderTarget,
      a = this.renderTargetCoC,
      o = this.renderTargetCoCBlurred,
      l = this.renderTargetMasked;
    if (this.target !== null) {
      const c = this.calculateFocusDistance(this.target);
      this.cocMaterial.focusDistance = c;
    }
    this.cocPass.render(r, null, a), this.blurPass.render(r, a, o), this.maskPass.render(r, e, l), this.bokehFarBasePass.render(r, l, s), this.bokehFarFillPass.render(r, s, this.renderTargetFar), this.bokehNearBasePass.render(r, e, s), this.bokehNearFillPass.render(r, s, this.renderTargetNear);
  }
  setSize(r, e) {
    const i = this.resolution;
    i.setBaseSize(r, e);
    const s = i.width,
      a = i.height;
    this.cocPass.setSize(r, e), this.blurPass.setSize(r, e), this.maskPass.setSize(r, e), this.renderTargetFar.setSize(r, e), this.renderTargetCoC.setSize(r, e), this.renderTargetMasked.setSize(r, e), this.renderTarget.setSize(s, a), this.renderTargetNear.setSize(s, a), this.renderTargetCoCBlurred.setSize(s, a), this.bokehNearBasePass.fullscreenMaterial.setSize(r, e), this.bokehNearFillPass.fullscreenMaterial.setSize(r, e), this.bokehFarBasePass.fullscreenMaterial.setSize(r, e), this.bokehFarFillPass.fullscreenMaterial.setSize(r, e);
  }
  initialize(r, e, i) {
    this.cocPass.initialize(r, e, i), this.maskPass.initialize(r, e, i), this.bokehNearBasePass.initialize(r, e, i), this.bokehNearFillPass.initialize(r, e, i), this.bokehFarBasePass.initialize(r, e, i), this.bokehFarFillPass.initialize(r, e, i), this.blurPass.initialize(r, e, scope.UnsignedByteType), r.capabilities.logarithmicDepthBuffer && (this.cocPass.fullscreenMaterial.defines.LOG_DEPTH = "1"), i !== void 0 && (this.renderTarget.texture.type = i, this.renderTargetNear.texture.type = i, this.renderTargetFar.texture.type = i, this.renderTargetMasked.texture.type = i, r !== null && r.outputColorSpace === scope.SRGBColorSpace && (this.renderTarget.texture.colorSpace = scope.SRGBColorSpace, this.renderTargetNear.texture.colorSpace = scope.SRGBColorSpace, this.renderTargetFar.texture.colorSpace = scope.SRGBColorSpace, this.renderTargetMasked.texture.colorSpace = scope.SRGBColorSpace));
  }
};
}
