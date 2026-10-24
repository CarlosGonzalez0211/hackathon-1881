/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 893714:894696.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1466(scope) {
scope.Ks = new WeakMap(), scope.ta = new WeakMap(), scope.fs = new WeakMap(), scope.ia = new WeakMap(), scope.na = new WeakMap(), scope.sa = new WeakMap(), scope.ra = new WeakMap(), scope.Js = new WeakMap(), scope.Zs = new WeakMap(), scope.aa = new WeakMap(), scope.Ki = new WeakMap(), scope.kn = new WeakMap(), scope.ps = new WeakMap(), scope.Fi = new WeakMap(), scope.zn = new WeakMap(), scope.hi = new WeakSet(), scope.Na = function (e) {
  if (!(scope.renderInfo.time < scope.L(this, scope.fs)) && scope.client$1.visible && (scope.L(this, scope.Ki).push(e), scope.renderInfo.time - scope.L(this, scope.zn) >= scope.L(this, scope.ia) && scope.L(this, scope.Ki).length >= scope.L(this, scope.na))) {
    const i = scope.L(this, scope.Ki).reduce((s, a) => s + a, 0) / scope.L(this, scope.Ki).length;
    i < scope.L(this, scope.sa) && scope.L(this, scope.Fi) > scope.L(this, scope.Zs) ? (scope.Ee(this, scope.hi, scope.bs).call(this, Math.max(scope.L(this, scope.Zs), scope.L(this, scope.Fi) - scope.L(this, scope.Js))), scope.L(this, scope.kn) === 1 && scope.Mr(this, scope.ps)._++, scope.ze(this, scope.kn, -1)) : i >= scope.L(this, scope.ra) && scope.L(this, scope.Fi) < 1 && (scope.Ee(this, scope.hi, scope.bs).call(this, Math.min(1, scope.L(this, scope.Fi) + scope.L(this, scope.Js))), scope.L(this, scope.kn) === -1 && scope.Mr(this, scope.ps)._++, scope.ze(this, scope.kn, 1)), scope.L(this, scope.Ki).length = 0, scope.ze(this, scope.zn, scope.renderInfo.time), scope.L(this, scope.ps) >= scope.L(this, scope.aa) && (console.warn("Adaptive DPR stopped."), this.stop());
  }
}, scope.bs = function (e = 1) {
  scope.ze(this, scope.Fi, e), scope.L(this, scope.Ks).setDPRMultiplier(e);
}, scope.Oa = function (e = {}) {
  e.adaptiveDPR = scope.L(this, scope.Fi);
};
}
