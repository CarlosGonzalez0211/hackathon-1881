/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 721016:721789.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1192(scope) {
scope.tn = new WeakSet(), scope.ys = function (e) {
  return Number(e.match(/\d+.?\d*/)[0]);
}, scope.ro = function (e) {
  return e.replace(/^\/+|\/+$/g, "");
}, scope.Hr = new WeakMap(), scope.Wi = new WeakMap(), scope.di = new WeakSet(), scope.Aa = function () {
  const e = Math.max(2, window.innerWidth),
    i = Math.max(2, window.innerHeight);
  this.screen.width = e, this.screen.height = i, this.screen.w = e, this.screen.h = i, this.screen.aspectRatio = e / i, this.iOS && Math.min(window.screen.width, window.screen.height) !== i && (scope.L(this, scope.Hr).scrollTop = -1), scope.events$1.emit("resize", e, i);
}, scope._a = function () {
  this.visible = document.visibilityState === "visible", scope.events$1.emit("visibility_change", this.visible);
}, scope.xa = function () {
  this.focused = document.hasFocus(), scope.events$1.emit("focus_change", this.focused);
}, scope.ao = function (e) {
  this.darkMode = e.matches, scope.events$1.emit("dark_mode_change", this.darkMode);
}, scope.oe(scope.un, scope.tn);
}
