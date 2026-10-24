/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1144875:1153442.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1668(scope) {
scope.batchedGPU = class batchedGPU extends scope.BatchedMesh {
  constructor(e = {}, i = {}) {
    const s = e.maxInstanceCount || 256,
      a = e.maxVertexCount || 4,
      o = e.maxIndexCount || 2,
      l = e.material;
    super(s, s * a, s * a * o, l || new scope.ShaderMaterial({
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
                    flat varying float vScale;
                    flat varying float vRand;
                    varying vec2 vHighPrecisionZW;

                    void main() {
                        vUv = uv;

                        int batchID = int(getIndirectIndex(gl_DrawID));
                        vec4 info1 = getInfo(tTexture1, batchID);
                        vec3 offset = info1.rgb;
                        float life = info1.a;

                        vScale = smoothstep(0.0, 0.15, life) * smoothstep(1.0, 0.7, life);

                        vec4 wPos = billboardModelMatrix(offset) * vec4(position * vScale, 1.0);

                        gl_Position = projectionMatrix * viewMatrix * wPos;
                        vHighPrecisionZW = gl_Position.zw;

                        vec4 info2 = getInfo(tTexture2, batchID);
                        vRand = info2.a;
                    }
                `,
      fragmentShader: `
                    layout(location = 1) out highp vec4 gInfo;

                    ${scope.encoding_default}

                    varying vec2 vUv;
                    flat varying float vScale;
                    flat varying float vRand;
                    varying vec2 vHighPrecisionZW;

                    void main() {
                        if (vScale < 0.001) discard;

                        gl_FragColor = vec4(vec3(1.0), vRand);
                        gInfo = vec4(1.0 - (0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5), vec2(0.0), 1.0);
                    }
                `
    })), this.material.uniforms.batchingTexture && (this.material.uniforms.batchingTexture.value = this._matricesTexture), this.material.uniforms.batchingIdTexture && (this.material.uniforms.batchingIdTexture.value = this._indirectTexture), this.isBatchedGPU = !0, this.name = "BatchedGPU", this.visible = !1, this.frustumCulled = !1, this.perObjectFrustumCulled = !1, this.sortObjects = !1, this._onSpawn = e.onSpawn || null, this._onDeath = e.onDeath || null, this._pixelsPerInstance = i.pixelsPerInstance || 3;
    const c = scope.math.getTextureSizeParticles(s, this._pixelsPerInstance),
      h = new Float32Array(c * c * 4);
    if (this._simInitTexture = new scope.DataTexture(h, c, c, scope.RGBAFormat, scope.FloatType), this._resetSimTexture = i.resetSimTexture !== !1, this.simulation = new scope.GPUSim({
      count: s,
      textures: i.textures || 1,
      initialTextures: i.initialTextures,
      material: i.material || new scope.ShaderMaterial({
        uniformsGroups: [scope.global$1.UBO],
        uniforms: {
          tSimInit: {
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
                    void main() {
                        gl_Position = vec4(position, 1.0);
                    }
                `,
        fragmentShader: `
                    #define outPos pc_fragColor
                    uniform sampler2D tTexture1;

                    layout(location = 1) out highp vec4 outVel;
                    uniform sampler2D tTexture2;

                    layout(location = 2) out highp vec4 outData;
                    uniform sampler2D tTexture3;

                    uniform sampler2D tSimInit;

                    ${scope.globalUBO_default}
                    ${scope.lerpfriction_default}
                    ${scope.base_default}

                    void main() {
                        ivec2 uv = ivec2(gl_FragCoord.xy);

                        vec4 data1 = texelFetch(tTexture1, uv, 0);
                        vec4 data2 = texelFetch(tTexture2, uv, 0);
                        vec4 data3 = texelFetch(tTexture3, uv, 0);

                        vec3 position = data1.xyz;
                        float life = data1.w;
                        vec3 velocity = data2.xyz;
                        float random = data2.w;
                        vec3 up = data3.xyz;

                        // get particle id and index on emitting texture
                        int tsize = textureSize(tTexture1, 0).x;
                        int particleid = uv.y * tsize + uv.x;
                        int emitSize = textureSize(tSimInit, 0).x;
                        int indexEmitting = particleid * 3;
                        ivec2 emittinguv = ivec2(indexEmitting % emitSize, indexEmitting / emitSize);
                        vec4 simInit1 = texelFetch(tSimInit, emittinguv, 0);

                        if (simInit1.w > 0.0) {
                            // particle needs to spawn. get all info from spawn
                            vec4 simInit2 = texelFetch(tSimInit, emittinguv + ivec2(1, 0), 0);
                            vec4 simInit3 = texelFetch(tSimInit, emittinguv + ivec2(2, 0), 0);

                            position = simInit1.xyz;
                            life = simInit1.w;
                            velocity = simInit2.xyz;
                            random = simInit2.w;
                            data3 = simInit3;
                        } else if (life > 0.0) {
                            // substract life
                            life -= 0.01 * dtRatio;

                            // add upward force to velocity
                            velocity += up * 0.00075 * dtRatio;

                            // add curl noise
                            vec3 curl = BitangentNoise4D(vec4(vec3(position * 1.15 + random * 20.23), time * 0.2));
                            velocity += curl * 0.0005 * dtRatio;

                            // add friction
                            velocity *= frictionFPS(0.9, dtRatio);

                            // add to position
                            position += velocity * dtRatio;
                        }

                        outPos = vec4(position, life);
                        outVel = vec4(velocity, random);
                        outData = data3;
                    }
                `
      }),
      afterCompute: i.afterCompute
    }), this.simulation.computationMaterial.uniforms.tSimInit ? this.simulation.computationMaterial.uniforms.tSimInit.value = this._simInitTexture : this.visible = !0, i.autoCompute !== !1) {
      const d = this.onBeforeRender.bind(this);
      this.onBeforeRender = (p, f, _, x, b, T) => {
        var w;
        if (d(p, f, _, x, b, T), scope.miscutils.hasRunThisFrame(this) || (this.simulation.compute({
          mesh: this,
          camera: _
        }), !this.simulation.computationMaterial.uniforms.tSimInit)) return;
        this._resetSimTexture && (this._simInitTexture.image.data.fill(0, 0), this._simInitTexture.needsUpdate = !0);
        let M = !1;
        for (let D = 0; D < this._instanceInfo.length; D++) {
          const R = this._instanceInfo[D];
          R.active && (R.expiration && R.expiration < scope.renderInfo.time ? (this.deleteInstance(D), (w = this._onDeath) == null || w.call(this, D)) : M = !0);
        }
        M || (this.visible = !1);
      };
    }
    this.simulation.compute();
  }
  spawn(e = {}) {
    var a, o;
    if (this._instanceInfo.length >= this.maxInstanceCount) return -1;
    const i = this.addInstance(e.geometryID || 0);
    this._instanceInfo[i].expiration = scope.renderInfo.time + (e.expiration || 1);
    const s = [];
    return (a = e.data) == null || a.forEach(l => {
      typeof l == "number" ? s.push(l) : Array.isArray(l) && s.push(...l);
    }), this._simInitTexture.image.data.set(s, i * this._pixelsPerInstance * 4), this._simInitTexture.needsUpdate = !0, this.visible = !0, (o = this._onSpawn) == null || o.call(this, i), i;
  }
  dispose() {
    super.dispose(), this._simInitTexture.dispose(), this._simInitTexture = null, this.simulation.dispose(), this.simulation = null;
  }
};
}
