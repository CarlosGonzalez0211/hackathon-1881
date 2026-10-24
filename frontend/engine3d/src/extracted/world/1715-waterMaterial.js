/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1256370:1261869.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1715(scope) {
scope.waterMaterial = function waterMaterial(r = {}) {
  const e = scope.UniformsUtils.merge([scope.UniformsLib.common, scope.UniformsLib.lights, {
    tColors: {
      value: null
    },
    tNoiseTerrain: {
      value: null
    },
    tNoise: {
      value: null
    }
  }]);
  return e.tColors.value = scope.textureLoader.load("atlas.png", "srgb-nearest"), e.tNoise.value = scope.textureLoader.load("noise-simplex-layered-pixellated-highq.ktx2", "linearfilter-repeat"), new scope.ShaderMaterial({
    lights: !0,
    uniformsGroups: [scope.global$1.UBO],
    uniforms: e,
    vertexShader: `
            ${scope.globalUBO_default}

            attribute float dist;
            attribute float surfaceId;
            attribute int elementId;

            varying vec2 vUv;
            varying vec2 vHighPrecisionZW;

            varying vec3 wNormal;
            varying vec3 wPos;
            varying vec4 vPos;
            varying vec3 vNormal;
            varying float vSurfaceId;
            varying float vDist;
            flat varying int vElementId;

            // for shadows
            #include <shadowmap_pars_vertex>
            vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
                return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
            }

            void main() {
                vUv = uv;
                vElementId = elementId;
                vSurfaceId = surfaceId;
                vDist = dist;

                // get world position
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);

                wNormal = normal;
                wPos = position.xyz;
                vNormal = normalize(normalMatrix * normal);

                // this requires worldPosition and transformedNormal
                vec3 transformedNormal = vNormal;
                #include <shadowmap_vertex>

                vPos = viewMatrix * worldPosition;

                gl_Position = projectionMatrix * vPos;
                vHighPrecisionZW = gl_Position.zw;
            }
        `,
    fragmentShader: `
            layout(location = 1) out highp vec4 gInfo;

            ${scope.globalUBO_default}
            ${scope.fit_default}
            ${scope.encoding_default}
            ${scope.linearstep_default}
            ${scope.colorutils_default}
            ${scope.triplanar_default}

            varying vec3 wPos;
            varying vec3 wNormal;
            varying vec3 vNormal;
            varying vec4 vPos;
            varying float vSurfaceId;
            varying float vDist;
            flat varying int vElementId;

            uniform sampler2D tColors;
            uniform sampler2D tNoise;

            varying vec2 vUv;
            varying vec2 vHighPrecisionZW;

            // for shadows
            #include <packing>
            #include <shadowmap_pars_fragment>

            void main() {
                float shadowContribution = 1.0;
                float outlineContribution = 1.0;
                float surfaceId = vSurfaceId;

                // triplanar texture used for adding detail
                vec4 triplanarNoise = triplanar(tNoise, wNormal, wPos.xyz * 0.07 + time * 0.05, 1.0);

                vec2 colorUV = vUv;
                vec3 color = texture2D(tColors, colorUV).rgb;

                // add waves using baked distance attribute
                float waves = fract(triplanarNoise.r * 0.7 + vDist * 3.0 + time * 0.1);
                waves *= 1.0 - step(0.7, vDist);
                waves *= step(0.3, vDist);
                waves *= triplanarNoise.r;
                waves = step(0.3, waves);

                color = mix(color, vec3(1.0), waves);

                #if NUM_DIR_LIGHTS > 0

                    // color shadow
                    vec3 colorShadow = rgb2hsv(color);
                    colorShadow.r -= 0.02;
                    colorShadow.b *= 0.5;
                    colorShadow = hsv2rgb(colorShadow);

                    // shadow
                    float shadow = 0.0;
                    #if defined(USE_SHADOWMAP) && NUM_DIR_LIGHT_SHADOWS > 0
                        DirectionalLightShadow directionalLightShadow;
                        directionalLightShadow = directionalLightShadows[0];
                        shadow = getShadow(
                            directionalShadowMap[0],
                            directionalLightShadow.shadowMapSize,
                            directionalLightShadow.shadowIntensity,
                            directionalLightShadow.shadowBias,
                            directionalLightShadow.shadowRadius,
                            vDirectionalShadowCoord[0]
                        );
                    #endif

                    // set color
                    float shadowCut = smoothstep(0.2, 0.4, shadow);
                    color = mix(colorShadow, color, shadowCut);
                #endif

                // add stepped gradients
                color += smoothstep(0.3, 0.0, step(0.2, vDist  - triplanarNoise.r * 1.5)) * vec3(0.2, 0.8, 1.0) * 0.035;
                color += smoothstep(0.3, 0.0, step(1.15, vDist - triplanarNoise.b * 1.5)) * vec3(0.2, 0.8, 1.0) * 0.01;

                // break up outlines
                outlineContribution *= step(0.17, triplanarNoise.g * triplanarNoise.b);
                outlineContribution = step(0.5, outlineContribution);

                gl_FragColor = vec4(color, surfaceId);
                gInfo = vec4(1.0 - (0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5), vec2(0.0), outlineContribution);
            }
        `
  });
};
}
