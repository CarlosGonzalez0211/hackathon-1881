/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1131361:1133175.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1659(scope) {
scope.MultipleRenderPass = class MultipleRenderPass extends scope.Pass$1 {
  constructor({
    scene: e = null,
    finalMaterials: i = [],
    rtCount: s = 2,
    rtOptions: a = {},
    clearColor: o = null,
    clearAlpha: l = null,
    onBeforeMultiRender: c = null,
    onAfterMultiRender: h = null
  } = {}) {
    if (!e) throw new Error("MultipleRenderPass requires a scene.");
    super(), this.scene = e, this.camera = e.camera, this.clearColor = o, this.clearAlpha = l, this.clear = !0, this.clearDepth = !1, this.needsSwap = !1, this._oldClearColor = new scope.Color(), this._oldClearAlpha = null, this.renderTarget = new scope.WebGLRenderTarget(2, 2, {
      count: s,
      type: scope.HalfFloatType,
      ...a
    }), this.scene.customUploadRT = this.renderTarget.clone(), this.onBeforeMultiRender = c, this.onAfterMultiRender = h, this.finalPasses = i.map(d => new scope.ShaderPass$1(d, "__textureAssignDisabled__"));
  }
  render(e, i, s) {
    const a = e.autoClear;
    e.autoClear = !1, this.clearColor !== null && (e.getClearColor(this._oldClearColor), e.setClearColor(this.clearColor, this.clearAlpha)), this.clearAlpha !== null && (this._oldClearAlpha = e.getClearAlpha(), e.setClearAlpha(this.clearAlpha)), e.setRenderTarget(this.renderTarget), this.clearDepth && e.clearDepth(), this.clear === !0 && e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil), this.onBeforeMultiRender && this.onBeforeMultiRender(), e.render(this.scene, this.camera), this.onAfterMultiRender && this.onAfterMultiRender(), this.clearColor !== null && e.setClearColor(this._oldClearColor, this._oldClearAlpha), this.clearAlpha !== null && e.setClearAlpha(this._oldClearAlpha), e.autoClear = a;
    const o = this.finalPasses.length % 2 === 1;
    let l = o ? s : i,
      c = o ? i : s,
      h = null;
    this.finalPasses.forEach((d, p) => {
      d.uniforms.tDiffuse && (d.uniforms.tDiffuse.value = p === 0 ? this.renderTarget.textures[0] : c.texture), d.clear = p === 0, d.render(e, l), h = c, c = l, l = h;
    });
  }
  setSize(e, i) {
    this.renderTarget.setSize(e, i), this.finalPasses.forEach(s => s.setSize(e, i));
  }
  dispose() {
    this.renderTarget.dispose(), this.finalPasses.forEach(e => e.dispose());
  }
};
}
