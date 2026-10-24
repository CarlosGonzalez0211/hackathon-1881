/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1261869:1266664.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1716(scope) {
scope.cloudMaterial = function cloudMaterial(r = {}) {
  const e = scope.UniformsUtils.merge([scope.UniformsLib.common, scope.UniformsLib.lights, {
    tNoiseTerrain: {
      value: null
    },
    tNoise: {
      value: null
    },
    uColor: {
      value: new scope.Color("#F8F8F8")
    }
  }]);
  return e.tNoise.value = scope.textureLoader.load("noise-simplex-layered-pixellated-highq.ktx2", "linearfilter-repeat"), new scope.ShaderMaterial({
    lights: !0,
    uniformsGroups: [scope.global$1.UBO],
    uniforms: e,
    vertexShader: `
            ${scope.globalUBO_default}
            ${scope.triplanar_default}

            attribute float surfaceId;
            attribute int elementId;

            uniform sampler2D tNoise;

            varying vec2 vUv;
            varying vec2 vHighPrecisionZW;

            varying vec3 wNormal;
            varying vec3 wPos;
            varying vec4 vPos;
            varying vec3 vNormal;
            varying float vSurfaceId;
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

                // get world position
                vec3 pos = position;

                vec4 triplanarNoise = triplanar(tNoise, normal, pos.xyz * 0.07, 1.0);
                vec3 displacement = sin(triplanarNoise.r * 180.0 + floor(time * 6.0) * 0.25) * normalize(pos) * 0.5;
                pos.xyz += displacement.xyz;

                vec4 worldPosition = modelMatrix * vec4(pos, 1.0);

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

            varying vec2 vUv;
            varying vec3 wPos;
            varying vec3 wNormal;
            varying vec3 vNormal;
            varying vec4 vPos;
            varying float vSurfaceId;
            flat varying int vElementId;

            varying vec2 vHighPrecisionZW;

            uniform vec3 uColor;
            uniform sampler2D tNoise;

            // for shadows
            #include <packing>
            #include <shadowmap_pars_fragment>

            void main() {

                float outlineContribution = 1.0;
                vec3 color = uColor;
                vec4 triplanarNoise = triplanar(tNoise, wNormal, wPos.xyz * 0.07, 1.0);

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

                // break up outlines
                outlineContribution *= step(0.17, triplanarNoise.g * triplanarNoise.b);
                outlineContribution = step(0.5, outlineContribution);

                gl_FragColor = vec4(color, vSurfaceId);
                gInfo = vec4(1.0 - (0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5), encodeNormalSpheremap(normalize(vNormal)), outlineContribution);
            }
        `
  });
};
}
