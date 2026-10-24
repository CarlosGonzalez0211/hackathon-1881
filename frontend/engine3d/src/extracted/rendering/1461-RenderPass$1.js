/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 891362:892347.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1461(scope) {
scope.RenderPass$1 = class extends scope.Pass$1 {
  constructor(e, i, s = null, a = null, o = null) {
    super(), this.scene = e, this.camera = i, this.overrideMaterial = s, this.clearColor = a, this.clearAlpha = o, this.clear = !0, this.clearDepth = !1, this.needsSwap = !1, this._oldClearColor = new scope.Color();
  }
  render(e, i, s) {
    const a = e.autoClear;
    e.autoClear = !1;
    let o, l;
    this.overrideMaterial !== null && (l = this.scene.overrideMaterial, this.scene.overrideMaterial = this.overrideMaterial), this.clearColor !== null && (e.getClearColor(this._oldClearColor), e.setClearColor(this.clearColor, e.getClearAlpha())), this.clearAlpha !== null && (o = e.getClearAlpha(), e.setClearAlpha(this.clearAlpha)), this.clearDepth == !0 && e.clearDepth(), e.setRenderTarget(this.renderToScreen ? null : s), this.clear === !0 && e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil), e.render(this.scene, this.camera), this.clearColor !== null && e.setClearColor(this._oldClearColor), this.clearAlpha !== null && e.setClearAlpha(o), this.overrideMaterial !== null && (this.scene.overrideMaterial = l), e.autoClear = a;
  }
};
}
