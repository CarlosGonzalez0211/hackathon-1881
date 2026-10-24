/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 727818:728581.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1203(scope) {
scope.ls = new WeakMap(), scope.qi = new WeakMap(), scope.fi = new WeakSet(), scope.po = function () {
  scope.touches$1.allowTouchStart = !0, scope.__lifecycle.listen(document.body, "click", scope.L(this, scope.qi)), scope.events$1.on("touch_end", scope.L(this, scope.qi)), scope.events$1.on("keydown", scope.L(this, scope.qi));
}, scope.Ca = function () {
  scope.touches$1.allowTouchStart = !1, scope.__lifecycle.unlisten(document.body, "click", scope.L(this, scope.qi)), scope.events$1.off("touch_end", scope.L(this, scope.qi)), scope.events$1.off("keydown", scope.L(this, scope.qi));
}, scope.Ea = async function () {
  try {
    if (await this.context.resume(), this.contextStarted) return;
    this.contextStarted = !0, scope.Ee(this, scope.fi, scope.Ca).call(this), this.contextReady.resolve();
  } catch (e) {
    console.log("audio context error:", e);
  }
}, scope.Ta = function (e) {
  this.contextStarted && (scope.__lifecycle.clearTimeout(scope.L(this, scope.ls)), e && !this.isRunning && (scope.client$1.iOS ? scope.ze(this, scope.ls, scope.__lifecycle.setTimeout(() => this.context.resume(), 500)) : this.context.resume()));
};
}
