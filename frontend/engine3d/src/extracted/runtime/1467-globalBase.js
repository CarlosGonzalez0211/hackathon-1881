/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 894706:896128.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1467(scope) {
scope.globalBase = class globalBase {
  constructor() {
    scope.oe(this, scope.oa);
    scope.Ye(this, "canvasCnt", null);
    scope.Ye(this, "canvasNode", null);
    scope.Ye(this, "interactionNode", null);
    scope.Ye(this, "contextMenu", !1);
    scope.Ye(this, "fingers", 1);
    scope.Ye(this, "baseDPR", 1);
    scope.Ye(this, "currentDPR", 1);
    scope.Ye(this, "adaptiveDPR", null);
    scope.Ye(this, "audioContext", scope.audiocontext);
  }
  init({
    canvasCnt: e,
    relativePath: i,
    interactionNode: s,
    fingers: a = 1,
    contextMenu: o = !1,
    DPR: l = 1,
    adaptiveDPR: c = !0
  } = {}) {
    var h;
    scope.Ee(this, scope.oa, scope.bo).call(this, i), this.canvasCnt = e, this.baseDPR = l, this.adaptiveDPR = c ? new scope.adaptiveDPR(this) : null, this.currentDPR = this.baseDPR * (((h = this.adaptiveDPR) == null ? void 0 : h.multiplier) || 1), this.fingers = a, this.interactionNode = s, this.contextMenu = o, this.audioContext.init();
  }
  setDPRMultiplier(e = 1) {
    this.currentDPR = this.baseDPR * e, scope.events$1.emit("resize", scope.client$1.screen.w, scope.client$1.screen.h);
  }
  initInteraction() {
    scope.touches$1.init({
      element: this.interactionNode,
      fingers: this.fingers,
      contextMenu: this.contextMenu
    }), scope.wheel$1.init({
      element: this.interactionNode
    }), scope.gamepad$1.init(), scope.keys$1.init();
  }
  setDevScene(e) {}
  setRenderScene(e) {}
  dispose({
    audios: e = !0,
    fonts: i = !0,
    geometries: s = !0,
    textures: a = !0,
    gltf: o = !0,
    input: l = !1,
    renderer: c = !1,
    audioContext: h = !1
  } = {}) {
    var d;
    e && scope.disposeAudioBuffers(), i && scope.disposeGlyphs(), s && scope.disposeGeometries(), a && scope.disposeTextures(), o && scope.disposeGLTF(), c && ((d = this.adaptiveDPR) == null || d.stop()), h && this.audioContext.dispose(), l && (scope.touches$1.dispose(), scope.wheel$1.dispose(), scope.keys$1.dispose(), scope.gamepad$1.dispose(), this.interactionNode = null);
  }
};
}
