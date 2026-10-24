/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 736770:737326.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1218(scope) {
scope.Yr = class Yr {
  constructor() {
    scope.oe(this, scope.Xr);
    scope.oe(this, scope.us, new scope.Vector2());
    scope.oe(this, scope.An, null);
    scope.oe(this, scope.ks, !0);
    scope.oe(this, scope.zs, !1);
    scope.oe(this, scope.Gs, new scope.Vector2());
    scope.Ye(this, "boundWheel", scope.Ee(this, scope.Xr, scope.go).bind(this));
    scope.Ye(this, "position", new scope.Vector2());
    scope.Ye(this, "delta", new scope.Vector2());
    scope.Ye(this, "isPinching", !1);
  }
  init({
    element: e = window
  } = {}) {
    scope.ze(this, scope.An, e), scope.ze(this, scope.ks, scope.L(this, scope.An) instanceof HTMLCanvasElement), scope.ze(this, scope.zs, scope.client$1.browser.name === "firefox"), scope.__lifecycle.listen(scope.L(this, scope.An), "wheel", this.boundWheel, {
      passive: !1
    });
  }
  dispose() {
    scope.__lifecycle.unlisten(scope.L(this, scope.An), "wheel", this.boundWheel), scope.ze(this, scope.An, null);
  }
};
}
