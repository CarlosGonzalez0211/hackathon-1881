/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1125061:1128438.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1655(scope) {
scope.postprocessing = class postprocessing extends scope.Pass$1 {
  constructor() {
    super(), this.isPostprocessingPass = !0, this._effectComposer = new scope.EffectComposer(scope.webglRenderer.webgl, {
      frameBufferType: scope.HalfFloatType
    }), this._effectComposer.inputBuffer.dispose(), this._effectComposer.outputBuffer.dispose(), this._effectComposer.inputBuffer = scope.dummyRT, this._effectComposer.outputBuffer = scope.dummyRT, this._effectComposer.autoRenderToScreen = !1;
  }
  setSize(e, i) {
    for (const s of this._effectComposer.passes) s.setSize(e, i);
  }
  render(e, i, s, a) {
    this._effectComposer.inputBuffer = s, this._effectComposer.outputBuffer = i, this._effectComposer.render(a);
  }
  addGammaCorrection() {
    const e = new scope.EffectPass(scope.effectCamera);
    return e.renderToScreen = !0, e.fullscreenMaterial.encodeOutput = !0, this._effectComposer.addPass(e), this;
  }
  addFXAA() {
    const e = new scope.EffectPass(scope.effectCamera, new scope.FXAAEffect());
    return e.renderToScreen = !0, e.fullscreenMaterial.encodeOutput = !0, this._effectComposer.addPass(e), this;
  }
  addSMAA(e = {}) {
    var s;
    const i = new scope.EffectPass(scope.effectCamera, new scope.SMAAEffect({
      preset: scope.SMAAPreset[((s = e.quality) == null ? void 0 : s.toUpperCase()) || "HIGH"]
    }));
    return i.renderToScreen = !0, i.fullscreenMaterial.encodeOutput = !0, this._effectComposer.addPass(i), this;
  }
  addKawaseBlur(e = {}) {
    const i = new scope.KawaseBlurPass(e);
    return i.blurMaterial.kernelSize = typeof e.kernelSize == "number" ? e.kernelSize : scope.KernelSize.MEDIUM, this._effectComposer.addPass(i), e.debug && scope.gui$1.add(i, "🌫️ Kawase Blur"), this;
  }
  addGaussianBlur(e = {}) {
    const i = new scope.GaussianBlurPass(e);
    return this._effectComposer.addPass(i), e.debug && scope.gui$1.add(i, "🌫️ Gaussian Blur"), this;
  }
  addBloom(e = {}) {
    const i = new scope.EffectPass(scope.effectCamera, new scope.BloomEffect({
      ...e,
      mipmapBlur: !0
    }));
    return i.fullscreenMaterial.encodeOutput = !1, this._effectComposer.addPass(i), e.debug && scope.gui$1.add(i, "✨ Bloom"), this;
  }
  addToneMapping(e = {}) {
    const i = new scope.EffectPass(scope.effectCamera, new scope.ToneMappingEffect({
      ...e
    }));
    return this._effectComposer.addPass(i), this;
  }
  addSelectiveBloom({
    scene: e,
    objects: i,
    sceneDepthTexture: s,
    options: a = {}
  } = {}) {
    if (!e || !i || !s) throw new Error("Selective Bloom requires scene, objects and depth texture.");
    const o = new scope.SelectiveBloomEffect(e, e.camera, {
      ...a,
      mipmapBlur: !0
    });
    o.selection.set(i.length ? i : [i]);
    const l = new scope.EffectPass(scope.effectCamera, o);
    return l.needsDepthTexture = !1, l.setDepthTexture(s), l.fullscreenMaterial.encodeOutput = !1, this._effectComposer.addPass(l), a.debug && scope.gui$1.add(l, "✨ Selective Bloom"), this;
  }
  addGodRays({
    camera: e,
    lightSource: i,
    sceneDepthTexture: s,
    options: a = {}
  } = {}) {
    if (!e || !i || !s) throw new Error("Godrays requires scene camera, light source and depth texture.");
    const o = new scope.EffectPass(e, new scope.GodRaysEffect(e, i, {
      kernelSize: scope.KernelSize.SMALL,
      ...a
    }));
    return o.needsDepthTexture = !1, o.setDepthTexture(s), o.effects[0].blurPass.kernelSize = a.kernelSize || scope.KernelSize.SMALL, o.fullscreenMaterial.encodeOutput = !1, this._effectComposer.addPass(o), a.debug && scope.gui$1.add(o, "⛅ Godrays"), this;
  }
  addDOF(e, i, s = {}) {
    if (!e || !i) throw new Error("DOF requires scene camera and depth texture.");
    const a = new scope.EffectPass(e, new scope.DepthOfFieldEffect(e, {
      resolutionScale: .5,
      worldFocusDistance: 4,
      worldFocusRange: 10,
      bokehScale: 5,
      ...s
    }));
    return s.cameraTarget && (a.effects[0].target = e.target), a.needsDepthTexture = !1, a.setDepthTexture(i), a.fullscreenMaterial.encodeOutput = !1, this._effectComposer.addPass(a), s.debug && scope.gui$1.add(a, "👁️ DOF"), this;
  }
  dispose() {
    const e = {
      depthTexture: null,
      dispose: () => {}
    };
    this._effectComposer.inputBuffer = e, this._effectComposer.outputBuffer = e, this._effectComposer.dispose();
  }
};
}
