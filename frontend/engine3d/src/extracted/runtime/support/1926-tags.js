/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1423410:1430718.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1926(scope) {
scope.tags = class tags extends scope.BatchedMesh {
  constructor(i, s) {
    var d;
    const a = typeof s.tagsMaxLetters == "number" ? s.tagsMaxLetters : 13,
      o = i.MAX_CHARS * a;
    super(i.MAX_CHARS, i.MAX_CHARS * o * 4, i.MAX_CHARS * o * 6, s.tagsMaterial || new scope.ShaderMaterial({
      uniforms: {
        uColor: {
          value: new scope.Color()
        },
        uFadeDistance: {
          value: 100
        },
        tMap: {
          value: null
        },
        uShow: {
          value: 1
        },
        batchingTexture: {
          value: null
        },
        batchingIdTexture: {
          value: null
        }
      },
      vertexShader: `
                #if ! defined(GL_ANGLE_multi_draw)
                    #define gl_DrawID _gl_DrawID
                    uniform int _gl_DrawID;
                #endif
                uniform highp sampler2D batchingTexture;
                uniform highp usampler2D batchingIdTexture;

                vec4 getBatchingPositionScale(const in int i) {
                    int size = textureSize(batchingTexture, 0).x;
                    return texelFetch(batchingTexture, ivec2(i % size, i / size), 0);
                }

                float getIndirectIndex(const in int i) {
                    int size = textureSize(batchingIdTexture, 0).x;
                    int x = i % size;
                    int y = i / size;
                    return float(texelFetch(batchingIdTexture, ivec2(x, y), 0).r);
                }

                ${scope.matrixutils_default}

                varying vec2 vUv;
                varying vec3 vPos;
                varying vec3 wPos;
                varying vec2 vHighPrecisionZW;
                varying float vDist;

                void main() {
                    vUv = uv;

                    vec4 posScale = getBatchingPositionScale(int(getIndirectIndex(gl_DrawID)));
                    wPos = (billboardModelMatrix(posScale.xyz) * vec4(position * posScale.w, 1.0)).xyz;
                    vPos = (viewMatrix * vec4(wPos, 1.0)).xyz;
                    vDist = distance(wPos, cameraPosition);

                    gl_Position = projectionMatrix * vec4(vPos, 1.0);
                    vHighPrecisionZW = gl_Position.zw;
                }
            `,
      fragmentShader: `
                layout(location = 1) out highp vec4 gInfo;

                uniform sampler2D tMap;
                uniform vec3 uColor;
                uniform float uFadeDistance;
                uniform float uShow;

                ${scope.msdf_default}

                varying vec2 vUv;
                varying vec3 vPos;
                varying vec3 wPos;
                varying vec2 vHighPrecisionZW;
                varying float vDist;

                float sphereFade(vec3 p, float size, float amount) {
                    float h = size * 0.5;
                    return clamp(1.0 - step(amount * 1.85, length(mod(p, size) - h) / h), 0.0, 1.0);
                }

                void main() {
                    float alpha = msdfOpaque(tMap, vUv);
                    alpha *= sphereFade(wPos, 0.1, smoothstep(uFadeDistance, uFadeDistance * 0.8, vDist) * uShow);

                    if (alpha == 0.0) discard;

                    gl_FragColor = vec4(uColor, 0.0);
                    gInfo = vec4(1.0 - (0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5), vec3(0.0));
                }
            `
    }));
    scope.oe(this, scope.ua, new scope.Object3D());
    scope.oe(this, scope.or, new scope.Vector3());
    scope.oe(this, scope.ha, new scope.Vector3());
    const l = scope.math.getTextureSizeParticles(this.maxInstanceCount),
      c = new Float32Array(l * l * 4);
    this._matricesTexture.dispose(), this._matricesTexture = new scope.DataTexture(c, l, l, scope.RGBAFormat, scope.FloatType), this.material.uniforms.batchingTexture.value = this._matricesTexture, this.material.uniforms.batchingIdTexture.value = this._indirectTexture;
    const h = new scope.BufferGeometry();
    h.setAttribute("position", new scope.BufferAttribute(new Float32Array(o * 4 * 3), 3).setUsage(scope.DynamicDrawUsage)), h.setAttribute("uv", new scope.BufferAttribute(new Float32Array(o * 4 * 2), 2).setUsage(scope.DynamicDrawUsage)), h.setIndex(new scope.BufferAttribute(new Uint16Array(o * 6), 1).setUsage(scope.DynamicDrawUsage)), this._initializeGeometry(h);
    for (const p in this.geometry.attributes) this.geometry.attributes[p].setUsage(scope.DynamicDrawUsage);
    this.geometry.getIndex().setUsage(scope.DynamicDrawUsage);
    for (let p = 0; p < this.maxInstanceCount; p++) {
      const f = this.addGeometry(h),
        _ = this.addInstance(f);
      this._instanceInfo[_].active = !1, this._instanceInfo[_].visible = !1;
    }
    this.isCharacterTags = !0, this.name = "tags", this.frustumCulled = !1, this.perObjectFrustumCulled = !1, this.boundingBox = new scope.Box3(), this.boundingSphere = new scope.Sphere(), this.sortObjects = !1, this.renderOrder = 1e3, this.receiveShadow = !1, this.castShadow = !1, this.matrixWorldAutoUpdate = !1, this._characters = i, this._tagsMaxLetters = a, this._totalTagsLetters = o, this._tagsMaxDistance = typeof s.tagsMaxDistance == "number" ? s.tagsMaxDistance : 20, this._tagsSkipOwn = s.tagsSkipOwn || !1, this._tagsVerticalOffset = typeof s.tagsVerticalOffset == "number" ? s.tagsVerticalOffset : .1, this._tagsLocalLast = "", this._tagsFont = s.tagsFont || "monospace", this._tagsSize = typeof s.tagsSize == "number" ? s.tagsSize : .25, this._tagsLineHeight = typeof s.tagsLineHeight == "number" ? s.tagsLineHeight : 1, this._tagsLetterSpacing = typeof s.tagsLetterSpacing == "number" ? s.tagsLetterSpacing : 0, this._tagsColor = new scope.Color(s.tagsColor || "#ffffff"), this.material.uniforms.tMap && (this.material.uniforms.tMap.value = scope.textureLoader.load(`../fonts/${this._tagsFont}-datatexture.ktx2`, "data")), this.material.uniforms.uFadeDistance && (this.material.uniforms.uFadeDistance.value = this._tagsMaxDistance), this.material.uniforms.uColor && this.material.uniforms.uColor.value.copy(this._tagsColor), this._setTag(((d = s.initialData) == null ? void 0 : d.tag) || ""), scope.events$1.on("character_tag_set", this._setTag, this), this._characters.add(this);
  }
  _setTag(i = "") {
    let s = i.replace(/[^\x00-\x7F]/g, "").trim();
    s.length > this._tagsMaxLetters && (s = `${s.slice(0, this._tagsMaxLetters - 3).trim()}...`), this._tagsLocalLast !== s && (this._tagsLocalLast = s, Promise.resolve().then(a => {
      this._tagsLocalLast === s && (this._characters._localObject.userData.tag = s);
    }).catch(a => {
      this._tagsLocalLast === s && (this._characters._localObject.userData.tag = "");
    }));
  }
  _update() {
    for (let i = 0; i < this.maxInstanceCount; i++) this._instanceInfo[i].active = !1, this._instanceInfo[i].visible = !1;
    this._characters._charactersObjects.forEach(i => {
      i._tagData && (this._instanceInfo[i.batchedIndex].active = !0), !(this._tagsSkipOwn && i === this._characters._localObject || !i._inFrustumOfLocalCharacter || i._distanceToLocalCharacter > this._tagsMaxDistance) && (i._tagData || (i._tagData = {
        lastTag: "",
        validGeometry: !1
      }, this._instanceInfo[i.batchedIndex].active = !0), i._tagData.lastTag !== i.userData.tag && (i._tagData.lastTag = i.userData.tag, scope.geometryLoader.msdf({
        text: i._tagData.lastTag,
        font: this._tagsFont,
        size: this._tagsSize,
        lineHeight: this._tagsLineHeight,
        letterSpacing: this._tagsLetterSpacing,
        align: "center"
      }).then(s => {
        i._tagData.validGeometry = s.attributes.position && s.attributes.position.count > 0;
        const a = i.batchedIndex;
        this.setGeometryAt(a, s);
      })), i._tagData.validGeometry && (this._instanceInfo[i.batchedIndex].visible = !0, scope.L(this, scope.or).copy(i.position).add(scope.L(this, scope.ha).copy(i.up).multiplyScalar(this._characters._geometryInfo[i.batchedIndex].boundingSphere.radius + this._tagsVerticalOffset)), scope.L(this, scope.ua).position.copy(scope.L(this, scope.or)).toArray(this._matricesTexture.image.data, i.batchedIndex * 4), this._matricesTexture.image.data[i.batchedIndex * 4 + 3] = i.scale.x));
    }), this._matricesTexture.needsUpdate = !0, this._visibilityChanged = !0;
  }
  dispose() {
    super.dispose(), scope.events$1.off("character_tag_set", this._setTag, this);
  }
};
}
