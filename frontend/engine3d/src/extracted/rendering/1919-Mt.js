/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1383862:1398166.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1919(scope) {
scope.Mt = class Mt extends scope.BatchedMesh {
  constructor(i) {
    super(Mt.MAX_CHARS, Mt.MAX_CHARS * Mt.MAX_VERTICES_PER_CHAR, Mt.MAX_CHARS * Mt.MAX_VERTICES_PER_CHAR * Mt.MAX_INDICES_PER_VERTEX, i.material || new scope.ShaderMaterial({
      uniforms: {
        batchingTexture: {
          value: null
        },
        batchingIdTexture: {
          value: null
        }
      },
      vertexShader: `

                    /* BATCHING */
                    #if ! defined(GL_ANGLE_multi_draw)
                        #define gl_DrawID _gl_DrawID
                        uniform int _gl_DrawID;
                    #endif
                    uniform highp sampler2D batchingTexture;
                    uniform highp usampler2D batchingIdTexture;

                    mat4 getBatchingMatrix(const in int i) {
                        int size = textureSize(batchingTexture, 0).x;
                        int j = i * 4;
                        int x = j % size;
                        int y = j / size;
                        vec4 v1 = texelFetch(batchingTexture, ivec2(x, y), 0);
                        vec4 v2 = texelFetch(batchingTexture, ivec2(x + 1, y), 0);
                        vec4 v3 = texelFetch(batchingTexture, ivec2(x + 2, y), 0);
                        vec4 v4 = texelFetch(batchingTexture, ivec2(x + 3, y), 0);
                        return mat4(v1, v2, v3, v4);
                    }

                    float getIndirectIndex(const in int i) {
                        int size = textureSize(batchingIdTexture, 0).x;
                        int x = i % size;
                        int y = i / size;
                        return float(texelFetch(batchingIdTexture, ivec2(x, y), 0).r);
                    }

                    /* SKINNING */
                    attribute vec4 skinIndex;
                    attribute vec4 skinWeight;
                    uniform sampler2D boneTexture;
                    mat4 bindMatrix = mat4(1.0);
                    mat4 bindMatrixInverse = mat4(1.0);
                    mat4 getBoneMatrix(const in float i, const in float id) {
                        int x = int(i) * 4;
                        int y = int(id);
                        vec4 v1 = texelFetch(boneTexture, ivec2(x, y), 0);
                        vec4 v2 = texelFetch(boneTexture, ivec2(x + 1, y), 0);
                        vec4 v3 = texelFetch(boneTexture, ivec2(x + 2, y), 0);
                        vec4 v4 = texelFetch(boneTexture, ivec2(x + 3, y), 0);
                        return mat4(v1, v2, v3, v4);
                    }

                    varying vec2 vUv;

                    void main() {
                        vUv = uv;

                        float batchID = getIndirectIndex(gl_DrawID);
                        mat4 batchingMatrix = getBatchingMatrix(batchID);
                        mat4 boneMatX = getBoneMatrix(skinIndex.x, batchID);
                        mat4 boneMatY = getBoneMatrix(skinIndex.y, batchID);
                        mat4 boneMatZ = getBoneMatrix(skinIndex.z, batchID);
                        mat4 boneMatW = getBoneMatrix(skinIndex.w, batchID);

                        mat4 skinMatrix = mat4(0.0);
                        skinMatrix += skinWeight.x * boneMatX;
                        skinMatrix += skinWeight.y * boneMatY;
                        skinMatrix += skinWeight.z * boneMatZ;
                        skinMatrix += skinWeight.w * boneMatW;

                        // normal
                        vec3 objectNormal = vec4(skinMatrix * vec4(normal, 0.0)).xyz;
                        mat3 bm = mat3(batchingMatrix);
                        vec3 transformedNormal = objectNormal;
                        transformedNormal /= vec3(dot(bm[0], bm[0]), dot(bm[1], bm[1]), dot(bm[2], bm[2]));
                        transformedNormal = bm * transformedNormal;
                        transformedNormal = normalMatrix * transformedNormal;
                        vNormal = normalize(transformedNormal);

                        // position
                        vec4 skinVertex = vec4(position, 1.0);
                        vec4 skinned = vec4(0.0);
                        skinned += boneMatX * skinVertex * skinWeight.x;
                        skinned += boneMatY * skinVertex * skinWeight.y;
                        skinned += boneMatZ * skinVertex * skinWeight.z;
                        skinned += boneMatW * skinVertex * skinWeight.w;
                        vec4 mvPosition = vec4(skinned.xyz, 1.0);
                        mvPosition = batchingMatrix * mvPosition;

                        mvPosition = modelViewMatrix * mvPosition;
                        gl_Position = projectionMatrix * mvPosition;
                    }
                `,
      fragmentShader: `
                    varying vec2 vUv;

                    void main() {
                        gl_FragColor = vec4(vUv, 0.0, 1.0);
                    }
                `
    }));
    scope.oe(this, scope.rr, new scope.Matrix4());
    this._matricesTexture.needsUpdate = !0, this._indirectTexture.needsUpdate = !0, this.material.uniforms.batchingTexture && (this.material.uniforms.batchingTexture.value = this._matricesTexture), this.material.uniforms.batchingIdTexture && (this.material.uniforms.batchingIdTexture.value = this._indirectTexture), i.customDepthMaterial && (this.customDepthMaterial = i.customDepthMaterial), i.customDistanceMaterial && (this.customDistanceMaterial = i.customDistanceMaterial), this.frustumCulled = !1, this.matrixWorldAutoUpdate = !0, this.perObjectFrustumCulled = !1, this.sortObjects = !1, this.onBeforeShadow = () => {}, this.onBeforeRender = () => {}, this._animationOptions = i.animationOptions || [], this._animationsWhileInAir = i.animationsWhileInAir || !1, this._inactiveAnimations = Array.isArray(i.inactiveAnimations) ? i.inactiveAnimations : [i.inactiveAnimations || 4], this._skipBoundingVolumeModels = i.skipBoundingVolumeModels || [], this._inactiveAnimation = this._inactiveAnimations[0], this.boundingBox = new scope.Box3(), this.boundingSphere = new scope.Sphere(), this.receiveShadow = i.skinShadows !== !1, this.castShadow = this.receiveShadow;
    const s = scope.math.ceilPowerOfTwo(Mt.MAX_BONES * 4),
      a = scope.math.ceilPowerOfTwo(Mt.MAX_CHARS),
      o = new Float32Array(s * a * 4);
    this._boneTexture = new scope.DataTexture(o, s, a, scope.RGBAFormat, scope.FloatType), this._boneTexture.needsUpdate = !0, this._geoWorker = new scope.WorkerWrapper(), this._geoWorker.id = 0, this._geoWorker.onmessage = this._receiveMergedGeo.bind(this), this._geoWorker.storage = {}, this._localModelReady = new Promise(l => {
      this._isLocalModelReady = l;
    }), this._buffersToUpload = [];
  }
  static ensureAvatarUrl(i) {
    let s = i.replace(".", "");
    return s.indexOf("avatar") !== 0 && (s = `avatar/${s}`), s;
  }
  static secureLerp(i) {
    return i > .9999 ? 1 : i < 1e-4 ? 0 : i;
  }
  get MAX_CHARS() {
    return Mt.MAX_CHARS;
  }
  async _initBatchedMeshes() {
    const {
      skin: i
    } = await this._loadModels(this._localObject);
    if (!i) throw new Error("Initial character geometry could not be loaded/created.");
    const s = new scope.BufferGeometry();
    for (const o in i.geometry.attributes) {
      const l = i.geometry.getAttribute(o),
        {
          array: c,
          itemSize: h,
          normalized: d
        } = l,
        p = new c.constructor(Mt.MAX_VERTICES_PER_CHAR * h),
        f = new l.constructor(p, h, d);
      f.setUsage(scope.DynamicDrawUsage), s.setAttribute(o, f);
    }
    const a = this._maxVertexCount >= 65535 ? Uint32Array : Uint16Array;
    s.setIndex(new scope.BufferAttribute(new a(Mt.MAX_VERTICES_PER_CHAR * Mt.MAX_INDICES_PER_VERTEX), 1).setUsage(scope.DynamicDrawUsage)), s.boundingBox = new scope.Box3(), s.boundingSphere = new scope.Sphere(), this._initializeGeometry(s);
    for (const o in this.geometry.attributes) this.geometry.attributes[o].setUsage(scope.DynamicDrawUsage), this.geometry.attributes[o].needsUpdate = !0;
    this.geometry.getIndex().setUsage(scope.DynamicDrawUsage), this.geometry.getIndex().needsUpdate = !0;
    for (let o = 0; o < this.maxInstanceCount; o++) {
      const l = this.addGeometry(s),
        c = this.addInstance(l);
      this._instanceInfo[c].active = !1, this._instanceInfo[c].visible = !1;
    }
    await this._loadBatchedGeometries(this._localObject), this._isLocalModelReady();
  }
  async _loadModels(i) {
    const s = i.userData;
    if (!s.modelFiles || !s.bonesFile || !s.animationFiles) throw new Error("Character geometry data is missing.");
    let a = null,
      o = null,
      l = null;
    if ([a, o, l] = await Promise.all([Promise.all(s.modelFiles.map(p => scope.geometryLoader.load(`${Mt.ensureAvatarUrl(p)}.drc`, !0))), scope.geometryLoader.load(`${Mt.ensureAvatarUrl(s.bonesFile)}.drc`, !0), Promise.all(s.animationFiles.map(p => scope.geometryLoader.skinAnimation(`${Mt.ensureAvatarUrl(p)}.drc`, !0)))]), a.some(p => p.type === "BoxGeometry") || o.type === "BoxGeometry" || l.some(p => p.tracks.length === 0)) return !1;
    const c = [];
    s.modelFiles.forEach((p, f) => {
      for (let _ = 0; _ < this._skipBoundingVolumeModels.length; _++) if (p.match(this._skipBoundingVolumeModels[_])) {
        c.push(f);
        break;
      }
    });
    const h = this._geoWorker.id++;
    this._geoWorker.storage[h] = {}, this._geoWorker.storage[h].promise = new Promise(p => {
      this._geoWorker.storage[h].resolve = p;
    }), this._geoWorker.postMessage({
      id: h,
      models: a.map(p => {
        const f = {};
        for (const _ in p.attributes) f[_] = {
          array: p.attributes[_].array,
          itemSize: p.attributes[_].itemSize
        };
        return f.index = {
          array: p.getIndex().array,
          itemSize: 1
        }, f;
      }),
      skipFromBounds: c
    });
    const d = await this._geoWorker.storage[h].promise;
    return delete this._geoWorker.storage[h], {
      skin: scope.createSkin(d, o),
      animations: l
    };
  }
  _receiveMergedGeo(i) {
    const {
        id: s,
        arrays: a,
        volumes: o
      } = i.data,
      l = new scope.BufferGeometry();
    for (const c in a) c === "index" ? l.setIndex(new scope.BufferAttribute(a[c].array, a[c].itemSize)) : l.setAttribute(c, new scope.BufferAttribute(a[c].array, a[c].itemSize));
    l.boundingBox = new scope.Box3(), l.boundingBox.min.fromArray(o.box.min), l.boundingBox.max.fromArray(o.box.max), l.boundingSphere = new scope.Sphere(), l.boundingSphere.center.fromArray(o.sphere.center), l.boundingSphere.radius = o.sphere.radius * 2, this._geoWorker.storage[s].resolve(l);
  }
  async _loadBatchedGeometries(i) {
    const s = this.getModelsID(i),
      a = !!i.__loadingModels;
    if (i.__loadingModels = s, a || i.isBeingRemoved) return;
    i.modelsID = s;
    const o = i === this._localObject;
    o || scope.createTween(i.scale, {
      to: {
        x: 0,
        y: 0,
        z: 0
      },
      ease: "power2.out",
      duration: .15
    });
    const {
      skin: l,
      animations: c
    } = await this._loadModels(i);
    if (l && c && !i.isBeingRemoved) {
      const d = l.geometry;
      o && this._collisionPhysics._updateCapsule(d.boundingBox), this.setGeometryAt(i.batchedIndex, d);
      const p = [i, []];
      for (const f in this.geometry.attributes) {
        if (!d.attributes[f]) continue;
        const _ = this.geometry.attributes[f].itemSize;
        p[1].push([f, this._geometryInfo[i.batchedIndex].vertexStart * _, d.attributes[f].count * _]);
      }
      p[1].push(["index", this._geometryInfo[i.batchedIndex].indexStart, d.getIndex().count]);
      for (let f = this._buffersToUpload.length - 1; f >= 0; f--) this._buffersToUpload[f][0].batchedIndex === i.batchedIndex && this._buffersToUpload.splice(f, 1);
      o ? this._buffersToUpload.unshift(p) : this._buffersToUpload.push(p), i.animationProps.weights = new Array(i.animationProps.weights.length).fill(0).map((f, _) => i.animationProps.weights[_] || 0), i.animationProps.mixer = new scope.AnimationMixer(l), i.animationProps.actions = c.map((f, _) => {
        var b;
        const x = i.animationProps.mixer.clipAction(f.clone());
        return x.setEffectiveTimeScale(((b = this._animationOptions[_]) == null ? void 0 : b.speed) || 1), x.play(), x.enabled = !1, x;
      });
    }
    const h = i.__loadingModels;
    if (delete i.__loadingModels, i.modelsID !== h) return this._loadBatchedGeometries(i);
  }
  _uploadBuffersPerFrame() {
    if (this._buffersToUpload.length === 0) return;
    const i = this._buffersToUpload[0],
      s = i[0],
      a = s === this._localObject,
      o = i[1],
      l = o[0],
      h = l[0] === "index" ? this.geometry.getIndex() : this.geometry.getAttribute(l[0]),
      d = a ? 1 / 0 : 512,
      p = Math.min(l[2], d);
    if (h.addUpdateRange(l[1], p), h.needsUpdate = !0, l[2] -= p, l[2] <= 0) {
      if (o.shift(), o.length === 0) {
        const f = this._buffersToUpload.indexOf(i);
        f !== -1 && this._buffersToUpload.splice(f, 1), !a && !s.isBeingRemoved && scope.createTween(s.scale, {
          to: {
            x: 1,
            y: 1,
            z: 1
          },
          ease: "power2.out",
          duration: .35
        });
      } else a && this._uploadBuffersPerFrame();
    } else l[1] += p;
  }
  _updateAnimations(i, s = 1, a = 1) {
    const o = i.animationProps.weights,
      l = scope.math.efit(i.velocityHorizontal, .001, .075, 0, 1);
    o[0] = Mt.secureLerp(scope.math.lerp(o[0], scope.math.fit(l, 0, 1, 1, 0), s)), o[2] = Mt.secureLerp(scope.math.lerp(o[2], scope.math.fit(l, 1.8, 2.1, 0, 1), a)), o[1] = 1 - o[2];
    const c = 1 - o[0];
    o[1] *= c, o[2] *= c;
    const h = i.userData.medium === this.MEDIUMS.AIR;
    o[3] = Mt.secureLerp(scope.math.lerp(o[3], h ? 1 : 0, s));
    const d = this._animationsWhileInAir ? !0 : !h;
    for (let x = 4; x < o.length; x++) {
      const b = d && i.userData.animation === x;
      o[x] = Mt.secureLerp(scope.math.lerp(o[x], b ? 1 : 0, a));
    }
    if (!i._inFrustumOfLocalCharacter || i._distanceToLocalCharacter > Mt.UPDATE_DISTANCE) return;
    const p = scope.math.fit(i._distanceToLocalCharacter, Mt.UPDATE_DISTANCE * .1, Mt.UPDATE_DISTANCE, 0, Mt.UPDATE_DISTANCE_MULT);
    if (scope.renderInfo.time - i.animationProps.lastUpdate < p || (i.animationProps.lastUpdate = scope.renderInfo.time, !i.animationProps.mixer)) return;
    i.animationProps.actions.forEach((x, b) => {
      let T = 0;
      for (let D = o.length - 1; D > Math.max(2, b); D--) T += o[D];
      const M = 1 - scope.math.clamp(T, 0, 1),
        w = o[b] * M;
      x.enabled = w > 0, x.setEffectiveWeight(w);
    }), i.animationProps.mixer.setTime(scope.renderInfo.time + i.animationProps.offset);
    const f = i.animationProps.mixer._root;
    f.children.forEach(x => x.updateMatrixWorld());
    const _ = i.batchedIndex * this._boneTexture.image.width * 4;
    for (let x = 0; x < f.skeleton.bones.length; x++) scope.L(this, scope.rr).multiplyMatrices(f.skeleton.bones[x].matrixWorld, f.skeleton.boneInverses[x]), scope.L(this, scope.rr).toArray(this._boneTexture.image.data, _ + x * 16);
  }
  _updateMultiDrawAndTextures() {
    const i = this.geometry.getIndex().array.BYTES_PER_ELEMENT;
    let s = 0;
    for (let a = 0; a < this._instanceInfo.length; a++) if (this._instanceInfo[a].visible && this._instanceInfo[a].active) {
      const o = this._instanceInfo[a].geometryIndex,
        l = this._geometryInfo[o];
      this._multiDrawStarts[s] = l.start * i, this._multiDrawCounts[s] = l.count, this._indirectTexture.image.data[s] = a, s++;
    }
    this._multiDrawCount = s, this._indirectTexture.needsUpdate = !0, this._matricesTexture.needsUpdate = !0, this._boneTexture.needsUpdate = !0;
  }
  setGeometryAt(i, s) {
    const a = s.getIndex(),
      o = this._geometryInfo[i];
    if (a.count > o.reservedIndexCount || s.attributes.position.count > o.reservedVertexCount) throw new Error("BatchedMesh: Reserved space not large enough for provided geometry.");
    const l = o.vertexStart;
    o.vertexCount = s.getAttribute("position").count;
    for (const d in this.geometry.attributes) {
      const p = s.getAttribute(d),
        f = this.geometry.getAttribute(d);
      f.array.set(p.array, l * f.itemSize);
    }
    const c = this.geometry.getIndex(),
      h = o.indexStart;
    o.indexCount = s.getIndex().count;
    for (let d = 0; d < a.count; d++) c.setX(h + d, l + a.getX(d));
    return o.start = o.indexStart, o.count = o.indexCount, o.boundingBox === null && (o.boundingBox = new scope.Box3()), o.boundingSphere === null && (o.boundingSphere = new scope.Sphere()), o.boundingBox.copy(s.boundingBox), o.boundingSphere.copy(s.boundingSphere), i;
  }
  dispose() {
    super.dispose(), this._geoWorker.terminate(), this._boneTexture.dispose(), this._boneTexture = null;
  }
};
}
