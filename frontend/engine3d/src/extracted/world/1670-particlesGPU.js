/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1153795:1164206.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1670(scope) {
scope.particlesGPU = function particlesGPU(r) {
  var e, Eo, Va, To, Mo, Io, c;
  return c = class extends r {
    constructor(d = {}, p = {}) {
      super(d.geometry, d.material || new scope.ShaderMaterial({
        uniforms: {
          instancingIdTexture: {
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
                        #if !defined(USE_INSTANCING)
                            #define gl_InstanceID _gl_InstanceID
                            attribute int _gl_InstanceID;
                        #endif

                        ${scope.matrixutils_default}

                        uniform sampler2D tTexture1;
                        uniform sampler2D tTexture2;
                        uniform sampler2D tTexture3;

                        uniform highp usampler2D instancingIdTexture;

                        vec4 getInfo(const in sampler2D map, const in int i) {
                            int size = textureSize(map, 0).x;
                            return texelFetch(map, ivec2(i % size, i / size), 0);
                        }

                        float getIndirectIndex(const in int i) {
                            int size = textureSize(instancingIdTexture, 0).x;
                            return float(texelFetch(instancingIdTexture, ivec2(i % size, i / size), 0).r);
                        }

                        varying vec2 vUv;
                        flat varying float vScale;
                        flat varying float vRand;
                        varying vec2 vHighPrecisionZW;

                        void main() {
                            vUv = uv;

                            int instanceID = int(getIndirectIndex(gl_InstanceID));
                            vec4 info1 = getInfo(tTexture1, instanceID);
                            vec3 offset = info1.rgb;
                            float life = info1.a;

                            vScale = smoothstep(0.0, 0.15, life) * smoothstep(1.0, 0.7, life);

                            vec4 wPos = billboardModelMatrix(offset) * vec4(position * vScale, 1.0);

                            gl_Position = projectionMatrix * viewMatrix * wPos;
                            vHighPrecisionZW = gl_Position.zw;

                            vec4 info2 = getInfo(tTexture2, instanceID);
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
      }), d.count);
      scope.oe(this, e);
      this.isParticlesGPU = !0, this.name = "ParticlesGPU", this.visible = !1, this.particlesCount = d.count, this.frustumCulled = !1, this._onSpawn = d.onSpawn || null, this._onDeath = d.onDeath || null, this._instanceInfo = [], this._availableInstanceIds = [], this._pixelsPerInstance = p.pixelsPerInstance || 1;
      const f = scope.math.getTextureSizeParticles(this.particlesCount, 1),
        _ = new Uint32Array(f * f);
      this._indirectTexture = new scope.DataTexture(_, f, f, scope.RedIntegerFormat, scope.UnsignedIntType), this.material.uniforms.instancingIdTexture && (this.material.uniforms.instancingIdTexture.value = this._indirectTexture);
      const x = scope.math.getTextureSizeParticles(this.particlesCount, this._pixelsPerInstance),
        b = new Float32Array(x * x * 4);
      if (this._simInitTexture = new scope.DataTexture(b, x, x, scope.RGBAFormat, scope.FloatType), this._resetSimTexture = p.resetSimTexture !== !1, this.simulation = new scope.GPUSim({
        count: this.particlesCount,
        textures: p.textures || 1,
        initialTextures: p.initialTextures,
        material: p.material || new scope.ShaderMaterial({
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
        afterCompute: p.afterCompute
      }), this.simulation.computationMaterial.uniforms.tSimInit ? (this.simulation.computationMaterial.uniforms.tSimInit.value = this._simInitTexture, this.isPoints && d.geometry.setAttribute("_gl_InstanceID", new scope.BufferAttribute(new Int32Array(Array.from({
        length: this.particlesCount
      }, (T, M) => M)), 1))) : this.visible = !0, p.autoCompute !== !1) {
        const T = this.onBeforeRender.bind(this);
        this.onBeforeRender = (M, w, D, R, P, U) => {
          var N;
          if (T(M, w, D, R, P, U), scope.miscutils.hasRunThisFrame(this) || (this.simulation.compute({
            mesh: this,
            camera: D
          }), !this.simulation.computationMaterial.uniforms.tSimInit)) return;
          this._resetSimTexture && (this._simInitTexture.image.data.fill(0, 0), this._simInitTexture.needsUpdate = !0);
          let O = !1;
          for (let H = 0; H < this._instanceInfo.length; H++) {
            const F = this._instanceInfo[H];
            F.active && (F.expiration && F.expiration < scope.renderInfo.time ? (scope.Ee(this, e, Mo).call(this, H), (N = this._onDeath) == null || N.call(this, H)) : O = !0);
          }
          O || (this.visible = !1), scope.Ee(this, e, Io).call(this);
        };
      }
      this.simulation.compute();
    }
    spawn(d = {}) {
      var _, x;
      if (this._instanceInfo.length >= this.particlesCount) return -1;
      const p = scope.Ee(this, e, To).call(this, scope.renderInfo.time + (d.expiration || 1)),
        f = [];
      return (_ = d.data) == null || _.forEach(b => {
        typeof b == "number" ? f.push(b) : Array.isArray(b) && f.push(...b);
      }), this._simInitTexture.image.data.set(f, p * this._pixelsPerInstance * 4), this._simInitTexture.needsUpdate = !0, this.visible = !0, (x = this._onSpawn) == null || x.call(this, p), p;
    }
    setVisibleAt(d, p) {
      scope.Ee(this, e, Va).call(this, d), this._instanceInfo[d].visible = p;
    }
    dispose() {
      var d;
      this._indirectTexture.dispose(), this._indirectTexture = null, this._simInitTexture.dispose(), this._simInitTexture = null, this.simulation.dispose(), this.simulation = null, (d = super.dispose) == null || d.call(this);
    }
  }, e = new WeakSet(), Eo = function (d, p) {
    return d - p;
  }, Va = function (d) {
    if (d < 0 || d >= this._instanceInfo.length || this._instanceInfo[d].active === !1) throw new Error(`particlesGPU: Invalid instanceId ${d}. Instance is either out of range or has been deleted.`);
  }, To = function (d = 1 / 0) {
    if (this._instanceInfo.length >= this.particlesCount && this._availableInstanceIds.length === 0) throw new Error("particlesGPU: Maximum item count reached.");
    const f = {
      visible: !0,
      active: !0,
      expiration: d
    };
    let _ = null;
    return this._availableInstanceIds.length > 0 ? (this._availableInstanceIds.sort(scope.Ee(this, e, Eo)), _ = this._availableInstanceIds.shift(), this._instanceInfo[_] = f) : (_ = this._instanceInfo.length, this._instanceInfo.push(f)), _;
  }, Mo = function (d) {
    scope.Ee(this, e, Va).call(this, d), this._instanceInfo[d].active = !1, this._availableInstanceIds.push(d);
  }, Io = function () {
    let d = 0;
    for (let p = 0; p < this._instanceInfo.length; p++) {
      const f = this._instanceInfo[p];
      !f.active || !f.visible || (this._indirectTexture.image.data[d] = p, d++);
    }
    this._indirectTexture.needsUpdate = !0, d = Math.max(1, d), this.isPoints ? this.geometry.setDrawRange(0, d) : this.count = d;
  }, c;
};
}
