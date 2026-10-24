/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1128466:1129588.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1656(scope) {
scope.globalWebGL = class globalWebGL extends scope.globalBase {
  constructor() {
    super(...arguments);
    scope.oe(this, scope.Vt);
    scope.Ye(this, "renderer", scope.webglRenderer);
    scope.Ye(this, "uniforms", scope.uniforms$1);
    scope.Ye(this, "UBO", scope.UBO);
    scope.Ye(this, "composer", null);
    scope.Ye(this, "renderPass", null);
  }
  async init(i = {}) {
    super.init(i), await scope.gui$1.init();
    const {
      shadowMap: s,
      shadowMapType: a
    } = i;
    scope.Ee(this, scope.Vt, scope.wo).call(this, {
      shadowMap: s,
      shadowMapType: a
    }), scope.client$1.query.renderinfo !== null && scope.gui$1.showRenderInfo(this.canvasCnt), scope.Ee(this, scope.Vt, scope.So).call(this), this.initInteraction(), scope.Ee(this, scope.Vt, scope.Co).call(this);
  }
  setDevScene(i) {
    this.setRenderScene(i), scope.Ee(this, scope.Vt, scope.Ur).call(this, !0);
  }
  setRenderScene(i) {
    this.renderPass.scene = i, this.renderPass.camera = i.camera, i.composer = this.composer;
  }
  dispose(i = {}) {
    i.renderer && (scope.gui$1.hideRenderInfo(), this.renderer.active = !1, scope.events$1.off("resize", scope.Ee(this, scope.Vt, scope.Lr), this), scope.events$1.off("prerender", scope.Ee(this, scope.Vt, scope.za), this), scope.events$1.off("render", scope.Ee(this, scope.Vt, scope.Ga), this), scope.events$1.off("render_active", scope.Ee(this, scope.Vt, scope.Ur), this), this.composer.dispose(), this.composer = null, this.renderPass = null, this.canvasCnt.removeChild(this.canvasNode), this.canvasCnt = null, this.canvasNode = null, this.renderer.dispose()), super.dispose(i);
  }
};
}
