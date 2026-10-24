/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 283249:284850.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0765(scope) {
scope.ImageBitmapLoader = class ImageBitmapLoader extends scope.Loader$1 {
  constructor(e) {
    super(e), this.isImageBitmapLoader = !0, typeof createImageBitmap > "u" && console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."), typeof fetch > "u" && console.warn("THREE.ImageBitmapLoader: fetch() not supported."), this.options = {
      premultiplyAlpha: "none"
    }, this._abortController = new AbortController();
  }
  setOptions(e) {
    return this.options = e, this;
  }
  load(e, i, s, a) {
    e === void 0 && (e = ""), this.path !== void 0 && (e = this.path + e), e = this.manager.resolveURL(e);
    const o = this,
      l = scope.Cache.get(`image-bitmap:${e}`);
    if (l !== void 0) {
      if (o.manager.itemStart(e), l.then) {
        l.then(d => {
          if (scope._errorMap.has(l) === !0) a && a(scope._errorMap.get(l)), o.manager.itemError(e), o.manager.itemEnd(e);else return i && i(d), o.manager.itemEnd(e), d;
        });
        return;
      }
      return scope.__lifecycle.setTimeout(function () {
        i && i(l), o.manager.itemEnd(e);
      }, 0), l;
    }
    const c = {};
    c.credentials = this.crossOrigin === "anonymous" ? "same-origin" : "include", c.headers = this.requestHeader, c.signal = typeof AbortSignal.any == "function" ? AbortSignal.any([this._abortController.signal, this.manager.abortController.signal]) : this._abortController.signal;
    const h = fetch(e, c).then(function (d) {
      return d.blob();
    }).then(function (d) {
      return createImageBitmap(d, Object.assign(o.options, {
        colorSpaceConversion: "none"
      }));
    }).then(function (d) {
      return scope.Cache.add(`image-bitmap:${e}`, d), i && i(d), o.manager.itemEnd(e), d;
    }).catch(function (d) {
      a && a(d), scope._errorMap.set(h, d), scope.Cache.remove(`image-bitmap:${e}`), o.manager.itemError(e), o.manager.itemEnd(e);
    });
    scope.Cache.add(`image-bitmap:${e}`, h), o.manager.itemStart(e);
  }
  abort() {
    return this._abortController.abort(), this._abortController = new AbortController(), this;
  }
};
}
