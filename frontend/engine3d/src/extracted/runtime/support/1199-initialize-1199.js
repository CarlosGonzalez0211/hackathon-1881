/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 726304:727036.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1199(scope) {
scope.Ai = new WeakMap(), scope.Ht = new WeakMap(), scope.vn = new WeakMap(), scope.Wt = new WeakSet(), scope.wa = function () {
  return scope.L(this, scope.Ai).find(e => e.touchID === !1);
}, scope.Sa = function (e) {
  return scope.L(this, scope.Ai).find(i => i.touchID === e.pointerId);
}, scope.lo = function (e) {
  const i = scope.Ee(this, scope.Wt, scope.wa).call(this);
  i && (scope.L(this, scope.vn) && this.getActive().length === 0 && scope.L(this, scope.Ht).setPointerCapture(e.pointerId), i.touchID = e.pointerId, i.onTouchStart(e));
}, scope.co = function (e) {
  var i;
  (i = scope.Ee(this, scope.Wt, scope.Sa).call(this, e) || scope.Ee(this, scope.Wt, scope.wa).call(this)) == null || i.onTouchMove(e);
}, scope.uo = function (e) {
  const i = scope.Ee(this, scope.Wt, scope.Sa).call(this, e);
  i && (i.onTouchEnd(e), i.touchID = !1, scope.L(this, scope.vn) && this.getActive().length === 0 && scope.L(this, scope.Ht).releasePointerCapture(e.pointerId));
}, scope.ho = function (e) {
  this.allowTouchStart || e.preventDefault();
}, scope.fo = function (e) {
  e.preventDefault();
};
}
