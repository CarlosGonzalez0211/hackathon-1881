/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 267050:267987.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0736(scope) {
scope.LoadingManager = class LoadingManager {
  constructor(e, i, s) {
    const a = this;
    let o = !1,
      l = 0,
      c = 0,
      h;
    const d = [];
    this.onStart = void 0, this.onLoad = e, this.onProgress = i, this.onError = s, this.abortController = new AbortController(), this.itemStart = function (p) {
      c++, o === !1 && a.onStart !== void 0 && a.onStart(p, l, c), o = !0;
    }, this.itemEnd = function (p) {
      l++, a.onProgress !== void 0 && a.onProgress(p, l, c), l === c && (o = !1, a.onLoad !== void 0 && a.onLoad());
    }, this.itemError = function (p) {
      a.onError !== void 0 && a.onError(p);
    }, this.resolveURL = function (p) {
      return h ? h(p) : p;
    }, this.setURLModifier = function (p) {
      return h = p, this;
    }, this.addHandler = function (p, f) {
      return d.push(p, f), this;
    }, this.removeHandler = function (p) {
      const f = d.indexOf(p);
      return f !== -1 && d.splice(f, 2), this;
    }, this.getHandler = function (p) {
      for (let f = 0, _ = d.length; f < _; f += 2) {
        const x = d[f],
          b = d[f + 1];
        if (x.global && (x.lastIndex = 0), x.test(p)) return b;
      }
      return null;
    }, this.abort = function () {
      return this.abortController.abort(), this.abortController = new AbortController(), this;
    };
  }
};
}
