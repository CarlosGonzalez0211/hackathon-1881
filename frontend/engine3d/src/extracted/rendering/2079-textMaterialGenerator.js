/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1663164:1666978.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2079(scope) {
scope.textMaterialGenerator = function textMaterialGenerator() {
  const r = new scope.ShaderMaterial({
    defines: {
      ANIMATION_MASK: 1
    },
    uniformsGroups: [scope.global$1.UBO],
    uniforms: {
      tCurve: {
        value: null
      },
      tBand: {
        value: null
      },
      uAnimationOrder: {
        value: 0
      },
      uAnimationDirection: {
        value: new scope.Vector2(0, 1)
      },
      uAnimationMargin: {
        value: .5
      },
      uAnimationProgress: {
        value: 0
      },
      uSize: {
        value: new scope.Vector2()
      },
      uMargins: {
        value: new scope.Vector2()
      },
      uSeed: {
        value: Math.random()
      },
      uAlpha: {
        value: 1
      }
    },
    vertexShader: `
            attribute vec3 centr;
            attribute vec2 textWeights;

            uniform float uAnimationProgress;

            uniform vec2 uSize;
            uniform vec2 uMargins;
            uniform float uAlpha;

            flat varying vec3 vCentr;
            varying vec2 vHighPrecisionZW;

            ${scope.falloff_default}
            ${scope.matrixutils_default}
            ${scope.globalUBO_default}
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
                float show = uAnimationProgress;
                float hide = 1.0 - uAlpha;

                if (show < 1.0 || hide > 0.0) {
                    // show
                    float stepsShow = floor(3.0 + seed * 2.0);
                    float trShow = floor(falloff(textWeights.y, 0.0, 1.0, 0.1, show) * stepsShow) / stepsShow;
                    vTexCoord += vec2(0.0, 1.0) * (1.0 - trShow);

                    // hide
                    float stepsHide = floor(1.0 + seed * 2.0);
                    float trHide = 1.0 - floor(hide * (stepsHide + 1.0)) / (stepsHide + 1.0);
                    pos -= centr;
                    pos *= trHide;
                    pos += centr;
                }

                // wiggle
                float steppedTime = floor(time * 1.6 * mix(fract(seed), 0.8, 1.0) + seed * 15.3423) / 7.0;
                vec2 offset = (hash23(centr + vec3(steppedTime, 0.0, 0.0)) * 2.0 - 1.0) * 0.0025;
                pos.xy += offset;

                // offset text to center it
                pos.x -= uSize.x * 0.5;
                pos.y -= 0.055; // compensate for pointer
                pos.y += uSize.y + uMargins.y; // compensate for font size and bottom margin

                gl_Position = projectionMatrix * viewMatrix * billboardModelMatrix() * vec4(pos, 1.0);
                vHighPrecisionZW = gl_Position.zw;
            }
        `,
    fragmentShader: `
            layout(location = 1) out highp vec4 gInfo;

            uniform sampler2D tCurve;
            uniform usampler2D tBand;

            ${scope.slugfs_default}
            ${scope.globalUBO_default}

            varying vec2 vHighPrecisionZW;
            flat varying vec3 vCentr;

            void main() {
                vec2 uv = vTexCoord;
                vec4 color = RenderSlug(tCurve, tBand, uv, vColor, vBanding, vGlyph);

                gl_FragColor = vec4(color.xyz, color.w * vColor.w);

                gInfo = vec4(1.0 - (0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5), vec3(0.0));
            }
        `,
    transparent: !0,
    depthWrite: !0,
    blending: scope.CustomBlending,
    blendSrc: scope.SrcAlphaFactor,
    blendSrcAlpha: scope.ZeroFactor,
    blendDstAlpha: scope.OneFactor
  });
  return ({
    bandTexture: e = null,
    curveTexture: i = null
  } = {}) => (r.uniforms.tBand.value = e, r.uniforms.tCurve.value = i, r);
};
}
