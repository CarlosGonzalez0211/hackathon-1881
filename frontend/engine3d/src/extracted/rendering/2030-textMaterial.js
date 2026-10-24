/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1596472:1599854.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2030(scope) {
scope.textMaterial = function textMaterial(r = {}) {
  return new scope.ShaderMaterial({
    userData: {
      hotReload: "button text"
    },
    uniformsGroups: [scope.global$1.UBO],
    uniforms: {
      tCurve: {
        value: r.curveTexture
      },
      tBand: {
        value: r.bandTexture
      },
      uSeed: {
        value: Math.random()
      },
      uShow: {
        value: 1
      },
      uHide: {
        value: 0
      },
      uHover: {
        value: 0
      }
    },
    vertexShader: `
            attribute vec3 centr;
            attribute vec2 textWeights;

            uniform float uShow;
            uniform float uHide;
            uniform float uHover;

            flat varying vec3 vCentr;
            varying vec2 vHighPrecisionZW;

            ${scope.globalUBO_default}
            ${scope.falloff_default}
            ${scope.slugvs_default}
            ${scope.eases_default}
            ${scope.rotate_default}

            vec3 hash31(float p) {
                vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973));
                p3 += dot(p3, p3.yzx+33.33);
                return fract((p3.xxy+p3.yzz)*p3.zyx);
            }

            float hash13(vec3 p3) {
                p3  = fract(p3 * .1031);
                p3 += dot(p3, p3.zyx + 31.32);
                return fract((p3.x + p3.y) * p3.z);
            }

            vec2 hash23(vec3 p3) {
                p3 = fract(p3 * vec3(.1031, .1030, .0973));
                p3 += dot(p3, p3.yzx+33.33);
                return fract((p3.xx+p3.yz)*p3.zy);
            }

            void main() {
                vCentr = centr;
                vec3 pos = SlugVS();

                float seed = fract(hash13(centr));

                // animation
                if (uShow < 1.0 || uHide > 0.0) {
                    // show
                    float stepsShow = floor(3.0 + seed * 2.0);
                    float trShow = floor(falloff(textWeights.y, 0.0, 1.0, 1.5, uShow) * stepsShow) / stepsShow;
                    float trHide = floor(falloff(textWeights.y, 0.0, 1.0, 1.5, uHide) * stepsShow) / stepsShow;
                    vTexCoord += vec2(0.0, 1.0) * (1.0 - trShow);
                    vTexCoord -= vec2(0.0, 1.0) * trHide;
                }

                // random stepped rotation animation
                float t = floor(time * 3.0);
                vec3 axis = normalize(hash31(t) * 2.0 - 1.0);
                float angle = 0.02;

                vec4 pos2 = vec4(pos, 1.0);
                pos2.xyz *= 1.0 - 0.05 * uHover;
                pos2 = rotation3D(axis, angle) * pos2;

                gl_Position = projectionMatrix * modelViewMatrix * pos2;
                vHighPrecisionZW = gl_Position.zw;
            }
        `,
    fragmentShader: `
            layout(location = 1) out highp vec4 gInfo;

            uniform sampler2D tCurve;
            uniform usampler2D tBand;

            flat varying vec3 vCentr;
            varying vec2 vHighPrecisionZW;

            ${scope.globalUBO_default}
            ${scope.slugfs_default}
            ${scope.transformUV_default}

            void main() {
                // animation

                vec2 uv = vTexCoord;
                vec4 color = RenderSlug(tCurve, tBand, uv, vColor, vBanding, vGlyph);

                if (color.w * vColor.w < 0.01) discard;

                // skip outline
                gl_FragColor = vec4(color.xyz, 0.34242);
                gInfo = vec4(1.0 - (0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5), vec2(0.0), 0.0);
            }
        `,
    depthWrite: !1
  });
};
}
