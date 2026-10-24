/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 924029:925366.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1517(scope) {
scope.Pass = class ka {
  static get fullscreenGeometry() {
    return scope.fullscreenGeometry;
  }
  constructor(e = "Pass", i = new scope.Scene(), s = new scope.Camera()) {
    this.name = e, this.renderer = null, this.scene = i, this.camera = s, this.screen = null, this.rtt = !0, this.needsSwap = !0, this.needsDepthTexture = !1, this.enabled = !0;
  }
  get renderToScreen() {
    return !this.rtt;
  }
  set renderToScreen(e) {
    if (this.rtt === e) {
      const i = this.fullscreenMaterial;
      i !== null && (i.needsUpdate = !0), this.rtt = !e;
    }
  }
  set mainScene(e) {}
  set mainCamera(e) {}
  setRenderer(e) {
    this.renderer = e;
  }
  isEnabled() {
    return this.enabled;
  }
  setEnabled(e) {
    this.enabled = e;
  }
  get fullscreenMaterial() {
    return this.screen !== null ? this.screen.material : null;
  }
  set fullscreenMaterial(e) {
    let i = this.screen;
    i !== null ? i.material = e : (i = new scope.Mesh(ka.fullscreenGeometry, e), i.frustumCulled = !1, this.scene === null && (this.scene = new scope.Scene()), this.scene.add(i), this.screen = i);
  }
  getFullscreenMaterial() {
    return this.fullscreenMaterial;
  }
  setFullscreenMaterial(e) {
    this.fullscreenMaterial = e;
  }
  getDepthTexture() {
    return null;
  }
  setDepthTexture(e, i = scope.BasicDepthPacking) {}
  render(e, i, s, a, o) {
    throw new Error("Render method not implemented!");
  }
  setSize(e, i) {}
  initialize(e, i, s) {}
  dispose() {
    for (const e of Object.keys(this)) {
      const i = this[e];
      (i instanceof scope.WebGLRenderTarget || i instanceof scope.Material || i instanceof scope.Texture || i instanceof ka) && this[e].dispose();
    }
    this.fullscreenMaterial !== null && this.fullscreenMaterial.dispose();
  }
};
}
