/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 749032:749865.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1239(scope) {
scope.workerTask = class workerTask {
  constructor() {
    scope.oe(this, scope.Ii);
    scope.oe(this, scope.Pi, null);
    scope.oe(this, scope.Qs, null);
    scope.oe(this, scope.Li, new Map());
    scope.oe(this, scope.Jr, 0);
    scope.oe(this, scope.Ws, null);
    scope.oe(this, scope.hs, 1 / 0);
    scope.oe(this, scope.Nn, null);
  }
  get pendingTasks() {
    return scope.L(this, scope.Li).size;
  }
  setWorkerCreator(e) {
    return scope.ze(this, scope.Qs, e), this;
  }
  setCallback(e) {
    return scope.ze(this, scope.Ws, e), this;
  }
  setDisposeTimeout(e = 1 / 0) {
    return scope.ze(this, scope.hs, e), scope.Ee(this, scope.Ii, scope.La).call(this), this;
  }
  postMessage(e, i) {
    if (typeof e != "object") throw new Error("workerTask: message must be an object");
    return scope.Ee(this, scope.Ii, scope.Pr).call(this), new Promise(s => {
      const a = scope.Mr(this, scope.Jr)._++;
      scope.L(this, scope.Li).set(a, s), scope.L(this, scope.Pi) || (scope.ze(this, scope.Pi, scope.L(this, scope.Qs).call(this)), scope.__lifecycle.listen(scope.L(this, scope.Pi), "message", scope.Ee(this, scope.Ii, scope.vo).bind(this))), e.id = a, scope.L(this, scope.Pi).postMessage(e, i);
    });
  }
  dispose() {
    var e;
    return scope.Ee(this, scope.Ii, scope.Pr).call(this), (e = scope.L(this, scope.Pi)) == null || e.terminate(), scope.ze(this, scope.Pi, null), scope.L(this, scope.Li).clear(), this;
  }
};
}
