/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1000105:1001915.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1614(scope) {
scope.RenderPass = class extends scope.Pass {
  constructor(r, e, i = null) {
    super("RenderPass", r, e), this.needsSwap = !1, this.clearPass = new scope.ClearPass(), this.overrideMaterialManager = i === null ? null : new scope.OverrideMaterialManager(i), this.ignoreBackground = !1, this.skipShadowMapUpdate = !1, this.selection = null;
  }
  set mainScene(r) {
    this.scene = r;
  }
  set mainCamera(r) {
    this.camera = r;
  }
  get renderToScreen() {
    return super.renderToScreen;
  }
  set renderToScreen(r) {
    super.renderToScreen = r, this.clearPass.renderToScreen = r;
  }
  get overrideMaterial() {
    const r = this.overrideMaterialManager;
    return r !== null ? r.material : null;
  }
  set overrideMaterial(r) {
    const e = this.overrideMaterialManager;
    r !== null ? e !== null ? e.setMaterial(r) : this.overrideMaterialManager = new scope.OverrideMaterialManager(r) : e !== null && (e.dispose(), this.overrideMaterialManager = null);
  }
  getOverrideMaterial() {
    return this.overrideMaterial;
  }
  setOverrideMaterial(r) {
    this.overrideMaterial = r;
  }
  get clear() {
    return this.clearPass.enabled;
  }
  set clear(r) {
    this.clearPass.enabled = r;
  }
  getSelection() {
    return this.selection;
  }
  setSelection(r) {
    this.selection = r;
  }
  isBackgroundDisabled() {
    return this.ignoreBackground;
  }
  setBackgroundDisabled(r) {
    this.ignoreBackground = r;
  }
  isShadowMapDisabled() {
    return this.skipShadowMapUpdate;
  }
  setShadowMapDisabled(r) {
    this.skipShadowMapUpdate = r;
  }
  getClearPass() {
    return this.clearPass;
  }
  render(r, e, i, s, a) {
    const o = this.scene,
      l = this.camera,
      c = this.selection,
      h = l.layers.mask,
      d = o.background,
      p = r.shadowMap.autoUpdate,
      f = this.renderToScreen ? null : e;
    c !== null && l.layers.set(c.getLayer()), this.skipShadowMapUpdate && (r.shadowMap.autoUpdate = !1), (this.ignoreBackground || this.clearPass.overrideClearColor !== null) && (o.background = null), this.clearPass.enabled && this.clearPass.render(r, e), r.setRenderTarget(f), this.overrideMaterialManager !== null ? this.overrideMaterialManager.render(r, o, l) : r.render(o, l), l.layers.mask = h, o.background = d, r.shadowMap.autoUpdate = p;
  }
};
}
