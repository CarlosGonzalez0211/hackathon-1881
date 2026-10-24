/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 828363:828953.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1355(scope) {
scope.BitmapLoader = class BitmapLoader {
  constructor() {
    scope.oe(this, scope._n, new Map());
    scope.oe(this, scope.Xs, "");
    scope.oe(this, scope.Ys, new scope.workerTask().setWorkerCreator(() => new scope.WorkerWrapper$3()));
  }
  loadAsync(e, i = !0) {
    const s = `${e}-${i}`;
    if (scope.L(this, scope._n).has(s)) return scope.L(this, scope._n).get(s);
    const a = new Promise(async (o, l) => {
      const c = await scope.L(this, scope.Ys).postMessage({
        url: scope.L(this, scope.Xs) + e,
        flipY: i
      });
      c.error ? l(new Error(`fetch for "${e}" responded with 404: Not Found.`)) : o(new scope.Texture(c.bitmap));
    });
    return scope.L(this, scope._n).set(s, a), a;
  }
  setPath(e) {
    scope.ze(this, scope.Xs, e);
  }
  deleteFromCache(e, i = !0) {
    const s = `${e}-${i}`;
    scope.L(this, scope._n).delete(s);
  }
  dispose() {
    scope.L(this, scope.Ys).dispose(), scope.L(this, scope._n).clear();
  }
};
}
