/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1617525:1630189.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2050(scope) {
scope.emojis$1 = class {
  constructor({
    scene: e,
    characters: i
  } = {}) {
    this.scene = e, this.characters = i, this.ready = scope.miscutils.deferred(), this.numEmojis = 10, this.maxDistance = 20, this.rateLimit = .35, this.init();
  }
  async init() {
    this.mesh = new scope.batchedGPU({
      maxInstanceCount: 64,
      maxVertexCount: 300,
      maxIndexCount: 4,
      material: new scope.ShaderMaterial({
        name: "emojis",
        lights: !0,
        userData: {
          hotReload: "emojis"
        },
        uniformsGroups: [scope.global$1.UBO],
        uniforms: {
          ...scope.UniformsUtils.clone(scope.UniformsLib.common),
          ...scope.UniformsUtils.clone(scope.UniformsLib.lights),
          batchingTexture: {
            value: null
          },
          batchingIdTexture: {
            value: null
          },
          tTexture1: {
            value: null
          },
          tTexture2: {
            value: null
          },
          tTexture3: {
            value: null
          },
          tAtlas: {
            value: scope.textureLoader.load("atlas.png", "srgb-nearest")
          },
          ...scope.fogUniforms
        },
        vertexShader: `
                /* BATCHING */
                #if ! defined(GL_ANGLE_multi_draw)
                    #define gl_DrawID _gl_DrawID
                    uniform int _gl_DrawID;
                #endif

                attribute int emoji;
                attribute float surfaceId;

                ${scope.matrixutils_default}
                ${scope.rotate_default}
                ${scope.globalUBO_default}

                uniform sampler2D tTexture1;
                uniform sampler2D tTexture2;
                uniform sampler2D tTexture3;

                uniform highp usampler2D batchingIdTexture;

                vec4 getInfo(const in sampler2D map, const in int i) {
                    int size = textureSize(map, 0).x;
                    return texelFetch(map, ivec2(i % size, i / size), 0);
                }

                float getIndirectIndex(const in int i) {
                    int size = textureSize(batchingIdTexture, 0).x;
                    return float(texelFetch(batchingIdTexture, ivec2(i % size, i / size), 0).r);
                }

                varying vec2 vUv;
                varying vec3 lPos;
                varying vec4 vPos;
                varying vec3 vNormal;
                flat varying vec3 vLightDir;
                flat varying float vScale;
                flat varying float vRand;
                flat varying float vSurfaceId;
                varying vec2 vHighPrecisionZW;

                // for light direction
                struct DirectionalLight {
                    vec3 direction;
                    vec3 color;
                };
                uniform DirectionalLight directionalLights[ 1 ];

                // for shadows
                #include <shadowmap_pars_vertex>
                vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
                    return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
                }

                void main() {
                    vUv = uv;
                    lPos = position;
                    vSurfaceId = surfaceId;

                    vLightDir = vec3(0.0);
                    #if NUM_DIR_LIGHTS > 0
                        vLightDir = normalize(directionalLights[0].direction);
                    #endif

                    int batchID = int(getIndirectIndex(gl_DrawID));
                    vec4 info1 = getInfo(tTexture1, batchID);
                    vec3 offset = info1.rgb;
                    float life = info1.a;

                    vec4 info2 = getInfo(tTexture2, batchID);
                    vRand = info2.a;

                    vec4 info3 = getInfo(tTexture3, batchID);
                    vec3 up = info3.rgb;

                    // tweak scale based on life
                    vScale = smoothstep(0.0, 0.15, life) * smoothstep(1.0, 0.7, life);

                    // rotate position according to the planet
                    mat4 planetRot = getMatrixRotation(viewMatrix);
                    vec3 pos = (vec4(position, 1.0) * planetRot).xyz;

                    // rotate around up vector
                    mat4 rot = rotation3D(up, time * 1.5 + (vRand + float(emoji)) * 32.2432);

                    // calculate world position and normal
                    vec3 wPos = offset + (rot * vec4(pos * vScale, 1.0)).xyz;
                    vNormal = normalize(normalMatrix * (rot * (vec4(normal, 0.0) * planetRot)).xyz);

                    vPos = viewMatrix * vec4(wPos, 1.0);

                    gl_Position = projectionMatrix * vPos;
                    vHighPrecisionZW = gl_Position.zw;

                    // this requires worldPosition and transformedNormal
                    vec3 transformedNormal = vNormal;
                    vec4 worldPosition = vec4(wPos, 1.0);
                    #include <shadowmap_vertex>
                }
            `,
        fragmentShader: `
                layout(location = 1) out highp vec4 gInfo;

                ${scope.encoding_default}
                ${scope.colorutils_default}
                ${scope.sinenoise_default}
                ${scope.fog_default}

                uniform sampler2D tEmojis;
                uniform sampler2D tAtlas;

                varying vec2 vUv;
                varying vec3 lPos;
                varying vec4 vPos;
                varying vec3 vNormal;
                flat varying vec3 vLightDir;
                flat varying float vScale;
                flat varying float vRand;
                flat varying float vSurfaceId;
                varying vec2 vHighPrecisionZW;

                // for shadows
                #include <packing>
                #include <shadowmap_pars_fragment>

                void main() {

                    vec3 geometryNormal = normalize(vNormal);
                    float light = dot(geometryNormal, normalize(vLightDir));

                    // shadow
                    float shadow = 0.0;
                    #if defined(USE_SHADOWMAP) && NUM_DIR_LIGHT_SHADOWS > 0
                        DirectionalLightShadow directionalLightShadow;
                        directionalLightShadow = directionalLightShadows[0];
                        shadow = getShadow(
                            directionalShadowMap[0],
                            directionalLightShadow.shadowMapSize,
                            directionalLightShadow.shadowIntensity,
                            directionalLightShadow.shadowBias,
                            directionalLightShadow.shadowRadius,
                            vDirectionalShadowCoord[0]
                        );
                    #endif

                    light = min(light, shadow);

                    // set color
                    vec3 color = texture2D(tAtlas, vUv).rgb;
                    vec3 colorShadow = rgb2hsv(color);
                    colorShadow.r -= 0.02;
                    colorShadow.b *= 0.5;
                    colorShadow = hsv2rgb(colorShadow);
                    float shadowCut = smoothstep(0.2, 0.4, light);
                    color = mix(colorShadow, color, shadowCut);

                    addFog(color, vPos.z);

                    gl_FragColor = vec4(color, vSurfaceId);

                    float outlineNoise = sinenoise1(lPos * 25.0 + vec3(3.324, 34.2, 56.343) * vRand) * 0.5 + 0.5;
                    float contribution = step(0.3, outlineNoise);
                    gInfo = vec4(1.0 - (0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5), encodeNormalSpheremap(geometryNormal), contribution);
                }
            `
      })
    }, {
      textures: 3
    }), this.mesh.customDepthMaterial = new scope.ShaderMaterial({
      uniforms: {
        batchingTexture: {
          value: null
        },
        batchingIdTexture: {
          value: null
        },
        tTexture1: {
          value: null
        },
        tTexture2: {
          value: null
        },
        tTexture3: {
          value: null
        }
      },
      vertexShader: `
                /* BATCHING */
                #if ! defined(GL_ANGLE_multi_draw)
                    #define gl_DrawID _gl_DrawID
                    uniform int _gl_DrawID;
                #endif

                ${scope.matrixutils_default}
                ${scope.rotate_default}
                ${scope.globalUBO_default}

                attribute int emoji;

                uniform sampler2D tTexture1;
                uniform sampler2D tTexture2;
                uniform sampler2D tTexture3;

                uniform highp usampler2D batchingIdTexture;

                vec4 getInfo(const in sampler2D map, const in int i) {
                    int size = textureSize(map, 0).x;
                    return texelFetch(map, ivec2(i % size, i / size), 0);
                }

                float getIndirectIndex(const in int i) {
                    int size = textureSize(batchingIdTexture, 0).x;
                    return float(texelFetch(batchingIdTexture, ivec2(i % size, i / size), 0).r);
                }

                varying vec2 vHighPrecisionZW;

                void main() {
                    int batchID = int(getIndirectIndex(gl_DrawID));
                    vec4 info1 = getInfo(tTexture1, batchID);
                    vec3 offset = info1.rgb;
                    float life = info1.a;

                    vec4 info2 = getInfo(tTexture2, batchID);
                    float randd = info2.a;

                    vec4 info3 = getInfo(tTexture3, batchID);
                    vec3 up = info3.rgb;

                    // tweak scale based on life
                    float scale = smoothstep(0.0, 0.15, life) * smoothstep(1.0, 0.7, life);

                    // rotate position according to the planet
                    mat4 planetRot = getMatrixRotation(viewMatrix);
                    vec3 pos = (vec4(position, 1.0) * planetRot).xyz;

                    // rotate around up vector
                    mat4 rot = rotation3D(up, time * 1.5 + (randd + float(emoji)) * 32.2432);

                    // calculate world position and normal
                    vec3 wPos = offset + (rot * vec4(pos * scale, 1.0)).xyz;

                    gl_Position = projectionMatrix * viewMatrix * vec4(wPos, 1.0);
                    vHighPrecisionZW = gl_Position.zw;
                }
            `,
      fragmentShader: `
                #include <packing>
                varying vec2 vHighPrecisionZW;
                void main() {
                    float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
                    gl_FragColor = packDepthToRGBA( fragCoordZ );
                }
            `
    }), this.mesh.name = "Emojis", this.mesh.castShadow = !0, this.mesh.receiveShadow = !0;
    const e = this.mesh.customDepthMaterial.uniforms,
      i = this.mesh.material.uniforms;
    this.scene.beforeRenderCbs.push(() => {
      e.batchingTexture.value = i.batchingTexture.value, e.batchingIdTexture.value = i.batchingIdTexture.value, e.tTexture1.value = i.tTexture1.value, e.tTexture2.value = i.tTexture2.value, e.tTexture3.value = i.tTexture3.value;
    }), (await Promise.all(Array.from({
      length: this.numEmojis
    }, (a, o) => scope.geometryLoader.load(`emojis/${o + 1}.drc`)))).forEach((a, o) => {
      const l = a.clone();
      l.setAttribute("emoji", new scope.BufferAttribute(new Int32Array(new Array(l.attributes.position.count).fill(o)), 1)), this.mesh.addGeometry(l);
    }), this.scene.add(this.mesh), scope.events$1.on("character_emoji_display", this.onCharacterEmojiDisplay, this), scope.events$1.on("character_network_event", this.onCharacterNetworkEvent, this), scope.events$1.on("keydown", this.onKeyDown, this), this.ready.resolve();
  }
  onKeyDown(e) {
    const i = parseInt(e.key);
    isNaN(i) || i < 0 || i > this.numEmojis || typeof scope.EMOJI_MAP[i] == "number" && scope.events$1.emit("character_emoji_display", scope.EMOJI_MAP[i]);
  }
  onCharacterEmojiDisplay(e = 0) {
    typeof e != "number" || e < 0 || this.characters._emitNetworkEvent(`emoji:${e}`);
  }
  onCharacterNetworkEvent({
    object: e,
    index: i,
    id: s,
    event: a
  }) {
    if (!a.startsWith("emoji")) return;
    const o = a.split(":");
    if (o.length !== 2) return;
    const l = parseInt(o[1]);
    if (typeof l != "number" || l < 0 || l >= this.numEmojis || !e || !e.position) return;
    const c = e.position.distanceTo(this.characters._localObject.position);
    if (c > this.maxDistance || (e.__lastEmojiShown || (e.__lastEmojiShown = -1), scope.renderInfo.time - e.__lastEmojiShown < this.rateLimit) || (e.__lastEmojiShown = scope.renderInfo.time, e.scale.x < 1)) return;
    const h = scope.math.mix(.8, 1, Math.random()),
      d = scope._v0$a.copy(e.position).addScaledVector(e.up, e.boundingSphere.radius * 1.05).toArray();
    e === this.characters._localObject && this.characters._setActive();
    const p = 3;
    c < p && (scope.events$1.emit("webgl_play_audio", `emoji-starts${Math.floor(Math.random() * 3) + 1}`), scope.createDelayedCall(1.4 * h, () => {
      scope._v0$a.fromArray(d).distanceTo(this.characters._localObject.position) < p && scope.events$1.emit("webgl_play_audio", `emoji-ends${Math.floor(Math.random() * 3) + 1}`);
    })), this.mesh.spawn({
      geometryID: l,
      expiration: 2,
      data: [d, h, scope._v0$a.copy(e.up).multiplyScalar(.02).toArray(), Math.random(), e.up.toArray()]
    });
  }
  dispose() {
    scope.events$1.off("character_emoji_display", this.onCharacterEmojiDisplay, this), scope.events$1.off("character_network_event", this.onCharacterNetworkEvent, this);
  }
};
}
