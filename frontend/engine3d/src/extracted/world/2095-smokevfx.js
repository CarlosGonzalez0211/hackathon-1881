/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1711209:1717263.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2095(scope) {
scope.smokevfx = class smokevfx {
  constructor(e, i = {}) {
    this.scene = e, this.options = i, this.ready = scope.miscutils.deferred(), this.init();
  }
  async init() {
    const e = await scope.geometryLoader.load("planets/present/smoke-1.drc"),
      i = new scope.ShaderMaterial({
        userData: {
          hotReload: "smoke"
        },
        uniformsGroups: [scope.global$1.UBO],
        uniforms: {
          tNoise: {
            value: scope.textureLoader.load("clouds_noise_512.ktx2", "srgb-repeat")
          },
          tNoise2: {
            value: scope.textureLoader.load("water-noises-highq.ktx2", "srgb-repeat")
          },
          uColor: {
            value: new scope.Color("#565c5f")
          },
          uWidth: {
            value: 1
          },
          ...scope.fogUniforms
        },
        vertexShader: `
                attribute float randomm;
                attribute float thickness;
                attribute vec3 nextpos;
                attribute vec3 prevpos;
                attribute vec3 curvepos;
                attribute vec2 uv2;

                ${scope.globalUBO_default}
                ${scope.fit_default}

                uniform float uWidth;
                uniform sampler2D tNoise;

                varying vec2 vHighPrecisionZW;
                varying vec2 vUv;
                varying vec2 vUv2;
                varying vec3 vWorldPos;
                varying vec4 vPos;
                varying float vRandom;
                varying float vFresnel;
                varying float vThickness;

                void main() {
                    vUv = uv;
                    vUv2 = uv2;
                    vRandom = randomm;
                    vThickness = thickness;

                    vec4 worldPos = modelMatrix * vec4(curvepos, 1.0);
                    vec4 worldPrevPos = modelMatrix * vec4(prevpos, 1.0);
                    vec4 worldNextPos = modelMatrix * vec4(nextpos, 1.0);

                    // for animation offset in fragment shader
                    vWorldPos = curvepos.xyz;

                    vPos = viewMatrix * worldPos;

                    mat4 projView = projectionMatrix * viewMatrix;
                    vec4 finalPos = projView * worldPos;
                    vec4 finalPrevPos = projView * worldPrevPos;
                    vec4 finalNextPos = projView * worldNextPos;

                    float aspect = resolution.x / resolution.y;
                    vec2 aspectVec = vec2(aspect, 1.0);
                    vec2 posScreen = finalPos.xy / finalPos.w * aspectVec;
                    vec2 prevPosScreen = finalPrevPos.xy / finalPrevPos.w * aspectVec;
                    vec2 nextPosScreen = finalNextPos.xy / finalNextPos.w * aspectVec;

                    // calculate screen space line normal, so we can extrude it to give it thickness
                    vec2 dirA = normalize((posScreen - prevPosScreen));
                    vec2 dirB = normalize((nextPosScreen - posScreen));
                    vec2 tangent = normalize(dirA + dirB);
                    vec2 normal = normalize(vec2(-tangent.y, tangent.x));

                    // choose which direction to extrude
                    if (uv.x > 0.5) {
                        normal = -normal;
                    }
                    normal.x /= aspect;

                    // calculate fresnel so we can fade the smoke at harsh corners
                    // bias it to one side, as broken geometry only appears when
                    // lines are moving away from camera
                    // vFresnel = 1.0 - dot(normalize(finalPrevPos.xyz - finalPos.xyz), vec3(0.0, 0.0, -1.0));
                    // vFresnel = smoothstep(0.15, 1.0, vFresnel);

                    // extrude line in screen space
                    float width = 0.35;
                    width = width * thickness * mix(0.25, 3.0, vUv2.y);
                    // width = width * mix(0.1, 1.0, smoothstep(1.0, 0.2, vUv2.y));
                    normal *= width;
                    vec4 thicknessOffset = vec4(normal.xy, 0.0, 0.0);

                    gl_Position = finalPos + thicknessOffset;

                    vHighPrecisionZW = gl_Position.zw;
                }
            `,
        fragmentShader: `
                layout(location = 1) out highp vec4 gInfo;

                ${scope.globalUBO_default}
                ${scope.fog_default}

                uniform vec3 uColor;
                uniform sampler2D tNoise;
                uniform sampler2D tNoise2;

                varying float vRandom;
                varying vec2 vUv;
                varying vec2 vUv2;
                varying vec2 vHighPrecisionZW;
                varying vec3 vWorldPos;
                varying vec4 vPos;
                varying float vFresnel;
                varying float vThickness;

                void main() {
                    float n1 = texture2D(tNoise, vUv2 * vec2(0.25, 1.0) - vec2(vRandom, time * 0.05)).r;
                    float n2 = 1.0 - texture2D(tNoise2, vec2(vUv2 * vec2(0.7, 1.5) - vec2(vRandom, time * 0.15))).r;
                    n2 -= n1 * 0.4;
                    n2 = pow(n2, 2.0);
                    // n += (1.0 - abs(vUv.x - 0.5) * 2.0) * 0.25;
                    // if (n < 0.5) discard;

                    float grad = 1.0 - abs(vUv.x - 0.5) * 2.0;
                    float mask = grad * n2;
                    // mask -= vUv.y * 0.15;
                    mask -= (sin(vUv.y * 2.0 - time + vRandom * 10.0) * 0.5 + 0.5) * 0.15;
                    mask *= smoothstep(0.0, 0.15, vUv2.y);
                    mask *= smoothstep(1.0, 0.5, vUv2.y);
                    if (mask < 0.05) discard;
                    vec3 color = vec3(1.0);

                    addFog(color, vPos.z);

                    gl_FragColor.rgb = color;
                    gl_FragColor.a = 0.35;

                    gInfo = vec4(1.0 - (0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5), vec2(0.0), 0.0);
                }
            `,
        transparent: !0,
        blending: scope.CustomBlending,
        blendSrcAlpha: scope.ZeroFactor,
        blendDstAlpha: scope.OneFactor
      });
    this.mesh = new scope.PlanetMesh(e, i, this.scene, 25), this.mesh.name = "smoke", this.mesh.updateMatrixWorld(), this.mesh.matrixAutoUpdate = !1, this.mesh.matrixWorldAutoUpdate = !1, this.scene.add(this.mesh), this.ready.resolve();
  }
};
}
