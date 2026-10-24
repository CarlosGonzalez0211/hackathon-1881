/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1173165:1176923.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1676(scope) {
scope.createFontMaterial = async function createFontMaterial({
  font: r,
  animationMask: e,
  animationTranslate: i,
  small: s
} = {}) {
  const [a, o] = await Promise.all([scope.glyphLoader.loadTexture(r, "curve"), scope.glyphLoader.loadTexture(r, "band")]);
  return new scope.ShaderMaterial({
    defines: {
      ...(i ? {
        ANIMATION_TRANSLATE: scope.ANIMATIONS[i]
      } : {}),
      ...(e ? {
        ANIMATION_MASK: scope.ANIMATIONS[e]
      } : {}),
      ...(s ? {
        SLUG_WEIGHT: 1
      } : {})
    },
    uniformsGroups: [scope.global$1.UBO],
    uniforms: {
      tCurve: {
        value: a
      },
      tBand: {
        value: o
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
      }
    },
    vertexShader: `
            #if defined(ANIMATION_TRANSLATE) || defined(ANIMATION_MASK)
                attribute vec2 textWeights;
                attribute vec3 lineWeights;
                uniform vec2 uAnimationDirection;
                uniform float uAnimationOrder;
                uniform float uAnimationMargin;
                uniform float uAnimationProgress;
                varying float vAlpha;
                ${scope.falloff_default}
            #endif

            ${scope.globalUBO_default}
            ${scope.slugvs_default}

            void main() {
                vec3 pos = SlugVS();

                #if defined(ANIMATION_TRANSLATE) || defined(ANIMATION_MASK)
                float weight = 0.0;
                #endif

                #if defined(ANIMATION_TRANSLATE)
                    #if ANIMATION_TRANSLATE == 1
                        weight = textWeights.x;
                    #elif ANIMATION_TRANSLATE == 2
                        weight = textWeights.y;
                    #elif ANIMATION_TRANSLATE == 3
                        weight = lineWeights.x;
                    #elif ANIMATION_TRANSLATE == 4
                        weight = lineWeights.y;
                    #elif ANIMATION_TRANSLATE == 5
                        weight = lineWeights.z;
                    #endif
                #endif

                #if defined(ANIMATION_MASK)
                    #if ANIMATION_MASK == 1
                        weight = textWeights.x;
                    #elif ANIMATION_MASK == 2
                        weight = textWeights.y;
                    #elif ANIMATION_MASK == 3
                        weight = lineWeights.x;
                    #elif ANIMATION_MASK == 4
                        weight = lineWeights.y;
                    #elif ANIMATION_MASK == 5
                        weight = lineWeights.z;
                    #endif
                #endif

                #if defined(ANIMATION_TRANSLATE) || defined(ANIMATION_MASK)
                    float a = falloffsmooth(abs(uAnimationOrder - weight), 0.0, 1.0, uAnimationMargin, clamp(uAnimationProgress, 0.0, 1.0));
                #endif

                #ifdef ANIMATION_TRANSLATE
                    vAlpha = a;
                    pos += vec3(uAnimationDirection, 0.0) * (1.0 - vAlpha);
                #endif

                #ifdef ANIMATION_MASK
                    vAlpha = 1.0;
                    vTexCoord += uAnimationDirection * (1.0 - a);
                #endif

                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
    fragmentShader: `
            uniform sampler2D tCurve;
            uniform usampler2D tBand;

            ${scope.slugfs_default}

            #if defined(ANIMATION_TRANSLATE) || defined(ANIMATION_MASK)
                varying float vAlpha;
            #endif

            void main() {
                vec4 color = SlugFS(tCurve, tBand);

                #if defined(ANIMATION_TRANSLATE) || defined(ANIMATION_MASK)
                    color.a *= vAlpha;
                #endif

                gl_FragColor = color;
            }
        `,
    transparent: !0,
    depthWrite: !1
  });
};
}
