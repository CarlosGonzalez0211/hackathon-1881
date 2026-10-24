/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1119830:1123155.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1649(scope) {
scope.EffectPass = class extends scope.Pass {
  constructor(r, ...e) {
    super("EffectPass"), this.fullscreenMaterial = new scope.EffectMaterial(null, null, null, r), this.listener = i => this.handleEvent(i), this.effects = [], this.setEffects(e), this.skipRendering = !1, this.minTime = 1, this.maxTime = Number.POSITIVE_INFINITY, this.timeScale = 1;
  }
  set mainScene(r) {
    for (const e of this.effects) e.mainScene = r;
  }
  set mainCamera(r) {
    this.fullscreenMaterial.copyCameraSettings(r);
    for (const e of this.effects) e.mainCamera = r;
  }
  get encodeOutput() {
    return this.fullscreenMaterial.encodeOutput;
  }
  set encodeOutput(r) {
    this.fullscreenMaterial.encodeOutput = r;
  }
  get dithering() {
    return this.fullscreenMaterial.dithering;
  }
  set dithering(r) {
    const e = this.fullscreenMaterial;
    e.dithering = r, e.needsUpdate = !0;
  }
  setEffects(r) {
    for (const e of this.effects) scope.__lifecycle.unlisten(e, "change", this.listener);
    this.effects = r.sort((e, i) => i.attributes - e.attributes);
    for (const e of this.effects) scope.__lifecycle.listen(e, "change", this.listener);
  }
  updateMaterial() {
    const r = new scope.EffectShaderData();
    let e = 0;
    for (const l of this.effects) if (l.blendMode.blendFunction === scope.BlendFunction.DST) r.attributes |= l.getAttributes() & scope.EffectAttribute.DEPTH;else {
      if ((r.attributes & l.getAttributes() & scope.EffectAttribute.CONVOLUTION) !== 0) throw new Error(`Convolution effects cannot be merged (${l.name})`);
      scope.integrateEffect("e" + e++, l, r);
    }
    let i = r.shaderParts.get(scope.EffectShaderSection.FRAGMENT_HEAD),
      s = r.shaderParts.get(scope.EffectShaderSection.FRAGMENT_MAIN_IMAGE),
      a = r.shaderParts.get(scope.EffectShaderSection.FRAGMENT_MAIN_UV);
    const o = /\bblend\b/g;
    for (const l of r.blendModes.values()) i += l.getShaderCode().replace(o, `blend${l.blendFunction}`) + `
`;
    (r.attributes & scope.EffectAttribute.DEPTH) !== 0 ? (r.readDepth && (s = `float depth = readDepth(UV);

	` + s), this.needsDepthTexture = this.getDepthTexture() === null) : this.needsDepthTexture = !1, r.colorSpace === scope.SRGBColorSpace && (s += `color0 = sRGBToLinear(color0);
	`), r.uvTransformation ? (a = `vec2 transformedUv = vUv;
` + a, r.defines.set("UV", "transformedUv")) : r.defines.set("UV", "vUv"), r.shaderParts.set(scope.EffectShaderSection.FRAGMENT_HEAD, i), r.shaderParts.set(scope.EffectShaderSection.FRAGMENT_MAIN_IMAGE, s), r.shaderParts.set(scope.EffectShaderSection.FRAGMENT_MAIN_UV, a);
    for (const [l, c] of r.shaderParts) c !== null && r.shaderParts.set(l, c.trim().replace(/^#/, `
#`));
    this.skipRendering = e === 0, this.needsSwap = !this.skipRendering, this.fullscreenMaterial.setShaderData(r);
  }
  recompile() {
    this.updateMaterial();
  }
  getDepthTexture() {
    return this.fullscreenMaterial.depthBuffer;
  }
  setDepthTexture(r, e = scope.BasicDepthPacking) {
    this.fullscreenMaterial.depthBuffer = r, this.fullscreenMaterial.depthPacking = e;
    for (const i of this.effects) i.setDepthTexture(r, e);
  }
  render(r, e, i, s, a) {
    for (const o of this.effects) o.update(r, e, s);
    if (!this.skipRendering || this.renderToScreen) {
      const o = this.fullscreenMaterial;
      o.inputBuffer = e.texture, o.time += s * this.timeScale, r.setRenderTarget(this.renderToScreen ? null : i), r.render(this.scene, this.camera);
    }
  }
  setSize(r, e) {
    this.fullscreenMaterial.setSize(r, e);
    for (const i of this.effects) i.setSize(r, e);
  }
  initialize(r, e, i) {
    this.renderer = r;
    for (const s of this.effects) s.initialize(r, e, i);
    this.updateMaterial(), i !== void 0 && i !== scope.UnsignedByteType && (this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1");
  }
  dispose() {
    super.dispose();
    for (const r of this.effects) scope.__lifecycle.unlisten(r, "change", this.listener), r.dispose();
  }
  handleEvent(r) {
    switch (r.type) {
      case "change":
        this.recompile();
        break;
    }
  }
};
}
