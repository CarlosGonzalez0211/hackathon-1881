/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1721630:1729971.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2101(scope) {
scope.createGrassMaterial = function createGrassMaterial() {
  const r = {
    ...scope.UniformsUtils.clone(scope.uniforms),
    charPos: {
      value: new scope.Vector3()
    },
    charSpeed: {
      value: 0
    },
    tGrass: {
      value: scope.textureLoader.load("grass-blades-highq.ktx2", "linearfilter")
    },
    tColors: {
      value: scope.textureLoader.load("atlas.png", "srgb-nearest")
    },
    tNoiseTerrain: {
      value: scope.textureLoader.load("noises-terrain.ktx2", "linearfilter-repeat")
    },
    ...scope.fogUniforms
  };
  return new scope.ShaderMaterial({
    name: "grass",
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

            // for shadows
            #include <shadowmap_pars_vertex>
            vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
                return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
            }

            void main() {
                vRand = randomm;
                vUv = uv;

                // get world position
                vec4 instancePos = instanceMatrix * vec4(position, 1.0);
                vec4 worldPosition = modelMatrix * instancePos;

                vec3 grassBottomPos = vec3(instanceMatrix[3]);
                vec3 grassDir = grassBottomPos - charPos;
                float grassDist = length(grassDir);

                // move up when looking in the up direction to prevent bottom outlines
                vec3 grassUp = normalize(up);
                vec3 grassCamDir = normalize(cameraPosition - grassBottomPos);
                float grassUpDisplacement = fit(max(0.0, dot(grassUp, grassCamDir)), 0.05, 0.3, 0.0, 1.0);

                vec3 grassOffset = grassBottomPos + grassUp * grassUpDisplacement * 0.02;
                vec3 camToGrass = normalize(grassOffset - cameraPosition);
                vec3 grassRight = cross(grassUp, camToGrass);
                vec3 grassForward = cross(grassRight, grassUp);
                mat3 grassTBN = mat3(grassRight, grassForward, grassUp);
                float grassScale = fit(fract(randomm.x + randomm.w * 2.0), 0.0, 1.0, 0.8, 1.3);

                vec3 grassPosition = position.xyz * grassScale;
                worldPosition = vec4(grassTBN * grassPosition + grassOffset, 1.0);

                // add noise
                float upMult = step(0.5, uv.y);
                float grassdisp = 0.1 + 0.2 * randomm.x;
                float grassspeed = 0.25 + 0.3 * randomm.y;
                worldPosition.xyz += grassRight * sinenoise1(vec3(grassBottomPos.x, 0.0, grassBottomPos.z) * vec3(0.05) + time * grassspeed) * grassdisp * upMult;
                worldPosition.xyz += grassRight * sinenoise1(vec3(grassBottomPos.x, 0.0, grassBottomPos.z) * vec3(0.1) + vec3(313.123) + time * grassspeed) * grassdisp * upMult;

                // repel by player movement
                vec3 grassDisp = normalize(grassDir) * fit(grassDist, 0.0, fit(charSpeed, 0.0, 0.01, 0.0, 1.25), 1.0, 0.0) * upMult * fit(charSpeed, 0.0, 0.15, 0.0, 0.3);
                if (length(grassDisp) > 0.001) {
                    grassDisp *= 1.0 - abs(dot(normalize(grassDisp), grassUp)); // displace mostly horizontally
                    worldPosition.xyz += grassDisp;
                }

                wNormal = grassUp;
                wPos = worldPosition.xyz;
                vNormal = normalize((viewMatrix * vec4(grassUp, 0.0)).xyz);

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
            varying vec3 wNormal;
            varying vec3 vNormal;
            varying vec4 vPos;

            uniform sampler2D tColors;
            uniform sampler2D tNoiseTerrain;
            uniform sampler2D tGrass;

            ${scope.getTerrainNoise()}

            varying vec2 vUv;
            varying vec4 vRand;
            varying vec2 vHighPrecisionZW;

            // for shadows
            #include <packing>
            #include <shadowmap_pars_fragment>

            void main() {
                float shadowContribution = 1.0;
                float outlineContribution = 1.0;

                vec3 color = vec3(0.0);

                #if NUM_DIR_LIGHTS > 0
                    float grassUVAmount = 10.0;
                    float grassUVX = mix(vUv.x, 1.0 - vUv.x, step(0.5, vRand.w));
                    vec2 grassUV = vec2(fract(grassUVX / grassUVAmount + 1.0 / grassUVAmount * floor(vRand.y * grassUVAmount)), vUv.y * 0.5 + 0.5 * floor(mod(vRand.z * 2.0 + vRand.x * 3.32, 2.0)));
                    float shape = texture2D(tGrass, grassUV).r;
                    if (shape > 0.1) discard;

                    // get color and add noise
                    vec3 wNorm = normalize(wNormal);
                    vec3 baseColor = applyTerrainColor(wNorm, wPos, texture2D(tColors, vec2(0.15, 0.95)).rgb);
                    vec3 colorhsv = rgb2hsv(baseColor);

                    vec3 baseColor2 = hsv2rgb(colorhsv - vec3(0.0, 0.0, 0.075));
                    vec3 baseColor3 = hsv2rgb(colorhsv + vec3(0.0, 0.0, 0.075));

                    // decide which color to use
                    vec3 grassColor = mix(baseColor, baseColor2, step(0.5, fract(vRand.x * 34.324 + vRand.y * 21.231)));
                    grassColor = mix(grassColor, baseColor3, step(0.5, fract(vRand.z * 5.53 + vRand.w * 4.423)));

                    // add noise to the outline, if the grass color is different than the baseColor, add a chance to remove the outline
                    outlineContribution *= step(0.4, sinenoise1(vec3((vUv + vec2(vRand.x * 3.34, vRand.y * 3.1)) * 7.0, vRand.z * 12.312312)) * 0.5 + 0.5);

                    // color shadow
                    vec3 colorShadow = rgb2hsv(grassColor);
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
                    color = mix(colorShadow, grassColor, shadowCut);
                #endif

                // remove outline from the bottom
                outlineContribution *= step(0.015, vUv.y) /* step(0.5, vRand.y)*/;

                float surfaceId = vRand.x;

                // fog
                // addFog(color, vPos.z);

                gl_FragColor = vec4(color, surfaceId);
                gInfo = vec4(1.0 - (0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5), encodeNormalSpheremap(normalize(vNormal)), outlineContribution);
            }
        `
  });
};
}
