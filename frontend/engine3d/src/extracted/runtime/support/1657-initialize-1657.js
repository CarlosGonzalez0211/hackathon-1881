/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1129588:1131330.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1657(scope) {
scope.Vt = new WeakSet(), scope.wo = function ({
  shadowMap: i,
  shadowMapType: s
} = {}) {
  this.renderer.init({
    shadowMap: i,
    shadowMapType: s
  }), this.renderer.info.autoReset = !1;
  {
    const a = document.createElement("div");
    a.attachShadow({
      mode: "open"
    }).append(this.renderer.domElement), this.canvasNode = a;
  }
  this.canvasCnt.prepend(this.canvasNode), this.interactionNode || (this.interactionNode = this.renderer.domElement), scope.ktx2Loader.detectSupport(this.renderer.webgl);
}, scope.So = function () {
  scope.Ee(this, scope.Vt, scope.Lr).call(this, scope.client$1.screen.w, scope.client$1.screen.h), scope.events$1.on("resize", scope.Ee(this, scope.Vt, scope.Lr), this), scope.events$1.on("prerender", scope.Ee(this, scope.Vt, scope.za), this), scope.events$1.on("render", scope.Ee(this, scope.Vt, scope.Ga), this), scope.events$1.on("render_active", scope.Ee(this, scope.Vt, scope.Ur), this);
}, scope.Lr = function (i, s) {
  scope.uniforms$1.resolution.value.set(i, s).multiplyScalar(this.currentDPR).floor(), scope.uniforms$1.aspect.value = scope.uniforms$1.resolution.value.x / scope.uniforms$1.resolution.value.y, scope.uniforms$1.resolutionUI.value.set(i, s), this.renderer.webgl.setSize(scope.uniforms$1.resolution.value.x, scope.uniforms$1.resolution.value.y, !1), this.renderer.domElement.style.width = `${i}px`, this.renderer.domElement.style.height = `${s}px`;
}, scope.za = function (i) {
  scope.uniforms$1.time.value = i, scope.uniforms$1.dtRatio.value = scope.math.deltaRatio();
}, scope.Ga = function (i, s) {
  var a, o;
  this.renderer.active && ((a = this.renderer.info) == null || a.reset(), (o = this.composer) == null || o.render(s));
}, scope.Ur = function (i) {
  i && this.adaptiveDPR && !this.adaptiveDPR.hasRun && this.adaptiveDPR.start(), this.renderer.active = i;
}, scope.Co = function () {
  this.composer = new scope.effectComposerExtended({
    renderToScreen: !0
  });
  const i = new scope.scene();
  this.renderPass = new scope.RenderPass$1(i, i.camera, void 0, this.renderer.clearColor, this.renderer.clearAlpha), this.composer.addPass(this.renderPass);
  const s = new scope.postprocessing().addSMAA({
    quality: "high"
  });
  s.isGammaCorrectionPass = !0, this.composer.addPass(s);
};
}
