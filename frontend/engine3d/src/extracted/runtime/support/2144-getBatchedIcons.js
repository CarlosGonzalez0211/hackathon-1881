/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1869060:1873953.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2144(scope) {
scope.getBatchedIcons = function getBatchedIcons(r, e, i) {
  const s = new scope.BatchedMesh(r, e, i, new scope.ShaderMaterial({
    uniformsGroups: [scope.global$1.UBO],
    uniforms: {
      uShow: {
        value: scope.client$1.devScene ? 1 : 0
      },
      uSeed: {
        value: Math.random()
      },
      tBands1: {
        value: null
      },
      tCurves1: {
        value: null
      },
      tBands2: {
        value: null
      },
      tCurves2: {
        value: null
      },
      tBands3: {
        value: null
      },
      tCurves3: {
        value: null
      },
      tBands4: {
        value: null
      },
      tCurves4: {
        value: null
      },
      tBands5: {
        value: null
      },
      tCurves5: {
        value: null
      },
      tNoise: {
        value: scope.textureLoader.load("noise-simplex-layered-blur-highq.ktx2", "repeat-linearfilter")
      }
    },
    vertexShader: `
            /* BATCHING */
            #if ! defined(GL_ANGLE_multi_draw)
                #define gl_DrawID _gl_DrawID
                uniform int _gl_DrawID;
            #endif
            uniform highp sampler2D batchingTexture;
            uniform highp usampler2D batchingIdTexture;

            mat4 getBatchingMatrix(const in int i) {
                int size = textureSize(batchingTexture, 0).x;
                int j = i * 4;
                int x = j % size;
                int y = j / size;
                vec4 v1 = texelFetch(batchingTexture, ivec2(x, y), 0);
                vec4 v2 = texelFetch(batchingTexture, ivec2(x + 1, y), 0);
                vec4 v3 = texelFetch(batchingTexture, ivec2(x + 2, y), 0);
                vec4 v4 = texelFetch(batchingTexture, ivec2(x + 3, y), 0);
                return mat4(v1, v2, v3, v4);
            }

            float getIndirectIndex(const in int i) {
                int size = textureSize(batchingIdTexture, 0).x;
                int x = i % size;
                int y = i / size;
                return float(texelFetch(batchingIdTexture, ivec2(x, y), 0).r);
            }

            uniform float uShow;
            uniform float uSeed;

            varying vec2 vUv;
            flat varying int vBatchID;

            ${scope.globalUBO_default}
            ${scope.slugvs_default}
            ${scope.falloff_default}
            ${scope.rotate_default}

            float hash11(float p) {
                p = fract(p * .1031);
                p *= p + 33.33;
                p *= p + p;
                return fract(p);
            }

            void main() {
                vUv = uv;

                float batchID = getIndirectIndex(gl_DrawID);
                vBatchID = int(batchID);
                mat4 batchingMatrix = getBatchingMatrix(vBatchID);

                mat4 bmvpMatrix = projectionMatrix * modelViewMatrix * batchingMatrix;
                vec3 pos = SlugVS(bmvpMatrix);

                float scaleShow = falloff(batchID, 0.0, 5.0, 5.0, uShow);
                float steps = floor(2.0 + fract(uSeed * 45.35452 + batchID * 2.546) * 2.0);
                float scaleShowStepped = floor(scaleShow * steps) / steps;
                pos *= scaleShowStepped;

                float rot = floor((time * 0.5 + batchID * 221.5435 + uSeed * 34.23) * 7.0) / 7.0;
                float angle = 0.05;
                pos *= rotateZ(mix(-angle, angle, hash11(rot)));

                gl_Position = bmvpMatrix * vec4(pos, 1.0);
            }
        `,
    fragmentShader: `

            // thanks android
            uniform sampler2D tCurves1;
            uniform usampler2D tBands1;
            uniform sampler2D tCurves2;
            uniform usampler2D tBands2;
            uniform sampler2D tCurves3;
            uniform usampler2D tBands3;
            uniform sampler2D tCurves4;
            uniform usampler2D tBands4;
            uniform sampler2D tCurves5;
            uniform usampler2D tBands5;

            uniform sampler2D tNoise;

            ${scope.slugfs_default}

            varying vec2 vUv;
            flat varying int vBatchID;

            void main() {
                vec4 color;

                // can be optimized to use a single texture, but anyway
                if (vBatchID == 0) {
                    color = RenderSlug(tCurves1, tBands1, vTexCoord, vColor, vBanding, vGlyph);
                } else if (vBatchID == 1) {
                    color = RenderSlug(tCurves2, tBands2, vTexCoord, vColor, vBanding, vGlyph);
                } else if (vBatchID == 2) {
                    color = RenderSlug(tCurves3, tBands3, vTexCoord, vColor, vBanding, vGlyph);
                } else if (vBatchID == 3) {
                    color = RenderSlug(tCurves4, tBands4, vTexCoord, vColor, vBanding, vGlyph);
                } else if (vBatchID == 4) {
                    color = RenderSlug(tCurves5, tBands5, vTexCoord, vColor, vBanding, vGlyph);
                }

                if (color.w * vColor.w < 0.001) discard;

                gl_FragColor = vec4(color.rgb, 1.0);
            }
        `,
    transparent: !1
  }));
  return s.name = "emojis icons Top", s.sortObjects = !1, s.receiveShadow = !1, s.castShadow = !1, s.frustumCulled = !1, s.perObjectFrustumCulled = !1, s.visible = !1, s.renderOrder = 1, s.matrixAutoUpdate = !1, s;
};
}
