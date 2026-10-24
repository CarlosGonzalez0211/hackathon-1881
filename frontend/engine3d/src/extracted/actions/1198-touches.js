/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 724381:726304.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1198(scope) {
scope.touches = class touches {
  constructor() {
    scope.oe(this, scope.Wt);
    scope.oe(this, scope.Ai, []);
    scope.oe(this, scope.Ht, null);
    scope.oe(this, scope.vn, !0);
    scope.Ye(this, "allowTouchStart", !1);
    scope.Ye(this, "boundTouchesStart", scope.Ee(this, scope.Wt, scope.lo).bind(this));
    scope.Ye(this, "boundTouchesMove", scope.Ee(this, scope.Wt, scope.co).bind(this));
    scope.Ye(this, "boundTouchesEnd", scope.Ee(this, scope.Wt, scope.uo).bind(this));
    scope.Ye(this, "boundPreventTouchesStart", scope.Ee(this, scope.Wt, scope.ho).bind(this));
    scope.Ye(this, "boundPreventDefault", scope.Ee(this, scope.Wt, scope.fo).bind(this));
  }
  get(e) {
    return scope.L(this, scope.Ai)[e];
  }
  getActive() {
    return scope.L(this, scope.Ai).filter(e => e.touchID !== !1);
  }
  init({
    element: e = window,
    fingers: i = 2,
    contextMenu: s = !1
  } = {}) {
    scope.ze(this, scope.Ht, e), scope.ze(this, scope.vn, scope.L(this, scope.Ht) instanceof HTMLCanvasElement);
    for (let a = 0; a < i; a++) scope.L(this, scope.Ai).push(new scope.touch(a, scope.L(this, scope.Ai)));
    e !== window && (e.style.touchAction = "none", scope.L(this, scope.vn) && (e.style.userSelect = "none")), scope.__lifecycle.listen(scope.L(this, scope.Ht), "pointerdown", this.boundTouchesStart), scope.__lifecycle.listen(scope.L(this, scope.Ht), "pointermove", this.boundTouchesMove), scope.__lifecycle.listen(scope.L(this, scope.Ht), "pointerup", this.boundTouchesEnd), scope.__lifecycle.listen(scope.L(this, scope.Ht), "pointerout", this.boundTouchesEnd), scope.__lifecycle.listen(scope.L(this, scope.Ht), "pointercancel", this.boundTouchesEnd), s || scope.__lifecycle.listen(scope.L(this, scope.Ht), "contextmenu", this.boundPreventDefault), scope.__lifecycle.listen(e, "touchstart", this.boundPreventTouchesStart, {
      passive: !1
    }), scope.__lifecycle.listen(document, "dblclick", this.boundPreventDefault);
  }
  dispose() {
    scope.__lifecycle.unlisten(scope.L(this, scope.Ht), "pointerdown", this.boundTouchesStart), scope.__lifecycle.unlisten(scope.L(this, scope.Ht), "pointermove", this.boundTouchesMove), scope.__lifecycle.unlisten(scope.L(this, scope.Ht), "pointerup", this.boundTouchesEnd), scope.__lifecycle.unlisten(scope.L(this, scope.Ht), "pointerout", this.boundTouchesEnd), scope.__lifecycle.unlisten(scope.L(this, scope.Ht), "pointercancel", this.boundTouchesEnd), scope.__lifecycle.unlisten(scope.L(this, scope.Ht), "contextmenu", this.boundPreventDefault), scope.__lifecycle.unlisten(scope.L(this, scope.Ht), "touchstart", this.boundPreventTouchStart), scope.__lifecycle.unlisten(document, "dblclick", this.boundPreventDefault), scope.L(this, scope.Ai).forEach(e => e.dispose()), scope.L(this, scope.Ai).length = 0, scope.ze(this, scope.Ht, null), scope.ze(this, scope.vn, !0);
  }
};
}
