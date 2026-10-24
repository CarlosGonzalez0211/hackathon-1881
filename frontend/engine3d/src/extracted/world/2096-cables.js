/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1717263:1721546.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2096(scope) {
scope.cables = class cables {
  constructor(e, i = {}) {
    this.scene = e, this.options = i, this.ready = scope.miscutils.deferred(), this.mesh = new scope.Group(), this.scene.add(this.mesh), this.mesh.name = "cables", this.mesh.updateMatrixWorld(), this.mesh.matrixAutoUpdate = !1, this.mesh.matrixWorldAutoUpdate = !1, this.init();
  }
  async init() {
    const e = ["cables-1", "cables-2"],
      i = await Promise.all(e.map(a => scope.geometryLoader.load(`planets/present/${a}.drc`))),
      s = new scope.ShaderMaterial({
        uniformsGroups: [scope.global$1.UBO],
        uniforms: {
          tNoise: {
            value: scope.textureLoader.load("clouds_noise_512.ktx2", "srgb-repeat")
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
                attribute vec3 nextpos;
                attribute vec3 prevpos;
                attribute vec3 curvepos;

                ${scope.globalUBO_default}
                ${scope.fit_default}

                uniform float uWidth;
                uniform sampler2D tNoise;

                varying vec2 vHighPrecisionZW;
                varying vec2 vUv;
                varying vec4 vPos;
                varying float vRandom;

                void main() {
                    vUv = uv;
                    vRandom = randomm;

                    vec4 worldPos = modelMatrix * vec4(curvepos, 1.0);
                    vec4 worldPrevPos = modelMatrix * vec4(prevpos, 1.0);
                    vec4 worldNextPos = modelMatrix * vec4(nextpos, 1.0);

                    vec4 viewPos = viewMatrix * worldPos;
                    vPos = viewPos;

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

                    // extrude line in screen space
                    // set thickness based on camera distance, so that far away lines don't appear too thin
                    float width = viewPos.z * 0.0009 * aspect;
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

                varying float vRandom;
                varying vec2 vUv;
                varying vec4 vPos;
                varying vec2 vHighPrecisionZW;

                void main() {

                    float n = texture2D(tNoise, vec2(0.5 + vRandom, vUv.y * 0.2)).r;
                    if (n < 0.25) discard;

                    vec3 color = uColor;
                    addFog(color, vPos.z);

                    gl_FragColor = vec4(color, 1.0);
                    gInfo = vec4(1.0 - (0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5), vec2(0.0), 0.0);
                }
            `,
        side: scope.DoubleSide
      });
    i.forEach((a, o) => {
      const l = new scope.PlanetMesh(a, s, this.scene, 25);
      this.mesh.add(l), l.updateMatrixWorld(), l.matrixAutoUpdate = !1, l.matrixWorldAutoUpdate = !1;
    }), this.ready.resolve();
  }
};
}
