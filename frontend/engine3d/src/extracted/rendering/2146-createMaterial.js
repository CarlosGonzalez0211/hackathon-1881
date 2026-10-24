/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1882965:1885749.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2146(scope) {
scope.createMaterial = function createMaterial(r, e) {
  return new scope.ShaderMaterial({
    defines: {},
    uniformsGroups: [scope.global$1.UBO],
    uniforms: {
      tCurve: {
        value: r
      },
      tBand: {
        value: e
      },
      uSeed: {
        value: Math.random()
      },
      uShow: {
        value: scope.client$1.devScene ? 1 : 0
      },
      uHide: {
        value: 0
      },
      uScale: {
        value: 1
      }
    },
    vertexShader: `
            attribute vec3 centr;
            attribute vec2 textWeights;

            uniform float uShow;
            uniform float uHide;
            uniform float uScale;

            flat varying vec3 vCentr;

            ${scope.globalUBO_default}
            ${scope.falloff_default}
            ${scope.slugvs_default}
            ${scope.eases_default}

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
                    float trShow = floor(falloff(textWeights.x, 0.0, 1.0, 0.35, uShow) * stepsShow) / stepsShow;
                    vTexCoord += vec2(0.0, 1.0) * (1.0 - trShow);

                    // hide
                    float stepsHide = floor(2.0 + seed * 2.0);
                    float trHide = 1.0 - floor(uHide * (stepsHide + 1.0)) / (stepsHide + 1.0);
                    pos -= centr;
                    pos *= trHide;
                    pos += centr;
                }

                // wiggle
                float steppedTime = floor(time * 1.6 * mix(fract(seed), 0.8, 1.0) + seed * 15.3423) / 7.0;
                vec2 offset = (hash23(centr + vec3(steppedTime, 0.0, 0.0)) * 2.0 - 1.0) * 0.5;
                pos.xy += offset;

                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos * uScale, 1.0);
            }
        `,
    fragmentShader: `
            uniform sampler2D tCurve;
            uniform usampler2D tBand;

            flat varying vec3 vCentr;

            ${scope.globalUBO_default}
            ${scope.slugfs_default}
            ${scope.transformUV_default}

            void main() {
                vec2 uv = vTexCoord;
                vec4 color = RenderSlug(tCurve, tBand, uv, vColor, vBanding, vGlyph);

                // skip outline
                gl_FragColor = vec4(-color.xyz, color.w * vColor.w);
            }
        `,
    transparent: !0,
    depthWrite: !1
  });
};
}
