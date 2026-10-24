/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1240080:1250425.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1713(scope) {
scope.birds = class birds {
  constructor(e, i) {
    this.scene = e, this.ready = scope.miscutils.deferred(), this.options = {
      count: 23,
      groups: 6,
      curve: "birds/curve-1.drc",
      bird: "birds/1.drc",
      noise: .4,
      speed: 1.5,
      multiplier: 1,
      direction: 1,
      ...i
    }, this.init();
  }
  async init() {
    const e = scope.textureLoader.loadCurves(this.options.curve, !0, 1),
      [i] = await Promise.all([scope.geometryLoader.load(this.options.bird)]),
      s = this.options.count,
      a = scope.math.getTextureSizeParticles(s),
      o = new Float32Array(a * a * 4);
    for (let d = 3; d <= o.length; d += 4) o[d] = Math.random();
    const l = new scope.DataTexture(o, a, a, scope.RGBAFormat, scope.FloatType);
    l.needsUpdate = !0;
    const c = new Float32Array(a * a * 4);
    for (let d = 3; d <= c.length; d += 4) c[d] = Math.random();
    const h = new scope.DataTexture(c, a, a, scope.RGBAFormat, scope.FloatType);
    h.needsUpdate = !0, this.mesh = new scope.particlesGPU$1({
      count: s,
      geometry: i,
      material: new scope.ShaderMaterial({
        userData: {
          hotReload: "birds"
        },
        uniformsGroups: [scope.global$1.UBO],
        uniforms: {
          tTexture1: {
            value: null
          },
          tTexture1Prev: {
            value: null
          },
          tAtlas: {
            value: scope.textureLoader.load("atlas.png")
          },
          uLightPos: {
            value: new scope.Vector3()
          },
          uMultiplier: {
            value: this.options.multiplier
          },
          uShow: {
            value: 1
          },
          ...scope.fogUniforms
        },
        vertexShader: `
                    attribute float surfaceId;

                    ${scope.globalUBO_default}
                    ${scope.rotate_default}

                    uniform sampler2D tPosition;
                    uniform sampler2D tNormal;

                    uniform sampler2D tTexture1;
                    uniform sampler2D tTexture1Prev;

                    uniform vec3 uLightPos;
                    uniform float uMultiplier;
                    uniform float uShow;

                    varying vec2 vUv;
                    varying vec4 vPos;
                    varying vec3 vLDir;
                    varying vec3 vNormal;
                    varying vec2 vHighPrecisionZW;
                    flat varying float vSurfaceId;

                    mat2 rotate(float a) {
                        float s = sin(a);
                        float c = cos(a);
                        return mat2(c, s, -s, c);
                    }
                    vec3 hash31(float p) {
                        vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973));
                        p3 += dot(p3, p3.yzx+33.33);
                        return fract((p3.xxy+p3.yzz)*p3.zyx);
                        }

                    void main() {
                        vUv = uv;
                        vSurfaceId = fract(surfaceId + float(gl_InstanceID) * 5.435435);

                        int texWidth = textureSize(tTexture1, 0).x;
                        ivec2 texuv = ivec2(gl_InstanceID % texWidth, gl_InstanceID / texWidth);

                        vec4 currentOffset = texelFetch(tTexture1, texuv, 0);
                        vec4 prevOffset = texelFetch(tTexture1Prev, texuv, 0);

                        vec3 rand = hash31(float(gl_InstanceID));

                        vec3 pos = position * uShow;
                        float multiplier = uMultiplier;
                        float wingLength = abs(position.z);
                        float flapAnimation = sin(position.x * 5.0 + wingLength * 5.0 * multiplier - time * mix(10.0 * multiplier, 17.0, rand.x) * multiplier);
                        pos.y += flapAnimation * wingLength * 0.7;
                        pos *= mix(0.7, 1.2, rand.y);
                        pos.y -= 0.5;
                        pos.zy = rotate(0.6 * sin(time * multiplier + rand.z * 100.0 - pos.x)) * pos.zy;

                        vec3 forward = normalize(currentOffset.xyz - prevOffset.xyz);
                        vec3 up = normalize(currentOffset.xyz);
                        vec3 right = cross(forward, up);
                        mat3 TBN = mat3(forward, up, right);

                        pos = TBN * pos;
                        vec3 n = TBN * normal;

                        vNormal = normalize(normalMatrix * n);
                        vec3 wPos = pos + currentOffset.xyz;
                        vPos = viewMatrix * vec4(wPos, 1.0);

                        vLDir = (viewMatrix * vec4(normalize(uLightPos - wPos), 0.0)).xyz;

                        gl_Position = projectionMatrix * vPos;
                        vHighPrecisionZW = gl_Position.zw;
                    }
                `,
        fragmentShader: `
                    layout(location = 1) out highp vec4 gInfo;

                    uniform sampler2D tAtlas;


                    varying vec2 vUv;
                    varying vec3 vNormal;
                    varying vec4 vPos;
                    varying vec3 vLDir;
                    varying vec2 vHighPrecisionZW;
                    flat varying float vSurfaceId;

                    ${scope.colorutils_default}
                    ${scope.fit_default}
                    ${scope.encoding_default}
                    ${scope.fog_default}

                    void main() {
                        vec3 baseColor = texture(tAtlas, vUv).rgb;
                        vec3 colorShadow = rgb2hsv(baseColor);
                        colorShadow.b *= 0.5;
                        colorShadow = hsv2rgb(colorShadow);

                        vec3 nvNormal = normalize(vNormal);
                        float sh = max(0.0, dot(nvNormal, normalize(vLDir)));
                        sh = 1.0 - step(0.4, sh);

                        vec3 col = mix(baseColor, colorShadow, sh);

                        addFog(col, vPos.z);

                        gl_FragColor = vec4(col, vSurfaceId);
                        gInfo = vec4(1.0 - (0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5), encodeNormalSpheremap(nvNormal), 1.0);
                    }
                `
      })
    }, {
      textures: 2,
      initialTextures: [l, h],
      material: new scope.ShaderMaterial({
        uniformsGroups: [scope.global$1.UBO],
        uniforms: {
          uSeed: {
            value: Math.random()
          },
          uGroups: {
            value: this.options.groups
          },
          uNoise: {
            value: this.options.noise
          },
          tTexture1: {
            value: null
          },
          tTexture2: {
            value: null
          },
          tCurve: {
            value: e
          },
          uSnap: {
            value: 0
          },
          uSpeed: {
            value: this.options.speed
          },
          uDirection: {
            value: this.options.direction
          }
        },
        vertexShader: `
                    varying vec2 vUv;

                    void main() {
                        vUv = uv;
                        gl_Position = vec4(position, 1.0);
                    }
                `,
        fragmentShader: `
                    #define outPos pc_fragColor
                    uniform sampler2D tTexture1;

                    layout(location = 1) out highp vec4 outVel;
                    uniform sampler2D tTexture2;

                    uniform float uNoise;
                    uniform float uGroups;
                    uniform float uSnap;
                    uniform float uSpeed;
                    uniform float uSeed;
                    uniform float uDirection;
                    uniform sampler2D tCurve;

                    varying vec2 vUv;

                    ${scope.globalUBO_default}
                    ${scope.lerpfriction_default}
                    ${scope.sinenoise_default}
                    ${scope.fit_default}

                    float hash11(float p) {
                        p = fract(p * .1031);
                        p *= p + 33.33;
                        p *= p + p;
                        return fract(p);
                    }

                    void main() {
                        ivec2 uv = ivec2(gl_FragCoord.xy);
                        vec4 prevPos = texelFetch(tTexture1, uv, 0);
                        vec4 prevVel = texelFetch(tTexture2, uv, 0);

                        float hashFlock = hash11(prevPos.w * 8.54534);
                        float hashVel = hash11(vUv.x);

                        // randomize the flock
                        float offset = floor(hashFlock / (1.0 / uGroups));
                        float direction = uDirection; // mix(-1.0, 1.0, step(0.5, hashFlock));
                        float speed = 2.0 * direction * uSpeed * mix(0.75, 1.0, step(0.3, hashVel));
                        float curveWidth = float(textureSize(tCurve, 0).x);
                        float progress = time * speed + (curveWidth / uGroups) * offset + uSeed * 12.4234;

                        vec3 c1 = texelFetch(tCurve, ivec2(mod(progress, curveWidth), 0), 0).rgb;
                        vec3 c2 = texelFetch(tCurve, ivec2(mod(progress + 1.0, curveWidth), 0), 0).rgb;
                        vec3 target = mix(c1, c2, fract(abs(progress)));

                        if (uSnap > 0.9) {
                            prevPos.xyz = target;
                            prevVel.xyz = vec3(0.0);
                        } else {
                            // add some noise
                            float nAmount = 0.005 * uNoise * dtRatio;
                            prevVel.x += sinenoise1(prevPos.xyz + prevVel.w * 53.5645 + time * 0.05) * nAmount;
                            prevVel.y += sinenoise1(prevPos.xyz + prevVel.w * 653.8667 + time * 0.1) * nAmount;
                            prevVel.z += sinenoise1(prevPos.xyz + prevVel.w * 21.65465 + time * 0.025) * nAmount;

                            // towards target
                            vec3 delta = (target - prevPos.xyz) * 0.0003;
                            prevVel.xyz += delta * dtRatio;

                            // friction
                            prevVel.xyz *= frictionFPS(0.99, dtRatio);

                            // add to position
                            prevPos.xyz += prevVel.xyz * dtRatio;
                        }

                        outVel = prevVel;
                        outPos = prevPos;
                    }
                `
      })
    }), this.scene.add(this.mesh), this.mesh.name = "birds", this.mesh.frustumCulled = !1, this.mesh.matrixAutoUpdate = !1, this.scene.uploaded.then(() => {
      this.mesh.simulation.computationMaterial.uniforms.uSnap.value = 1, this.mesh.simulation.compute(), this.mesh.simulation.compute(), this.mesh.simulation.computationMaterial.uniforms.uSnap.value = 0;
    }), this.scene.beforeRenderCbs.push(() => {
      this.scene.directionalLight && this.mesh.material.uniforms.uLightPos.value.copy(this.scene.directionalLight.position);
    }), this.mesh.receiveShadow = !1, this.mesh.castShadow = !1, this.scene.add(this.mesh), this.ready.resolve();
  }
  playInAnimation(e = 0) {
    this.mesh.material.uniforms.uShow.value = 0, scope.createTween(this.mesh.material.uniforms.uShow, {
      to: {
        value: 1
      },
      delay: e,
      duration: 2,
      ease: "none"
    });
  }
};
}
