/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 866567:887092.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1427(scope) {
scope.GLTFParser = class GLTFParser {
  constructor(e = {}, i = {}) {
    this.json = e, this.extensions = {}, this.plugins = {}, this.options = i, this.cache = new scope.GLTFRegistry(), this.associations = new Map(), this.primitiveCache = {}, this.nodeCache = {}, this.meshCache = {
      refs: {},
      uses: {}
    }, this.cameraCache = {
      refs: {},
      uses: {}
    }, this.lightCache = {
      refs: {},
      uses: {}
    }, this.sourceCache = {}, this.textureCache = {}, this.nodeNamesUsed = {};
    let s = !1,
      a = -1,
      o = !1,
      l = -1;
    if (typeof navigator < "u") {
      const c = navigator.userAgent;
      s = /^((?!chrome|android).)*safari/i.test(c) === !0;
      const h = c.match(/Version\/(\d+)/);
      a = s && h ? parseInt(h[1], 10) : -1, o = c.indexOf("Firefox") > -1, l = o ? c.match(/Firefox\/([0-9]+)\./)[1] : -1;
    }
    typeof createImageBitmap > "u" || s && a < 17 || o && l < 98 ? this.textureLoader = new scope.TextureLoader(this.options.manager) : this.textureLoader = new scope.ImageBitmapLoader(this.options.manager), this.textureLoader.setCrossOrigin(this.options.crossOrigin), this.textureLoader.setRequestHeader(this.options.requestHeader), this.fileLoader = new scope.FileLoader(this.options.manager), this.fileLoader.setResponseType("arraybuffer"), this.options.crossOrigin === "use-credentials" && this.fileLoader.setWithCredentials(!0);
  }
  setExtensions(e) {
    this.extensions = e;
  }
  setPlugins(e) {
    this.plugins = e;
  }
  parse(e, i) {
    const s = this,
      a = this.json,
      o = this.extensions;
    this.cache.removeAll(), this.nodeCache = {}, this._invokeAll(function (l) {
      return l._markDefs && l._markDefs();
    }), Promise.all(this._invokeAll(function (l) {
      return l.beforeRoot && l.beforeRoot();
    })).then(function () {
      return Promise.all([s.getDependencies("scene"), s.getDependencies("animation"), s.getDependencies("camera")]);
    }).then(function (l) {
      const c = {
        scene: l[0][a.scene || 0],
        scenes: l[0],
        animations: l[1],
        cameras: l[2],
        asset: a.asset,
        parser: s,
        userData: {}
      };
      return scope.addUnknownExtensionsToUserData(o, c, a), scope.assignExtrasToUserData(c, a), Promise.all(s._invokeAll(function (h) {
        return h.afterRoot && h.afterRoot(c);
      })).then(function () {
        for (const h of c.scenes) h.updateMatrixWorld();
        e(c);
      });
    }).catch(i);
  }
  _markDefs() {
    const e = this.json.nodes || [],
      i = this.json.skins || [],
      s = this.json.meshes || [];
    for (let a = 0, o = i.length; a < o; a++) {
      const l = i[a].joints;
      for (let c = 0, h = l.length; c < h; c++) e[l[c]].isBone = !0;
    }
    for (let a = 0, o = e.length; a < o; a++) {
      const l = e[a];
      l.mesh !== void 0 && (this._addNodeRef(this.meshCache, l.mesh), l.skin !== void 0 && (s[l.mesh].isSkinnedMesh = !0)), l.camera !== void 0 && this._addNodeRef(this.cameraCache, l.camera);
    }
  }
  _addNodeRef(e, i) {
    i !== void 0 && (e.refs[i] === void 0 && (e.refs[i] = e.uses[i] = 0), e.refs[i]++);
  }
  _getNodeRef(e, i, s) {
    if (e.refs[i] <= 1) return s;
    const a = s.clone(),
      o = (l, c) => {
        const h = this.associations.get(l);
        h != null && this.associations.set(c, h);
        for (const [d, p] of l.children.entries()) o(p, c.children[d]);
      };
    return o(s, a), a.name += "_instance_" + e.uses[i]++, a;
  }
  _invokeOne(e) {
    const i = Object.values(this.plugins);
    i.push(this);
    for (let s = 0; s < i.length; s++) {
      const a = e(i[s]);
      if (a) return a;
    }
    return null;
  }
  _invokeAll(e) {
    const i = Object.values(this.plugins);
    i.unshift(this);
    const s = [];
    for (let a = 0; a < i.length; a++) {
      const o = e(i[a]);
      o && s.push(o);
    }
    return s;
  }
  getDependency(e, i) {
    const s = e + ":" + i;
    let a = this.cache.get(s);
    if (!a) {
      switch (e) {
        case "scene":
          a = this.loadScene(i);
          break;
        case "node":
          a = this._invokeOne(function (o) {
            return o.loadNode && o.loadNode(i);
          });
          break;
        case "mesh":
          a = this._invokeOne(function (o) {
            return o.loadMesh && o.loadMesh(i);
          });
          break;
        case "accessor":
          a = this.loadAccessor(i);
          break;
        case "bufferView":
          a = this._invokeOne(function (o) {
            return o.loadBufferView && o.loadBufferView(i);
          });
          break;
        case "buffer":
          a = this.loadBuffer(i);
          break;
        case "material":
          a = this._invokeOne(function (o) {
            return o.loadMaterial && o.loadMaterial(i);
          });
          break;
        case "texture":
          a = this._invokeOne(function (o) {
            return o.loadTexture && o.loadTexture(i);
          });
          break;
        case "skin":
          a = this.loadSkin(i);
          break;
        case "animation":
          a = this._invokeOne(function (o) {
            return o.loadAnimation && o.loadAnimation(i);
          });
          break;
        case "camera":
          a = this.loadCamera(i);
          break;
        default:
          if (a = this._invokeOne(function (o) {
            return o != this && o.getDependency && o.getDependency(e, i);
          }), !a) throw new Error("Unknown type: " + e);
          break;
      }
      this.cache.add(s, a);
    }
    return a;
  }
  getDependencies(e) {
    let i = this.cache.get(e);
    if (!i) {
      const s = this,
        a = this.json[e + (e === "mesh" ? "es" : "s")] || [];
      i = Promise.all(a.map(function (o, l) {
        return s.getDependency(e, l);
      })), this.cache.add(e, i);
    }
    return i;
  }
  loadBuffer(e) {
    const i = this.json.buffers[e],
      s = this.fileLoader;
    if (i.type && i.type !== "arraybuffer") throw new Error("THREE.GLTFLoader: " + i.type + " buffer type is not supported.");
    if (i.uri === void 0 && e === 0) return Promise.resolve(this.extensions[scope.EXTENSIONS.KHR_BINARY_GLTF].body);
    const a = this.options;
    return new Promise(function (o, l) {
      s.load(scope.LoaderUtils.resolveURL(i.uri, a.path), o, void 0, function () {
        l(new Error('THREE.GLTFLoader: Failed to load buffer "' + i.uri + '".'));
      });
    });
  }
  loadBufferView(e) {
    const i = this.json.bufferViews[e];
    return this.getDependency("buffer", i.buffer).then(function (s) {
      const a = i.byteLength || 0,
        o = i.byteOffset || 0;
      return s.slice(o, o + a);
    });
  }
  loadAccessor(e) {
    const i = this,
      s = this.json,
      a = this.json.accessors[e];
    if (a.bufferView === void 0 && a.sparse === void 0) {
      const l = scope.WEBGL_TYPE_SIZES[a.type],
        c = scope.WEBGL_COMPONENT_TYPES[a.componentType],
        h = a.normalized === !0,
        d = new c(a.count * l);
      return Promise.resolve(new scope.BufferAttribute(d, l, h));
    }
    const o = [];
    return a.bufferView !== void 0 ? o.push(this.getDependency("bufferView", a.bufferView)) : o.push(null), a.sparse !== void 0 && (o.push(this.getDependency("bufferView", a.sparse.indices.bufferView)), o.push(this.getDependency("bufferView", a.sparse.values.bufferView))), Promise.all(o).then(function (l) {
      const c = l[0],
        h = scope.WEBGL_TYPE_SIZES[a.type],
        d = scope.WEBGL_COMPONENT_TYPES[a.componentType],
        p = d.BYTES_PER_ELEMENT,
        f = p * h,
        _ = a.byteOffset || 0,
        x = a.bufferView !== void 0 ? s.bufferViews[a.bufferView].byteStride : void 0,
        b = a.normalized === !0;
      let T, M;
      if (x && x !== f) {
        const w = Math.floor(_ / x),
          D = "InterleavedBuffer:" + a.bufferView + ":" + a.componentType + ":" + w + ":" + a.count;
        let R = i.cache.get(D);
        R || (T = new d(c, w * x, a.count * x / p), R = new scope.InterleavedBuffer(T, x / p), i.cache.add(D, R)), M = new scope.InterleavedBufferAttribute(R, h, _ % x / p, b);
      } else c === null ? T = new d(a.count * h) : T = new d(c, _, a.count * h), M = new scope.BufferAttribute(T, h, b);
      if (a.sparse !== void 0) {
        const w = scope.WEBGL_TYPE_SIZES.SCALAR,
          D = scope.WEBGL_COMPONENT_TYPES[a.sparse.indices.componentType],
          R = a.sparse.indices.byteOffset || 0,
          P = a.sparse.values.byteOffset || 0,
          U = new D(l[1], R, a.sparse.count * w),
          O = new d(l[2], P, a.sparse.count * h);
        c !== null && (M = new scope.BufferAttribute(M.array.slice(), M.itemSize, M.normalized)), M.normalized = !1;
        for (let N = 0, H = U.length; N < H; N++) {
          const F = U[N];
          if (M.setX(F, O[N * h]), h >= 2 && M.setY(F, O[N * h + 1]), h >= 3 && M.setZ(F, O[N * h + 2]), h >= 4 && M.setW(F, O[N * h + 3]), h >= 5) throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.");
        }
        M.normalized = b;
      }
      return M;
    });
  }
  loadTexture(e) {
    const i = this.json,
      s = this.options,
      o = i.textures[e].source,
      l = i.images[o];
    let c = this.textureLoader;
    if (l.uri) {
      const h = s.manager.getHandler(l.uri);
      h !== null && (c = h);
    }
    return this.loadTextureImage(e, o, c);
  }
  loadTextureImage(e, i, s) {
    const a = this,
      o = this.json,
      l = o.textures[e],
      c = o.images[i],
      h = (c.uri || c.bufferView) + ":" + l.sampler;
    if (this.textureCache[h]) return this.textureCache[h];
    const d = this.loadImageSource(i, s).then(function (p) {
      p.flipY = !1, p.name = l.name || c.name || "", p.name === "" && typeof c.uri == "string" && c.uri.startsWith("data:image/") === !1 && (p.name = c.uri);
      const _ = (o.samplers || {})[l.sampler] || {};
      return p.magFilter = scope.WEBGL_FILTERS[_.magFilter] || scope.LinearFilter, p.minFilter = scope.WEBGL_FILTERS[_.minFilter] || scope.LinearMipmapLinearFilter, p.wrapS = scope.WEBGL_WRAPPINGS[_.wrapS] || scope.RepeatWrapping, p.wrapT = scope.WEBGL_WRAPPINGS[_.wrapT] || scope.RepeatWrapping, p.generateMipmaps = !p.isCompressedTexture && p.minFilter !== scope.NearestFilter && p.minFilter !== scope.LinearFilter, a.associations.set(p, {
        textures: e
      }), p;
    }).catch(function () {
      return null;
    });
    return this.textureCache[h] = d, d;
  }
  loadImageSource(e, i) {
    const s = this,
      a = this.json,
      o = this.options;
    if (this.sourceCache[e] !== void 0) return this.sourceCache[e].then(f => f.clone());
    const l = a.images[e],
      c = self.URL || self.webkitURL;
    let h = l.uri || "",
      d = !1;
    if (l.bufferView !== void 0) h = s.getDependency("bufferView", l.bufferView).then(function (f) {
      d = !0;
      const _ = new Blob([f], {
        type: l.mimeType
      });
      return h = c.createObjectURL(_), h;
    });else if (l.uri === void 0) throw new Error("THREE.GLTFLoader: Image " + e + " is missing URI and bufferView");
    const p = Promise.resolve(h).then(function (f) {
      return new Promise(function (_, x) {
        let b = _;
        i.isImageBitmapLoader === !0 && (b = function (T) {
          const M = new scope.Texture(T);
          M.needsUpdate = !0, _(M);
        }), i.load(scope.LoaderUtils.resolveURL(f, o.path), b, void 0, x);
      });
    }).then(function (f) {
      return d === !0 && c.revokeObjectURL(h), scope.assignExtrasToUserData(f, l), f.userData.mimeType = l.mimeType || scope.getImageURIMimeType(l.uri), f;
    }).catch(function (f) {
      throw console.error("THREE.GLTFLoader: Couldn't load texture", h), f;
    });
    return this.sourceCache[e] = p, p;
  }
  assignTexture(e, i, s, a) {
    const o = this;
    return this.getDependency("texture", s.index).then(function (l) {
      if (!l) return null;
      if (s.texCoord !== void 0 && s.texCoord > 0 && (l = l.clone(), l.channel = s.texCoord), o.extensions[scope.EXTENSIONS.KHR_TEXTURE_TRANSFORM]) {
        const c = s.extensions !== void 0 ? s.extensions[scope.EXTENSIONS.KHR_TEXTURE_TRANSFORM] : void 0;
        if (c) {
          const h = o.associations.get(l);
          l = o.extensions[scope.EXTENSIONS.KHR_TEXTURE_TRANSFORM].extendTexture(l, c), o.associations.set(l, h);
        }
      }
      return a !== void 0 && (l.colorSpace = a), e[i] = l, l;
    });
  }
  assignFinalMaterial(e) {
    const i = e.geometry;
    let s = e.material;
    const a = i.attributes.tangent === void 0,
      o = i.attributes.color !== void 0,
      l = i.attributes.normal === void 0;
    if (e.isPoints) {
      const c = "PointsMaterial:" + s.uuid;
      let h = this.cache.get(c);
      h || (h = new scope.PointsMaterial(), scope.Material.prototype.copy.call(h, s), h.color.copy(s.color), h.map = s.map, h.sizeAttenuation = !1, this.cache.add(c, h)), s = h;
    } else if (e.isLine) {
      const c = "LineBasicMaterial:" + s.uuid;
      let h = this.cache.get(c);
      h || (h = new scope.LineBasicMaterial(), scope.Material.prototype.copy.call(h, s), h.color.copy(s.color), h.map = s.map, this.cache.add(c, h)), s = h;
    }
    if (a || o || l) {
      let c = "ClonedMaterial:" + s.uuid + ":";
      a && (c += "derivative-tangents:"), o && (c += "vertex-colors:"), l && (c += "flat-shading:");
      let h = this.cache.get(c);
      h || (h = s.clone(), o && (h.vertexColors = !0), l && (h.flatShading = !0), a && (h.normalScale && (h.normalScale.y *= -1), h.clearcoatNormalScale && (h.clearcoatNormalScale.y *= -1)), this.cache.add(c, h), this.associations.set(h, this.associations.get(s))), s = h;
    }
    e.material = s;
  }
  getMaterialType() {
    return scope.MeshStandardMaterial;
  }
  loadMaterial(e) {
    const i = this,
      s = this.json,
      a = this.extensions,
      o = s.materials[e];
    let l;
    const c = {},
      h = o.extensions || {},
      d = [];
    if (h[scope.EXTENSIONS.KHR_MATERIALS_UNLIT]) {
      const f = a[scope.EXTENSIONS.KHR_MATERIALS_UNLIT];
      l = f.getMaterialType(), d.push(f.extendParams(c, o, i));
    } else {
      const f = o.pbrMetallicRoughness || {};
      if (c.color = new scope.Color(1, 1, 1), c.opacity = 1, Array.isArray(f.baseColorFactor)) {
        const _ = f.baseColorFactor;
        c.color.setRGB(_[0], _[1], _[2], scope.LinearSRGBColorSpace), c.opacity = _[3];
      }
      f.baseColorTexture !== void 0 && d.push(i.assignTexture(c, "map", f.baseColorTexture, scope.SRGBColorSpace)), c.metalness = f.metallicFactor !== void 0 ? f.metallicFactor : 1, c.roughness = f.roughnessFactor !== void 0 ? f.roughnessFactor : 1, f.metallicRoughnessTexture !== void 0 && (d.push(i.assignTexture(c, "metalnessMap", f.metallicRoughnessTexture)), d.push(i.assignTexture(c, "roughnessMap", f.metallicRoughnessTexture))), l = this._invokeOne(function (_) {
        return _.getMaterialType && _.getMaterialType(e);
      }), d.push(Promise.all(this._invokeAll(function (_) {
        return _.extendMaterialParams && _.extendMaterialParams(e, c);
      })));
    }
    o.doubleSided === !0 && (c.side = scope.DoubleSide);
    const p = o.alphaMode || scope.ALPHA_MODES.OPAQUE;
    if (p === scope.ALPHA_MODES.BLEND ? (c.transparent = !0, c.depthWrite = !1) : (c.transparent = !1, p === scope.ALPHA_MODES.MASK && (c.alphaTest = o.alphaCutoff !== void 0 ? o.alphaCutoff : .5)), o.normalTexture !== void 0 && l !== scope.MeshBasicMaterial && (d.push(i.assignTexture(c, "normalMap", o.normalTexture)), c.normalScale = new scope.Vector2(1, 1), o.normalTexture.scale !== void 0)) {
      const f = o.normalTexture.scale;
      c.normalScale.set(f, f);
    }
    if (o.occlusionTexture !== void 0 && l !== scope.MeshBasicMaterial && (d.push(i.assignTexture(c, "aoMap", o.occlusionTexture)), o.occlusionTexture.strength !== void 0 && (c.aoMapIntensity = o.occlusionTexture.strength)), o.emissiveFactor !== void 0 && l !== scope.MeshBasicMaterial) {
      const f = o.emissiveFactor;
      c.emissive = new scope.Color().setRGB(f[0], f[1], f[2], scope.LinearSRGBColorSpace);
    }
    return o.emissiveTexture !== void 0 && l !== scope.MeshBasicMaterial && d.push(i.assignTexture(c, "emissiveMap", o.emissiveTexture, scope.SRGBColorSpace)), Promise.all(d).then(function () {
      const f = new l(c);
      return o.name && (f.name = o.name), scope.assignExtrasToUserData(f, o), i.associations.set(f, {
        materials: e
      }), o.extensions && scope.addUnknownExtensionsToUserData(a, f, o), f;
    });
  }
  createUniqueName(e) {
    const i = scope.PropertyBinding.sanitizeNodeName(e || "");
    return i in this.nodeNamesUsed ? i + "_" + ++this.nodeNamesUsed[i] : (this.nodeNamesUsed[i] = 0, i);
  }
  loadGeometries(e) {
    const i = this,
      s = this.extensions,
      a = this.primitiveCache;
    function o(c) {
      return s[scope.EXTENSIONS.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(c, i).then(function (h) {
        return scope.addPrimitiveAttributes(h, c, i);
      });
    }
    const l = [];
    for (let c = 0, h = e.length; c < h; c++) {
      const d = e[c],
        p = scope.createPrimitiveKey(d),
        f = a[p];
      if (f) l.push(f.promise);else {
        let _;
        d.extensions && d.extensions[scope.EXTENSIONS.KHR_DRACO_MESH_COMPRESSION] ? _ = o(d) : _ = scope.addPrimitiveAttributes(new scope.BufferGeometry(), d, i), a[p] = {
          primitive: d,
          promise: _
        }, l.push(_);
      }
    }
    return Promise.all(l);
  }
  loadMesh(e) {
    const i = this,
      s = this.json,
      a = this.extensions,
      o = s.meshes[e],
      l = o.primitives,
      c = [];
    for (let h = 0, d = l.length; h < d; h++) {
      const p = l[h].material === void 0 ? scope.createDefaultMaterial(this.cache) : this.getDependency("material", l[h].material);
      c.push(p);
    }
    return c.push(i.loadGeometries(l)), Promise.all(c).then(function (h) {
      const d = h.slice(0, h.length - 1),
        p = h[h.length - 1],
        f = [];
      for (let x = 0, b = p.length; x < b; x++) {
        const T = p[x],
          M = l[x];
        let w;
        const D = d[x];
        if (M.mode === scope.WEBGL_CONSTANTS.TRIANGLES || M.mode === scope.WEBGL_CONSTANTS.TRIANGLE_STRIP || M.mode === scope.WEBGL_CONSTANTS.TRIANGLE_FAN || M.mode === void 0) w = o.isSkinnedMesh === !0 ? new scope.SkinnedMesh(T, D) : new scope.Mesh(T, D), w.isSkinnedMesh === !0 && w.normalizeSkinWeights(), M.mode === scope.WEBGL_CONSTANTS.TRIANGLE_STRIP ? w.geometry = scope.toTrianglesDrawMode(w.geometry, scope.TriangleStripDrawMode) : M.mode === scope.WEBGL_CONSTANTS.TRIANGLE_FAN && (w.geometry = scope.toTrianglesDrawMode(w.geometry, scope.TriangleFanDrawMode));else if (M.mode === scope.WEBGL_CONSTANTS.LINES) w = new scope.LineSegments(T, D);else if (M.mode === scope.WEBGL_CONSTANTS.LINE_STRIP) w = new scope.Line(T, D);else if (M.mode === scope.WEBGL_CONSTANTS.LINE_LOOP) w = new scope.LineLoop(T, D);else if (M.mode === scope.WEBGL_CONSTANTS.POINTS) w = new scope.Points(T, D);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: " + M.mode);
        Object.keys(w.geometry.morphAttributes).length > 0 && scope.updateMorphTargets(w, o), w.name = i.createUniqueName(o.name || "mesh_" + e), scope.assignExtrasToUserData(w, o), M.extensions && scope.addUnknownExtensionsToUserData(a, w, M), i.assignFinalMaterial(w), f.push(w);
      }
      for (let x = 0, b = f.length; x < b; x++) i.associations.set(f[x], {
        meshes: e,
        primitives: x
      });
      if (f.length === 1) return o.extensions && scope.addUnknownExtensionsToUserData(a, f[0], o), f[0];
      const _ = new scope.Group();
      o.extensions && scope.addUnknownExtensionsToUserData(a, _, o), i.associations.set(_, {
        meshes: e
      });
      for (let x = 0, b = f.length; x < b; x++) _.add(f[x]);
      return _;
    });
  }
  loadCamera(e) {
    let i;
    const s = this.json.cameras[e],
      a = s[s.type];
    if (!a) {
      console.warn("THREE.GLTFLoader: Missing camera parameters.");
      return;
    }
    return s.type === "perspective" ? i = new scope.PerspectiveCamera(scope.MathUtils.radToDeg(a.yfov), a.aspectRatio || 1, a.znear || 1, a.zfar || 2e6) : s.type === "orthographic" && (i = new scope.OrthographicCamera(-a.xmag, a.xmag, a.ymag, -a.ymag, a.znear, a.zfar)), s.name && (i.name = this.createUniqueName(s.name)), scope.assignExtrasToUserData(i, s), Promise.resolve(i);
  }
  loadSkin(e) {
    const i = this.json.skins[e],
      s = [];
    for (let a = 0, o = i.joints.length; a < o; a++) s.push(this._loadNodeShallow(i.joints[a]));
    return i.inverseBindMatrices !== void 0 ? s.push(this.getDependency("accessor", i.inverseBindMatrices)) : s.push(null), Promise.all(s).then(function (a) {
      const o = a.pop(),
        l = a,
        c = [],
        h = [];
      for (let d = 0, p = l.length; d < p; d++) {
        const f = l[d];
        if (f) {
          c.push(f);
          const _ = new scope.Matrix4();
          o !== null && _.fromArray(o.array, d * 16), h.push(_);
        } else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.', i.joints[d]);
      }
      return new scope.Skeleton(c, h);
    });
  }
  loadAnimation(e) {
    const i = this.json,
      s = this,
      a = i.animations[e],
      o = a.name ? a.name : "animation_" + e,
      l = [],
      c = [],
      h = [],
      d = [],
      p = [];
    for (let f = 0, _ = a.channels.length; f < _; f++) {
      const x = a.channels[f],
        b = a.samplers[x.sampler],
        T = x.target,
        M = T.node,
        w = a.parameters !== void 0 ? a.parameters[b.input] : b.input,
        D = a.parameters !== void 0 ? a.parameters[b.output] : b.output;
      T.node !== void 0 && (l.push(this.getDependency("node", M)), c.push(this.getDependency("accessor", w)), h.push(this.getDependency("accessor", D)), d.push(b), p.push(T));
    }
    return Promise.all([Promise.all(l), Promise.all(c), Promise.all(h), Promise.all(d), Promise.all(p)]).then(function (f) {
      const _ = f[0],
        x = f[1],
        b = f[2],
        T = f[3],
        M = f[4],
        w = [];
      for (let R = 0, P = _.length; R < P; R++) {
        const U = _[R],
          O = x[R],
          N = b[R],
          H = T[R],
          F = M[R];
        if (U === void 0) continue;
        U.updateMatrix && U.updateMatrix();
        const k = s._createAnimationTracks(U, O, N, H, F);
        if (k) for (let W = 0; W < k.length; W++) w.push(k[W]);
      }
      const D = new scope.AnimationClip(o, void 0, w);
      return scope.assignExtrasToUserData(D, a), D;
    });
  }
  createNodeMesh(e) {
    const i = this.json,
      s = this,
      a = i.nodes[e];
    return a.mesh === void 0 ? null : s.getDependency("mesh", a.mesh).then(function (o) {
      const l = s._getNodeRef(s.meshCache, a.mesh, o);
      return a.weights !== void 0 && l.traverse(function (c) {
        if (c.isMesh) for (let h = 0, d = a.weights.length; h < d; h++) c.morphTargetInfluences[h] = a.weights[h];
      }), l;
    });
  }
  loadNode(e) {
    const i = this.json,
      s = this,
      a = i.nodes[e],
      o = s._loadNodeShallow(e),
      l = [],
      c = a.children || [];
    for (let d = 0, p = c.length; d < p; d++) l.push(s.getDependency("node", c[d]));
    const h = a.skin === void 0 ? Promise.resolve(null) : s.getDependency("skin", a.skin);
    return Promise.all([o, Promise.all(l), h]).then(function (d) {
      const p = d[0],
        f = d[1],
        _ = d[2];
      _ !== null && p.traverse(function (x) {
        x.isSkinnedMesh && x.bind(_, scope._identityMatrix);
      });
      for (let x = 0, b = f.length; x < b; x++) p.add(f[x]);
      return p;
    });
  }
  _loadNodeShallow(e) {
    const i = this.json,
      s = this.extensions,
      a = this;
    if (this.nodeCache[e] !== void 0) return this.nodeCache[e];
    const o = i.nodes[e],
      l = o.name ? a.createUniqueName(o.name) : "",
      c = [],
      h = a._invokeOne(function (d) {
        return d.createNodeMesh && d.createNodeMesh(e);
      });
    return h && c.push(h), o.camera !== void 0 && c.push(a.getDependency("camera", o.camera).then(function (d) {
      return a._getNodeRef(a.cameraCache, o.camera, d);
    })), a._invokeAll(function (d) {
      return d.createNodeAttachment && d.createNodeAttachment(e);
    }).forEach(function (d) {
      c.push(d);
    }), this.nodeCache[e] = Promise.all(c).then(function (d) {
      let p;
      if (o.isBone === !0 ? p = new scope.Bone() : d.length > 1 ? p = new scope.Group() : d.length === 1 ? p = d[0] : p = new scope.Object3D(), p !== d[0]) for (let f = 0, _ = d.length; f < _; f++) p.add(d[f]);
      if (o.name && (p.userData.name = o.name, p.name = l), scope.assignExtrasToUserData(p, o), o.extensions && scope.addUnknownExtensionsToUserData(s, p, o), o.matrix !== void 0) {
        const f = new scope.Matrix4();
        f.fromArray(o.matrix), p.applyMatrix4(f);
      } else o.translation !== void 0 && p.position.fromArray(o.translation), o.rotation !== void 0 && p.quaternion.fromArray(o.rotation), o.scale !== void 0 && p.scale.fromArray(o.scale);
      if (!a.associations.has(p)) a.associations.set(p, {});else if (o.mesh !== void 0 && a.meshCache.refs[o.mesh] > 1) {
        const f = a.associations.get(p);
        a.associations.set(p, {
          ...f
        });
      }
      return a.associations.get(p).nodes = e, p;
    }), this.nodeCache[e];
  }
  loadScene(e) {
    const i = this.extensions,
      s = this.json.scenes[e],
      a = this,
      o = new scope.Group();
    s.name && (o.name = a.createUniqueName(s.name)), scope.assignExtrasToUserData(o, s), s.extensions && scope.addUnknownExtensionsToUserData(i, o, s);
    const l = s.nodes || [],
      c = [];
    for (let h = 0, d = l.length; h < d; h++) c.push(a.getDependency("node", l[h]));
    return Promise.all(c).then(function (h) {
      for (let p = 0, f = h.length; p < f; p++) o.add(h[p]);
      const d = p => {
        const f = new Map();
        for (const [_, x] of a.associations) (_ instanceof scope.Material || _ instanceof scope.Texture) && f.set(_, x);
        return p.traverse(_ => {
          const x = a.associations.get(_);
          x != null && f.set(_, x);
        }), f;
      };
      return a.associations = d(o), o;
    });
  }
  _createAnimationTracks(e, i, s, a, o) {
    const l = [],
      c = e.name ? e.name : e.uuid,
      h = [];
    scope.PATH_PROPERTIES[o.path] === scope.PATH_PROPERTIES.weights ? e.traverse(function (_) {
      _.morphTargetInfluences && h.push(_.name ? _.name : _.uuid);
    }) : h.push(c);
    let d;
    switch (scope.PATH_PROPERTIES[o.path]) {
      case scope.PATH_PROPERTIES.weights:
        d = scope.NumberKeyframeTrack;
        break;
      case scope.PATH_PROPERTIES.rotation:
        d = scope.QuaternionKeyframeTrack;
        break;
      case scope.PATH_PROPERTIES.translation:
      case scope.PATH_PROPERTIES.scale:
        d = scope.VectorKeyframeTrack;
        break;
      default:
        switch (s.itemSize) {
          case 1:
            d = scope.NumberKeyframeTrack;
            break;
          case 2:
          case 3:
          default:
            d = scope.VectorKeyframeTrack;
            break;
        }
        break;
    }
    const p = a.interpolation !== void 0 ? scope.INTERPOLATION[a.interpolation] : scope.InterpolateLinear,
      f = this._getArrayFromAccessor(s);
    for (let _ = 0, x = h.length; _ < x; _++) {
      const b = new d(h[_] + "." + scope.PATH_PROPERTIES[o.path], i.array, f, p);
      a.interpolation === "CUBICSPLINE" && this._createCubicSplineTrackInterpolant(b), l.push(b);
    }
    return l;
  }
  _getArrayFromAccessor(e) {
    let i = e.array;
    if (e.normalized) {
      const s = scope.getNormalizedComponentScale(i.constructor),
        a = new Float32Array(i.length);
      for (let o = 0, l = i.length; o < l; o++) a[o] = i[o] * s;
      i = a;
    }
    return i;
  }
  _createCubicSplineTrackInterpolant(e) {
    e.createInterpolant = function (s) {
      const a = this instanceof scope.QuaternionKeyframeTrack ? scope.GLTFCubicSplineQuaternionInterpolant : scope.GLTFCubicSplineInterpolant;
      return new a(this.times, this.values, this.getValueSize() / 3, s);
    }, e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = !0;
  }
};
}
