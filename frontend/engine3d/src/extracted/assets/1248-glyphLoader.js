/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 750881:753619.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1248(scope) {
scope.glyphLoader = {
  _glyphsBufferCache: new Map(),
  _glyphsTextureCache: new Map(),
  _loadBuffer(r) {
    if (this._glyphsBufferCache.has(r)) return this._glyphsBufferCache.get(r);
    const e = scope.bufferLoader.loadAsync(r).then(i => new Uint8Array(i)).catch(i => (console.error("Glyph buffer loader", i), new Uint8Array(0)));
    return this._glyphsBufferCache.set(r, e), e;
  },
  loadTexture(r, e, i = !0) {
    if (e !== "curve" && e !== "band") throw new Error('Invalid type for glyph texture. Must be either "curve" or "band".');
    const s = `${r}_<>_curve`,
      a = `${r}_<>_band`,
      o = e === "curve" ? s : a;
    if (this._glyphsTextureCache.has(o)) return this._glyphsTextureCache.get(o);
    const l = scope.miscutils.deferred(),
      c = scope.miscutils.deferred();
    return this._glyphsTextureCache.set(s, l), this._glyphsTextureCache.set(a, c), (async () => {
      const h = scope.getFilePath(r),
        d = await this._loadBuffer(h),
        p = await scope.worker.postMessage({
          action: "generateTextures",
          url: h,
          buffer: d
        });
      let f = null,
        _ = null;
      p.error ? (console.warn(p.error), f = new scope.DataTexture(null, 1, 1, scope.RGBAFormat, scope.HalfFloatType), _ = new scope.DataTexture(null, 1, 1, scope.RGIntegerFormat, scope.UnsignedShortType)) : (f = new scope.DataTexture(p.curveTextureData, p.curveTextureSize.width, p.curveTextureSize.height, scope.RGBAFormat, p.curveTextureData.constructor.name === "Uint16Array" ? scope.HalfFloatType : scope.FloatType), _ = new scope.DataTexture(p.bandTextureData, p.bandTextureSize.width, p.bandTextureSize.height, scope.RGIntegerFormat, scope.UnsignedShortType), f.needsUpdate = !0, _.needsUpdate = !0), f._loaded = Promise.resolve(), _._loaded = Promise.resolve(), l.resolve(f), c.resolve(_), i || scope.deleteFromCache$2(h, s, a);
    })(), e === "curve" ? l : c;
  },
  loadGeometry(r, e = {}) {
    return new Promise(async i => {
      const s = scope.getFilePath(r),
        a = await this._loadBuffer(s),
        o = r.endsWith(".font") ? "generateText" : "generatePicture",
        l = await scope.worker.postMessage({
          action: o,
          url: s,
          buffer: a,
          options: e
        }),
        c = new scope.BufferGeometry();
      l.error ? console.warn(l.error) : (c.setIndex(new scope.BufferAttribute(l.index, 1)), c.setAttribute("position", new scope.BufferAttribute(l.position, 3)), c.setAttribute("posnorm", new scope.BufferAttribute(l.posnorm, 2)), c.setAttribute("texcoord", new scope.BufferAttribute(l.texcoord, 4)), c.setAttribute("jacobian", new scope.BufferAttribute(l.jacobian, 4)), c.setAttribute("banding", new scope.BufferAttribute(l.banding, 4)), c.setAttribute("color", new scope.BufferAttribute(l.color, 4)), c.setAttribute("uv", new scope.BufferAttribute(l.uv, 2)), l.fontMetrics && (c._fontMetrics = l.fontMetrics), l.centr && c.setAttribute("centr", new scope.BufferAttribute(l.centr, 3)), l.textWeights && c.setAttribute("textWeights", new scope.BufferAttribute(l.textWeights, 2)), l.lineWeights && c.setAttribute("lineWeights", new scope.BufferAttribute(l.lineWeights, 3)), c.boundingBox = new scope.Box3(), c.boundingBox.min.fromArray(l.boundingBox.min), c.boundingBox.max.fromArray(l.boundingBox.max), c.boundingSphere = new scope.Sphere(), c.boundingSphere.center.fromArray(l.boundingSphere.center), c.boundingSphere.radius = l.boundingSphere.radius), i(c);
    });
  }
};
}
