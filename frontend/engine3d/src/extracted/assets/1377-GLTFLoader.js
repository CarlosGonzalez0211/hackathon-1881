/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 840523:844510.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1377(scope) {
scope.GLTFLoader = class GLTFLoader extends scope.Loader$1 {
  constructor(e) {
    super(e), this.dracoLoader = null, this.ktx2Loader = null, this.meshoptDecoder = null, this.pluginCallbacks = [], this.register(function (i) {
      return new scope.GLTFMaterialsClearcoatExtension(i);
    }), this.register(function (i) {
      return new scope.GLTFMaterialsDispersionExtension(i);
    }), this.register(function (i) {
      return new scope.GLTFTextureBasisUExtension(i);
    }), this.register(function (i) {
      return new scope.GLTFTextureWebPExtension(i);
    }), this.register(function (i) {
      return new scope.GLTFTextureAVIFExtension(i);
    }), this.register(function (i) {
      return new scope.GLTFMaterialsSheenExtension(i);
    }), this.register(function (i) {
      return new scope.GLTFMaterialsTransmissionExtension(i);
    }), this.register(function (i) {
      return new scope.GLTFMaterialsVolumeExtension(i);
    }), this.register(function (i) {
      return new scope.GLTFMaterialsIorExtension(i);
    }), this.register(function (i) {
      return new scope.GLTFMaterialsEmissiveStrengthExtension(i);
    }), this.register(function (i) {
      return new scope.GLTFMaterialsSpecularExtension(i);
    }), this.register(function (i) {
      return new scope.GLTFMaterialsIridescenceExtension(i);
    }), this.register(function (i) {
      return new scope.GLTFMaterialsAnisotropyExtension(i);
    }), this.register(function (i) {
      return new scope.GLTFMaterialsBumpExtension(i);
    }), this.register(function (i) {
      return new scope.GLTFLightsExtension(i);
    }), this.register(function (i) {
      return new scope.GLTFMeshoptCompression(i);
    }), this.register(function (i) {
      return new scope.GLTFMeshGpuInstancing(i);
    });
  }
  load(e, i, s, a) {
    const o = this;
    let l;
    if (this.resourcePath !== "") l = this.resourcePath;else if (this.path !== "") {
      const d = scope.LoaderUtils.extractUrlBase(e);
      l = scope.LoaderUtils.resolveURL(d, this.path);
    } else l = scope.LoaderUtils.extractUrlBase(e);
    this.manager.itemStart(e);
    const c = function (d) {
        a ? a(d) : console.error(d), o.manager.itemError(e), o.manager.itemEnd(e);
      },
      h = new scope.FileLoader(this.manager);
    h.setPath(this.path), h.setResponseType("arraybuffer"), h.setRequestHeader(this.requestHeader), h.setWithCredentials(this.withCredentials), h.load(e, function (d) {
      try {
        o.parse(d, l, function (p) {
          i(p), o.manager.itemEnd(e);
        }, c);
      } catch (p) {
        c(p);
      }
    }, s, c);
  }
  setDRACOLoader(e) {
    return this.dracoLoader = e, this;
  }
  setKTX2Loader(e) {
    return this.ktx2Loader = e, this;
  }
  setMeshoptDecoder(e) {
    return this.meshoptDecoder = e, this;
  }
  register(e) {
    return this.pluginCallbacks.indexOf(e) === -1 && this.pluginCallbacks.push(e), this;
  }
  unregister(e) {
    return this.pluginCallbacks.indexOf(e) !== -1 && this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e), 1), this;
  }
  parse(e, i, s, a) {
    let o;
    const l = {},
      c = {},
      h = new TextDecoder();
    if (typeof e == "string") o = JSON.parse(e);else if (e instanceof ArrayBuffer) {
      if (h.decode(new Uint8Array(e, 0, 4)) === scope.BINARY_EXTENSION_HEADER_MAGIC) {
        try {
          l[scope.EXTENSIONS.KHR_BINARY_GLTF] = new scope.GLTFBinaryExtension(e);
        } catch (f) {
          a && a(f);
          return;
        }
        o = JSON.parse(l[scope.EXTENSIONS.KHR_BINARY_GLTF].content);
      } else o = JSON.parse(h.decode(e));
    } else o = e;
    if (o.asset === void 0 || o.asset.version[0] < 2) {
      a && a(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));
      return;
    }
    const d = new scope.GLTFParser(o, {
      path: i || this.resourcePath || "",
      crossOrigin: this.crossOrigin,
      requestHeader: this.requestHeader,
      manager: this.manager,
      ktx2Loader: this.ktx2Loader,
      meshoptDecoder: this.meshoptDecoder
    });
    d.fileLoader.setRequestHeader(this.requestHeader);
    for (let p = 0; p < this.pluginCallbacks.length; p++) {
      const f = this.pluginCallbacks[p](d);
      f.name || console.error("THREE.GLTFLoader: Invalid plugin found: missing name"), c[f.name] = f, l[f.name] = !0;
    }
    if (o.extensionsUsed) for (let p = 0; p < o.extensionsUsed.length; ++p) {
      const f = o.extensionsUsed[p],
        _ = o.extensionsRequired || [];
      switch (f) {
        case scope.EXTENSIONS.KHR_MATERIALS_UNLIT:
          l[f] = new scope.GLTFMaterialsUnlitExtension();
          break;
        case scope.EXTENSIONS.KHR_DRACO_MESH_COMPRESSION:
          l[f] = new scope.GLTFDracoMeshCompressionExtension(o, this.dracoLoader);
          break;
        case scope.EXTENSIONS.KHR_TEXTURE_TRANSFORM:
          l[f] = new scope.GLTFTextureTransformExtension();
          break;
        case scope.EXTENSIONS.KHR_MESH_QUANTIZATION:
          l[f] = new scope.GLTFMeshQuantizationExtension();
          break;
        default:
          _.indexOf(f) >= 0 && c[f] === void 0 && console.warn('THREE.GLTFLoader: Unknown extension "' + f + '".');
      }
    }
    d.setExtensions(l), d.setPlugins(c), d.parse(s, a);
  }
  parseAsync(e, i) {
    const s = this;
    return new Promise(function (a, o) {
      s.parse(e, i, a, o);
    });
  }
};
}
