/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 737327:737775.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1219(scope) {
scope.$r = new WeakMap(), scope.us = new WeakMap(), scope.An = new WeakMap(), scope.ks = new WeakMap(), scope.zs = new WeakMap(), scope.Gs = new WeakMap(), scope.Xr = new WeakSet(), scope.go = function (e) {
  scope.L(this, scope.ks) && (e.preventDefault(), e.stopPropagation()), this.isPinching = e.ctrlKey, scope.L(this, scope.us).set(e.deltaX, e.deltaY), scope.L(this, scope.zs) && e.deltaMode === 1 && scope.L(this, scope.us).multiplyScalar(scope.L(scope.Yr, scope.$r)), this.position.add(scope.L(this, scope.us)), this.delta.copy(this.position).sub(scope.L(this, scope.Gs)), scope.L(this, scope.Gs).copy(this.position), scope.events$1.emit("wheel", this);
}, scope.oe(scope.Yr, scope.$r, 33);
}
