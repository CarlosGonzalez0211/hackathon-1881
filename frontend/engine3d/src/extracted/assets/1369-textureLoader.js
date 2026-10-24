/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 831913:834691.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1369(scope) {
scope.textureLoader = {
  _texturesCache: new Map(),
  load(r = scope.DEFAULT_TEXTURE, e = "default", i = !0) {
    const s = `${r}_<>_${e}`;
    if (this._texturesCache.has(s)) return this._texturesCache.get(s);
    const a = r.split(".").pop(),
      o = e.toLowerCase();
    let l = null,
      c = null;
    a.startsWith("ktx2") ? (l = scope.TEXTURE_FORMATS.KTX2, o.includes("cubemap") ? c = new scope.CompressedCubeTexture() : o.includes("3d") || o.includes("lut") ? c = new scope.Data3DTexture() : o.includes("data") ? c = new scope.DataTexture() : c = new scope.CompressedTexture()) : a.startsWith("exr") ? (l = scope.TEXTURE_FORMATS.EXR, c = new scope.DataTexture()) : a.startsWith("mp4") || a.startsWith("webm") ? (l = scope.TEXTURE_FORMATS.VIDEO, c = new scope.CustomVideoTexture(`${scope.client$1.absolutePath}/assets/athena/${r}`, o.includes("autoplay"))) : (scope.client$1.capabilities.imageBitmap && scope.BITMAP_EXTENSIONS.some(f => a.startsWith(f)) ? l = scope.TEXTURE_FORMATS.BITMAP : l = scope.TEXTURE_FORMATS.IMAGE, c = new scope.Texture()), c._url = r, c._loadMode = e, scope.makeTextureAwaitable(c);
    const d = o.includes("srgb") || r === scope.DEFAULT_TEXTURE ? scope.SRGBColorSpace : c.colorSpace;
    c.colorSpace = d;
    const p = !o.includes("noflip");
    return this._texturesCache.set(s, c), scope.__lifecycle.setTimeout(async () => {
      let f = null;
      try {
        l === scope.TEXTURE_FORMATS.KTX2 ? f = await scope.ktx2Loader.loadAsync(r) : l === scope.TEXTURE_FORMATS.EXR ? f = await scope.exrLoader.loadAsync(r) : l === scope.TEXTURE_FORMATS.VIDEO ? (f = c) && (await c._videoLoadAsync) : l === scope.TEXTURE_FORMATS.BITMAP ? f = await scope.bitmapLoader.loadAsync(r, p) : f = await scope.basicLoader.loadAsync(r);
      } catch (_) {
        console.warn("Texture load:", _, r), l !== scope.TEXTURE_FORMATS.EXR && l !== scope.TEXTURE_FORMATS.VIDEO && !c.isData3DTexture && (c.colorSpace = scope.SRGBColorSpace, l === scope.TEXTURE_FORMATS.KTX2 ? f = await scope.ktx2Loader.loadAsync(scope.DEFAULT_TEXTURE_KTX2) : l === scope.TEXTURE_FORMATS.BITMAP ? f = await scope.bitmapLoader.loadAsync(scope.DEFAULT_TEXTURE) : (l = scope.TEXTURE_FORMATS.IMAGE, f = await scope.basicLoader.loadAsync(scope.DEFAULT_TEXTURE_KTX2)));
      }
      c !== f && (c.dispose(), c.copy(f)), o.includes("repeat") && (o.includes("mirror") ? (c.wrapS = scope.MirroredRepeatWrapping, c.wrapT = scope.MirroredRepeatWrapping) : (c.wrapS = scope.RepeatWrapping, c.wrapT = scope.RepeatWrapping)), o.includes("lut") ? o.includes("luttetrahedral") ? (c.magFilter = scope.NearestFilter, c.minFilter = scope.NearestFilter) : (c.magFilter = scope.LinearFilter, c.minFilter = scope.LinearFilter) : o.includes("data") || o.includes("linearfilter") ? (c.magFilter = scope.LinearFilter, c.minFilter = scope.LinearFilter) : o.includes("nearest") && (c.magFilter = scope.NearestFilter, c.minFilter = scope.NearestFilter), (o.includes("nearest") || o.includes("data") || o.includes("nomipmaps")) && (c.generateMipmaps = !1), o.includes("pmrem") && (o.includes("refraction") ? c.mapping = scope.EquirectangularRefractionMapping : c.mapping = scope.EquirectangularReflectionMapping), c.colorSpace = d, c.needsUpdate = !0, c._loaded.resolve(c), i || scope.deleteFromCache(r, p, s);
    }, 0), c;
  },
  loadCurves(r, e = !1, i = 1, s = !0) {
    const a = `curves_${r}_<>_${e}_<>_${i}`;
    if (this._texturesCache.has(a)) return this._texturesCache.get(a);
    const o = scope.createCurvesTexture(r, e, i);
    return this._texturesCache.set(a, o), o._loaded.then(() => {
      s || this._texturesCache.delete(a);
    }), o;
  }
};
}
