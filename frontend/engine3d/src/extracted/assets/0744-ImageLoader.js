/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 271313:272418.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0744(scope) {
scope.ImageLoader = class ImageLoader extends scope.Loader$1 {
  constructor(e) {
    super(e);
  }
  load(e, i, s, a) {
    this.path !== void 0 && (e = this.path + e), e = this.manager.resolveURL(e);
    const o = this,
      l = scope.Cache.get(`image:${e}`);
    if (l !== void 0) {
      if (l.complete === !0) o.manager.itemStart(e), scope.__lifecycle.setTimeout(function () {
        i && i(l), o.manager.itemEnd(e);
      }, 0);else {
        let f = scope._loading.get(l);
        f === void 0 && (f = [], scope._loading.set(l, f)), f.push({
          onLoad: i,
          onError: a
        });
      }
      return l;
    }
    const c = scope.createElementNS("img");
    function h() {
      p(), i && i(this);
      const f = scope._loading.get(this) || [];
      for (let _ = 0; _ < f.length; _++) {
        const x = f[_];
        x.onLoad && x.onLoad(this);
      }
      scope._loading.delete(this), o.manager.itemEnd(e);
    }
    function d(f) {
      p(), a && a(f), scope.Cache.remove(`image:${e}`);
      const _ = scope._loading.get(this) || [];
      for (let x = 0; x < _.length; x++) {
        const b = _[x];
        b.onError && b.onError(f);
      }
      scope._loading.delete(this), o.manager.itemError(e), o.manager.itemEnd(e);
    }
    function p() {
      scope.__lifecycle.unlisten(c, "load", h, !1), scope.__lifecycle.unlisten(c, "error", d, !1);
    }
    return scope.__lifecycle.listen(c, "load", h, !1), scope.__lifecycle.listen(c, "error", d, !1), e.slice(0, 5) !== "data:" && this.crossOrigin !== void 0 && (c.crossOrigin = this.crossOrigin), scope.Cache.add(`image:${e}`, c), o.manager.itemStart(e), c.src = e, c;
  }
};
}
