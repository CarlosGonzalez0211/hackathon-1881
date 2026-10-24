/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 754181:754943.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1253(scope) {
scope.CustomDRACOLoader = class CustomDRACOLoader {
  constructor() {
    scope.oe(this, scope.Zr);
    scope.oe(this, scope.ji, new Map());
    scope.oe(this, scope.qs, new scope.FileLoader().setResponseType("arraybuffer"));
    scope.oe(this, scope.$s, new scope.workerTask().setWorkerCreator(() => new scope.WorkerWrapper$6()));
    scope.oe(this, scope.ds, "");
  }
  setPath(e) {
    scope.ze(this, scope.ds, e), scope.L(this, scope.qs).setPath(scope.L(this, scope.ds));
  }
  loadAsync(e) {
    if (scope.L(this, scope.ji).has(e)) return scope.L(this, scope.ji).get(e);
    const i = new Promise((s, a) => {
      scope.L(this, scope.qs).loadAsync(e).then(o => scope.L(this, scope.$s).postMessage({
        url: `${scope.L(this, scope.ds)}${e}`,
        buffer: o
      }, [o])).then(o => {
        o.error ? a(new Error(`buffer "${e}" could not be decoded.`)) : s(scope.Ee(this, scope.Zr, scope.Ao).call(this, o.geometry));
      }).catch(o => {
        a(new Error(o));
      });
    });
    return scope.L(this, scope.ji).set(e, i), i;
  }
  deleteFromCache(e) {
    scope.L(this, scope.ji).delete(e);
  }
  dispose() {
    scope.L(this, scope.$s).dispose(), scope.L(this, scope.ji).forEach(e => e.then(i => i.dispose())), scope.L(this, scope.ji).clear();
  }
};
}
