/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 749865:750499.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1240(scope) {
scope.Pi = new WeakMap(), scope.Qs = new WeakMap(), scope.Li = new WeakMap(), scope.Jr = new WeakMap(), scope.Ws = new WeakMap(), scope.hs = new WeakMap(), scope.Nn = new WeakMap(), scope.Ii = new WeakSet(), scope.vo = function (e) {
  var s;
  const i = e.data.id;
  if (typeof i > "u") throw new Error("workerTask: message must have an id");
  if (delete e.data.id, scope.L(this, scope.Li).has(i)) {
    const a = scope.L(this, scope.Li).get(i);
    scope.L(this, scope.Li).delete(i), a == null || a(e.data);
  }
  (s = scope.L(this, scope.Ws)) == null || s.call(this, e.data), scope.Ee(this, scope.Ii, scope.La).call(this);
}, scope.Pr = function () {
  scope.L(this, scope.Nn) !== null && (scope.__lifecycle.clearTimeout(scope.L(this, scope.Nn)), scope.ze(this, scope.Nn, null));
}, scope.La = function () {
  scope.L(this, scope.Pi) && scope.L(this, scope.hs) < 1 / 0 && scope.L(this, scope.Li).size === 0 && (scope.Ee(this, scope.Ii, scope.Pr).call(this), scope.ze(this, scope.Nn, scope.__lifecycle.setTimeout(() => {
    this.dispose();
  }, scope.L(this, scope.hs) * 1e3)));
};
}
