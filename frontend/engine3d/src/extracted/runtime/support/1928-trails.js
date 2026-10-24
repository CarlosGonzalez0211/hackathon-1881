/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1430827:1439622.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1928(scope) {
scope.trails = class trails {
  constructor(e, i) {
    scope.oe(this, scope.$n);
    scope.oe(this, scope.ki, new scope.Vector3());
    scope.oe(this, scope.lr, new scope.Vector3());
    scope.oe(this, scope.cr, new scope.Vector3());
    scope.oe(this, scope.ur, new scope.Vector3());
    scope.oe(this, scope.wi, {
      DEFAULT: 1,
      LAND: 2
    });
    scope.oe(this, scope.Ei, null);
    scope.oe(this, scope.hr, 15);
    scope.oe(this, scope.dr, .055);
    scope.oe(this, scope.fr, 1 / 0);
    scope.oe(this, scope.Hn, 2);
    scope.oe(this, scope.pr, 0);
    scope.oe(this, scope.mr, .5);
    scope.oe(this, scope.gr, .5);
    scope.oe(this, scope.vr, .75);
    scope.oe(this, scope.Ar, 0);
    scope.oe(this, scope.xr, .115);
    scope.oe(this, scope.Qn, new Map());
    scope.Ye(this, "particles", null);
    scope.ze(this, scope.Ei, e), scope.ze(this, scope.hr, typeof i.trailsMaxDistance == "number" ? i.trailsMaxDistance : 15), scope.ze(this, scope.dr, typeof i.trailsMinVelocity == "number" ? i.trailsMinVelocity : .055), scope.ze(this, scope.fr, typeof i.trailsMaxVelocity == "number" ? i.trailsMaxVelocity : 1 / 0), scope.ze(this, scope.Hn, typeof i.trailsParticlesPerCharacter == "number" ? i.trailsParticlesPerCharacter : 2), scope.ze(this, scope.pr, scope.L(this, scope.Ei).MAX_CHARS * scope.L(this, scope.Hn)), scope.ze(this, scope.gr, typeof i.trailsBirthRate == "number" ? i.trailsBirthRate : .5), scope.ze(this, scope.mr, typeof i.trailsBirthChance == "number" ? i.trailsBirthChance : .5), scope.ze(this, scope.vr, typeof i.trailsExpiration == "number" ? i.trailsExpiration : .75), scope.ze(this, scope.Ar, typeof i.trailsVerticalOffset == "number" ? i.trailsVerticalOffset : 0), scope.ze(this, scope.xr, typeof i.trailsFootSpacing == "number" ? i.trailsFootSpacing : .115), this.particles = scope.particlesGPU$1({
      geometry: "points",
      onDeath: scope.Ee(this, scope.$n, scope.Bo).bind(this),
      count: scope.L(this, scope.pr),
      material: new scope.ShaderMaterial({
        userData: {
          hotReload: "trails"
        },
        uniformsGroups: [scope.global$1.UBO],
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
          tNoise: {
            value: scope.textureLoader.load("trails-noise.ktx2", "linearfilter-repeat")
          },
          uSize: {
            value: 300
          },
          uColor: {
            value: new scope.Color("#7c7c7c")
          }
        },
        vertexShader: `
                    #if !defined(USE_INSTANCING)
                        #define gl_InstanceID _gl_InstanceID
                        attribute int _gl_InstanceID;
                    #endif

                    uniform sampler2D tTexture1;
                    uniform sampler2D tTexture2;
                    uniform highp usampler2D instancingIdTexture;
                    uniform float uSize;

                    ${scope.globalUBO_default}
                    ${scope.fit_default}

                    vec4 getInfo(const in sampler2D map, const in int i) {
                        int size = textureSize(map, 0).x;
                        return texelFetch(map, ivec2(i % size, i / size), 0);
                    }

                    float getIndirectIndex(const in int i) {
                        int size = textureSize(instancingIdTexture, 0).x;
                        return float(texelFetch(instancingIdTexture, ivec2(i % size, i / size), 0).r);
                    }

                    flat varying float vScale;
                    flat varying float vRand;
                    varying vec2 vHighPrecisionZW;

                    void main() {
                        int instanceID = int(getIndirectIndex(gl_InstanceID));
                        vec4 info1 = getInfo(tTexture1, instanceID);
                        vec4 info2 = getInfo(tTexture2, instanceID);
                        vec3 offset = info1.rgb;
                        float life = info1.a;

                        vRand = fract(info2.a);
                        vScale = smoothstep(0.0, 0.4, life) * smoothstep(1.0, 0.8, life);
                        vScale *= fit(vRand, 0.0, 1.0, 0.75, 1.0);

                        vec4 wPos = vec4(offset + position * vScale, 1.0);
                        vec4 vPos = viewMatrix * wPos;
                        gl_Position = projectionMatrix * vPos;
                        vHighPrecisionZW = gl_Position.zw;

                        gl_PointSize = (uSize * vScale) / length(vPos.xyz) * (resolution.y / 1300.0);
                    }
                `,
        fragmentShader: `
                    layout(location = 1) out highp vec4 gInfo;

                    ${scope.encoding_default}

                    uniform sampler2D tNoise;
                    uniform vec3 uColor;

                    flat varying float vScale;
                    flat varying float vRand;
                    varying vec2 vHighPrecisionZW;

                    void main() {
                        vec2 uv = 2.0 * gl_PointCoord.xy - 1.0;
                        float dist = length(uv);
                        float alpha = smoothstep(0.7, 0.0, dist);

                        float noise = texture(tNoise, (uv + vRand * 6.43563) * 0.3).r;
                        float mask = alpha * noise;

                        if (mask < 0.4) discard;

                        gl_FragColor = vec4(uColor, vRand);
                        gInfo = vec4(1.0 - (0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5), vec2(0.0), 1.0);
                    }
                `
      })
    }, {
      textures: 3,
      pixelsPerInstance: 3,
      material: new scope.ShaderMaterial({
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
                            life -= 0.04 * dtRatio;

                            // add gravity
                            velocity -= up * 0.0025 * dtRatio;

                            // add friction
                            velocity *= frictionFPS(0.8, dtRatio);

                            // add to position
                            position += velocity * dtRatio;
                        }

                        outPos = vec4(position, life);
                        outVel = vec4(velocity, random);
                        outData = data3;
                    }
                `
      })
    }), this.particles.name = "trails", this.particles.renderOrder = 1e3, this.particles.receiveShadow = !1, this.particles.castShadow = !1, scope.L(this, scope.Ei).add(this.particles);
  }
  update() {
    scope.L(this, scope.Ei)._charactersObjects.forEach((e, i) => {
      if (!e._inFrustumOfLocalCharacter || e._distanceToLocalCharacter > scope.L(this, scope.hr) || e.scale.x < 1) return;
      e._trailsData || (e._trailsData = {
        particleCnt: 0,
        lastBirth: 0,
        lastSide: -1,
        lastMedium: e.userData.medium
      });
      const s = e.userData.medium === scope.L(this, scope.Ei).MEDIUMS.GROUND && e._trailsData.lastMedium !== scope.L(this, scope.Ei).MEDIUMS.GROUND;
      e._trailsData.lastMedium = e.userData.medium;
      const a = e._trailsData.particleCnt,
        o = e._trailsData.lastBirth;
      a < scope.L(this, scope.Hn) && (i === scope.L(this, scope.Ei).LOCAL_ID && s ? scope.Ee(this, scope.$n, scope.Wa).call(this, e, Math.min(2, scope.L(this, scope.Hn) - a), scope.L(this, scope.wi).LAND) : o < scope.renderInfo.time - scope.L(this, scope.gr) && e.userData.medium === scope.L(this, scope.Ei).MEDIUMS.GROUND && e.userData.animation === 0 && e.velocityHorizontal > scope.L(this, scope.dr) && e.velocityHorizontal < scope.L(this, scope.fr) && scope.Ee(this, scope.$n, scope.Wa).call(this, e, 1, scope.L(this, scope.wi).DEFAULT));
    });
  }
};
}
