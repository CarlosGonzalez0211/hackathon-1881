/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 723478:724331.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1196(scope) {
scope.Qr = new WeakMap(), scope.Wr = new WeakMap(), scope.ss = new WeakMap(), scope.rs = new WeakMap(), scope.as = new WeakMap(), scope.os = new WeakMap(), scope.Fs = new WeakMap(), scope.Gt = new WeakSet(), scope.ya = function (e) {
  this.input = e.pointerType === "mouse" ? "mouse" : "touch", this.button = e.button;
}, scope.Br = function (e) {
  const i = e,
    s = i.clientX,
    a = i.clientY;
  this.position.set(s, a), this.position01.set(s / scope.client$1.screen.w, 1 - a / scope.client$1.screen.h), this.position11.copy(this.position01).multiplyScalar(2).subScalar(1);
}, scope.ba = function () {
  scope.L(this, scope.as).copy(this.position), scope.L(this, scope.os).copy(this.position01);
}, scope.Dr = function () {
  this.delta.copy(this.position).sub(scope.L(this, scope.as)), this.delta11.copy(this.position01).sub(scope.L(this, scope.os)), scope.Ee(this, scope.Gt, scope.ba).call(this);
}, scope.oo = function () {
  scope.L(this, scope.ss).copy(this.position), scope.L(this, scope.rs).copy(this.position01);
}, scope.Rr = function () {
  this.dragged.copy(this.position).sub(scope.L(this, scope.ss)), this.dragged11.copy(this.position01).sub(scope.L(this, scope.rs));
}, scope.oe(scope.jn, scope.Qr, 25), scope.oe(scope.jn, scope.Wr, .5);
}
