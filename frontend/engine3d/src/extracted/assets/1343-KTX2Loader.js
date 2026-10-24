/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 813327:818365.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1343(scope) {
scope.KTX2Loader = class KTX2Loader extends scope.Loader$1 {
  constructor(e) {
    super(e), this.transcoderPath = "", this.transcoderBinary = null, this.transcoderPending = null, this.workerPool = new scope.WorkerPool(), this.workerSourceURL = "", this.workerConfig = null, typeof MSC_TRANSCODER < "u" && console.warn('THREE.KTX2Loader: Please update to latest "basis_transcoder". "msc_basis_transcoder" is no longer supported in three.js r125+.');
  }
  setTranscoderPath(e) {
    return this.transcoderPath = e, this;
  }
  setWorkerLimit(e) {
    return this.workerPool.setWorkerLimit(e), this;
  }
  async detectSupportAsync(e) {
    return this.workerConfig = {
      astcSupported: await e.hasFeatureAsync("texture-compression-astc"),
      astcHDRSupported: !1,
      etc1Supported: await e.hasFeatureAsync("texture-compression-etc2"),
      etc2Supported: await e.hasFeatureAsync("texture-compression-etc2"),
      dxtSupported: await e.hasFeatureAsync("texture-compression-bc"),
      bptcSupported: await e.hasFeatureAsync("texture-compression-bc"),
      pvrtcSupported: await e.hasFeatureAsync("texture-compression-pvrtc")
    }, this;
  }
  detectSupport(e) {
    return e.isWebGPURenderer === !0 ? this.workerConfig = {
      astcSupported: e.hasFeature("texture-compression-astc"),
      astcHDRSupported: !1,
      etc1Supported: e.hasFeature("texture-compression-etc2"),
      etc2Supported: e.hasFeature("texture-compression-etc2"),
      dxtSupported: e.hasFeature("texture-compression-bc"),
      bptcSupported: e.hasFeature("texture-compression-bc"),
      pvrtcSupported: e.hasFeature("texture-compression-pvrtc")
    } : this.workerConfig = {
      astcSupported: e.extensions.has("WEBGL_compressed_texture_astc"),
      astcHDRSupported: e.extensions.has("WEBGL_compressed_texture_astc") && e.extensions.get("WEBGL_compressed_texture_astc").getSupportedProfiles().includes("hdr"),
      etc1Supported: e.extensions.has("WEBGL_compressed_texture_etc1"),
      etc2Supported: e.extensions.has("WEBGL_compressed_texture_etc"),
      dxtSupported: e.extensions.has("WEBGL_compressed_texture_s3tc"),
      bptcSupported: e.extensions.has("EXT_texture_compression_bptc"),
      pvrtcSupported: e.extensions.has("WEBGL_compressed_texture_pvrtc") || e.extensions.has("WEBKIT_WEBGL_compressed_texture_pvrtc")
    }, this;
  }
  init() {
    if (!this.transcoderPending) {
      const e = new scope.FileLoader(this.manager);
      e.setPath(this.transcoderPath), e.setWithCredentials(this.withCredentials);
      const i = e.loadAsync("basis_transcoder.js"),
        s = new scope.FileLoader(this.manager);
      s.setPath(this.transcoderPath), s.setResponseType("arraybuffer"), s.setWithCredentials(this.withCredentials);
      const a = s.loadAsync("basis_transcoder.wasm");
      this.transcoderPending = Promise.all([i, a]).then(([o, l]) => {
        const c = scope.KTX2Loader.BasisWorker.toString(),
          h = ["/* constants */", "let _EngineFormat = " + JSON.stringify(scope.KTX2Loader.EngineFormat), "let _EngineType = " + JSON.stringify(scope.KTX2Loader.EngineType), "let _TranscoderFormat = " + JSON.stringify(scope.KTX2Loader.TranscoderFormat), "let _BasisFormat = " + JSON.stringify(scope.KTX2Loader.BasisFormat), "/* basis_transcoder.js */", o, "/* worker */", c.substring(c.indexOf("{") + 1, c.lastIndexOf("}"))].join(`
`);
        this.workerSourceURL = URL.createObjectURL(new Blob([h])), this.transcoderBinary = l, this.workerPool.setWorkerCreator(() => {
          const d = scope.__lifecycle.trackWorker(new Worker(this.workerSourceURL)),
            p = this.transcoderBinary.slice(0);
          return d.postMessage({
            type: "init",
            config: this.workerConfig,
            transcoderBinary: p
          }, [p]), d;
        });
      }), scope._activeLoaders > 0 && console.warn("THREE.KTX2Loader: Multiple active KTX2 loaders may cause performance issues. Use a single KTX2Loader instance, or call .dispose() on old instances."), scope._activeLoaders++;
    }
    return this.transcoderPending;
  }
  load(e, i, s, a) {
    if (this.workerConfig === null) throw new Error("THREE.KTX2Loader: Missing initialization with `.detectSupport( renderer )`.");
    const o = new scope.FileLoader(this.manager);
    o.setPath(this.path), o.setCrossOrigin(this.crossOrigin), o.setWithCredentials(this.withCredentials), o.setResponseType("arraybuffer"), o.load(e, l => {
      this.parse(l, i, a);
    }, s, a);
  }
  parse(e, i, s) {
    if (this.workerConfig === null) throw new Error("THREE.KTX2Loader: Missing initialization with `.detectSupport( renderer )`.");
    if (scope._taskCache.has(e)) return scope._taskCache.get(e).promise.then(i).catch(s);
    this._createTexture(e).then(a => i ? i(a) : null).catch(s);
  }
  _createTextureFrom(e, i) {
    const {
      type: s,
      error: a,
      data: {
        faces: o,
        width: l,
        height: c,
        format: h,
        type: d,
        dfdFlags: p
      }
    } = e;
    if (s === "error") return Promise.reject(a);
    let f;
    if (i.faceCount === 6) f = new scope.CompressedCubeTexture(o, h, d);else {
      const _ = o[0].mipmaps;
      f = i.layerCount > 1 ? new scope.CompressedArrayTexture(_, l, c, i.layerCount, h, d) : new scope.CompressedTexture(_, l, c, h, d);
    }
    return f.minFilter = o[0].mipmaps.length === 1 ? scope.LinearFilter : scope.LinearMipmapLinearFilter, f.magFilter = scope.LinearFilter, f.generateMipmaps = !1, f.needsUpdate = !0, f.colorSpace = scope.parseColorSpace(i), f.premultiplyAlpha = !!(p & scope.u), f;
  }
  async _createTexture(e, i = {}) {
    const s = scope.Mi(new Uint8Array(e)),
      a = s.vkFormat === scope._i && s.dataFormatDescriptor[0].colorModel === 167;
    if (!(s.vkFormat === scope.it || a && !this.workerConfig.astcHDRSupported)) return scope.createRawTexture(s);
    const l = i,
      c = this.init().then(() => this.workerPool.postMessage({
        type: "transcode",
        buffer: e,
        taskConfig: l
      }, [e])).then(h => this._createTextureFrom(h.data, s));
    return scope._taskCache.set(e, {
      promise: c
    }), c;
  }
  dispose() {
    this.workerPool.dispose(), this.workerSourceURL && URL.revokeObjectURL(this.workerSourceURL), scope._activeLoaders--;
  }
};
}
