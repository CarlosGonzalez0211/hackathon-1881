/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1731432:1740652.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2107(scope) {
scope.createButterflyMaterial = function createButterflyMaterial() {
  const r = {
    ...scope.UniformsUtils.clone(scope.uniforms),
    charPos: {
      value: new scope.Vector3()
    },
    charSpeed: {
      value: 0
    },
    tButterfly: {
      value: scope.textureLoader.load("butterfly-highq.ktx2", "linearfilter")
    },
    tButterflyFront: {
      value: scope.textureLoader.load("butterfly-front-highq.ktx2", "linearfilter")
    },
    uColor1: {
      value: new scope.Color("#ffffff")
    },
    uColor2: {
      value: new scope.Color("#f5ba53")
    },
    uColor3: {
      value: new scope.Color("#ffd998")
    },
    uColor4: {
      value: new scope.Color("#9dbfe6")
    },
    uColor5: {
      value: new scope.Color("#ade3d0")
    },
    ...scope.fogUniforms
  };
  return new scope.ShaderMaterial({
    name: "butterflies",
    lights: !0,
    uniformsGroups: [scope.global$1.UBO],
    uniforms: r,
    vertexShader: `
            ${scope.globalUBO_default}
            ${scope.fit_default}
            ${scope.sinenoise_default}

            attribute vec3 up;
            attribute vec4 randomm;
            uniform vec3 charPos;
            uniform float charSpeed;

            varying vec2 vUv;
            varying vec4 vRand;
            varying vec2 vHighPrecisionZW;

            varying vec3 wNormal;
            varying vec3 wPos;
            varying vec4 vPos;
            varying vec3 vNormal;
            varying vec3 vAnimationOffset;

            // for shadows
            #include <shadowmap_pars_vertex>
            vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
                return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
            }

            mat2 rotate2d(float a) {
                float s = sin(a);
                float c = cos(a);
                return mat2(c, s, -s, c);
            }

            void main() {
                vRand = randomm;
                vUv = uv;

                // get world position
                vec4 instancePos = instanceMatrix * vec4(position, 1.0);
                vec4 worldPosition = modelMatrix * instancePos;

                vec3 butterflyBottomPos = vec3(instanceMatrix[3]);

                // flap animation
                float flapTimeline = fract(time * mix(1.0, 1.5, randomm.w) + randomm.x);
                float flapDisplacement = smoothstep(0.0, 0.4, flapTimeline) * 0.15;
                flapDisplacement *= smoothstep(1.0, 0.4, flapTimeline);
                flapDisplacement *= sin(time * mix(1.0, 4.0, randomm.x)) * 0.5 + 0.5;
                vAnimationOffset = vec3(sin(time * 2.21312 + randomm.y * 5.0 + randomm.z * 6.0) , sin(time * 1.421 + 0.314159 + randomm.y * 10.0), sin(time * 1.79 + 0.27143 + randomm.z * 10.0));
                vAnimationOffset += vec3(sin(time * 1.31412 + randomm.x * 5.0 + randomm.w * 4.0) , sin(time * 2.421 + 0.314159 + randomm.w * 10.0), sin(time *2.69 + 1.32143 + randomm.y * 10.0));
                vAnimationOffset *= 0.5;
                vec3 posAnimation = vec3(0.0);
                posAnimation += normalize(instancePos.xyz) * flapDisplacement;
                posAnimation += 0.5 * vAnimationOffset;

                // billboard
                vec3 butterflyUp = normalize(up);
                vec3 butterflyOffset = butterflyBottomPos + posAnimation;
                vec3 camToButterfly = normalize(butterflyOffset - cameraPosition);
                vec3 butterflyRight = cross(butterflyUp, camToButterfly);
                vec3 butterflyForward = cross(butterflyRight, butterflyUp);
                mat3 butterflyTBN = mat3(butterflyRight, butterflyForward, butterflyUp);
                float butterflyScale = fit(fract(randomm.x + randomm.w * 2.0), 0.0, 1.0, 0.8, 1.3);

                vec3 butterflyPosition = position.xyz * butterflyScale;
                worldPosition = vec4(butterflyTBN * butterflyPosition + butterflyOffset, 1.0);

                wNormal = butterflyUp;
                wPos = worldPosition.xyz;
                vNormal = normalize((viewMatrix * vec4(butterflyUp, 0.0)).xyz);

                // this requires worldPosition and transformedNormal
                vec3 transformedNormal = normalize(normalMatrix * normal);
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
            ${scope.sinenoise_default}
            ${scope.fog_default}

            varying vec3 wPos;
            varying vec4 vPos;
            varying vec3 wNormal;
            varying vec3 vNormal;
            varying vec3 vAnimationOffset;

            varying vec2 vUv;
            varying vec4 vRand;
            varying vec2 vHighPrecisionZW;

            uniform sampler2D tButterfly;
            uniform sampler2D tButterflyFront;
            uniform vec3 uColor1;
            uniform vec3 uColor2;
            uniform vec3 uColor3;
            uniform vec3 uColor4;
            uniform vec3 uColor5;

            // for shadows
            #include <packing>
            #include <shadowmap_pars_fragment>

            mat2 rotate2d(float a) {
                float s = sin(a);
                float c = cos(a);
                return mat2(c, s, -s, c);
            }

            void main() {
                float shadowContribution = 1.0;
                float outlineContribution = 1.0;

                // butterfly 'front' view
                vec2 flapUvFront = vUv;
                flapUvFront -= 0.5;

                // butterfly 'top' view
                vec2 flapUvTop = flapUvFront;

                // flap value to drive animation
                float flapTimeline = fract(time * mix(4.0, 5.5, vRand.w) + vRand.x - 0.4 - abs(flapUvFront.x) * 0.25 + vUv.y * 0.5);
                float flapDisplacement = smoothstep(0.0, 0.4, flapTimeline);
                flapDisplacement *= smoothstep(1.0, 0.4, flapTimeline);

                // front animation
                flapUvFront.y += flapDisplacement * abs(flapUvFront.x) * 1.4;
                flapUvFront = rotate2d((vAnimationOffset.x + vAnimationOffset.y + vAnimationOffset.z) * 0.4) * flapUvFront;
                flapUvFront += 0.5;
                float front = texture2D(tButterflyFront, flapUvFront).r;

                // top animation
                flapUvTop.x *= mix(0.5, 2.0, flapDisplacement);
                flapUvTop = rotate2d((vAnimationOffset.x + vAnimationOffset.y + vAnimationOffset.z) * 0.4) * flapUvTop;
                flapUvTop.y *= 1.25;
                flapUvTop += 0.5;
                float top = texture2D(tButterfly, flapUvTop).r;

                // blend between front texture and top texture for different shapes
                float mask = mix(front * 2.0, top * 2.0, sin(time * mix(0.5, 2.0, vRand.z) + vRand.x * 10.0) * 0.5 + 0.5);
                if (mask < 0.5) discard;

                // decide which color to use
                vec3 baseColor = uColor1;
                vec3 baseColor2 = uColor2;
                vec3 baseColor3 = uColor3;
                vec3 baseColor4 = uColor4;
                vec3 baseColor5 = uColor5;

                // vec3 color = mix(baseColor, baseColor2, step(0.5, fract(vRand.x * 34.324 + vRand.y * 21.231)));
                // color = mix(color, baseColor3, step(0.5, fract(vRand.z * 5.53 + vRand.w * 4.423)));
                // color = mix(color, baseColor4, step(0.5, fract(vRand.y * 3.14 + vRand.z * 14.117)));
                // color = mix(color, baseColor5, step(0.5, fract(vRand.x * 22.14 + vRand.z * 107.98)));
                float seed = fract(vRand.x * 34.327 + vRand.y * 21.231);
                vec3 color = mix(baseColor, baseColor2, step(0.2, seed));
                color = mix(color, baseColor3, step(0.4, seed));
                color = mix(color, baseColor4, step(0.6, seed));
                color = mix(color, baseColor5, step(0.8, seed));

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
                color = mix(color * 0.5, color, shadowCut);

                addFog(color, vPos.z);

                float surfaceId = vRand.x;

                gl_FragColor = vec4(color, surfaceId);
                gInfo = vec4(1.0 - (0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5), encodeNormalSpheremap(normalize(vNormal)), outlineContribution);
            }
        `
  });
};
}
