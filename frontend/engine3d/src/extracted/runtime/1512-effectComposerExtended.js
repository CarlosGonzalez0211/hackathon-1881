/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 921300:922359.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1512(scope) {
scope.effectComposerExtended = class effectComposerExtended extends scope.EffectComposer$1 {
  constructor({
    renderer: e = scope.webglRenderer.webgl,
    renderTarget: i = void 0,
    autoResize: s = !0,
    renderToScreen: a = !1,
    depthTexture: o = !1,
    scene: l = null
  } = {}) {
    super(e, i), this.renderToScreen = a, o && (this.writeBuffer.depthTexture = new scope.DepthTexture(), this.readBuffer.depthTexture = new scope.DepthTexture()), scope.webglRenderer.webgl.initRenderTarget(this.writeBuffer), scope.webglRenderer.webgl.initRenderTarget(this.readBuffer), s && (this._autoResize(), scope.events$1.on("resize", this._autoResize, this)), l != null && l.camera && (this.addPass(new scope.RenderPass$1(l, l.camera)), l.composer = this);
  }
  _autoResize() {
    this.setSize(scope.uniforms$1.resolution.value.x, scope.uniforms$1.resolution.value.y);
  }
  addPass(e) {
    var i;
    super.addPass(e), (i = e.scene) != null && i.camera && (e.scene.composer = this), this.passes.sort((s, a) => {
      const o = [s, a].map(l => l.isGammaCorrectionPass ? 1 : 0);
      return o[0] - o[1];
    });
  }
  dispose() {
    scope.events$1.off("resize", this._autoResize, this), this.passes.forEach(e => {
      var i, s, a;
      (s = (i = e.scene) == null ? void 0 : i.dispose) == null || s.call(i), (a = e.dispose) == null || a.call(e);
    }), this.passes = [], super.dispose();
  }
};
}
