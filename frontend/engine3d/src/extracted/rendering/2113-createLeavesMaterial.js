/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1742215:1751705.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2113(scope) {
scope.createLeavesMaterial = function createLeavesMaterial(r) {
  const e = {
    ...scope.UniformsUtils.clone(scope.uniforms),
    uScale: {
      value: .28
    },
    uLeavesShake: {
      value: .25
    },
    uShakeSpeed: {
      value: .75
    },
    uNearFar: {
      value: new scope.Vector2(r.near, r.far)
    },
    tTrees: {
      value: scope.textureLoader.load("tree-leaves.ktx2")
    },
    tTreeDetail: {
      value: scope.textureLoader.load("tree-leaves-detail.ktx2")
    },
    uColor1: {
      value: new scope.Color("#5b9f7b")
    },
    uColor2: {
      value: new scope.Color("#649c75")
    },
    uColor3: {
      value: new scope.Color("#4e8c6d")
    },
    charPos: {
      value: new scope.Vector3()
    },
    charSpeed: {
      value: 0
    },
    ...scope.fogUniforms
  };
  return new scope.ShaderMaterial({
    userData: {
      hotReload: "trees-leaves"
    },
    name: "trees-leaves",
    lights: !0,
    uniformsGroups: [scope.global$1.UBO],
    uniforms: e,
    shadowSide: scope.FrontSide,
    vertexShader: `
            #define PI2 6.283185307179586

            // for light direction
            struct DirectionalLight {
                vec3 direction;
                vec3 color;
            };
            uniform DirectionalLight directionalLights[ 1 ];

            // for shadows
            #include <shadowmap_pars_vertex>
            vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
                return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
            }

            ${scope.globalUBO_default}
            ${scope.matrixutils_default}
            ${scope.fit_default}
            ${scope.rotate_default}
            ${scope.sinenoise_default}

            attribute vec3 centr;
            attribute vec3 centr_tree;
            attribute vec4 rand;
            attribute int detail;
            attribute int leavescolor;

            varying vec2 vUv;
            varying vec4 vRand;
            varying vec4 vPos;
            varying vec2 vHighPrecisionZW;
            flat varying vec3 vCentrTree;

            flat varying vec3 vNormal;
            flat varying vec3 vLightDir;
            flat varying int vDetail;
            flat varying float vColor;

            uniform float uLeavesShake;
            uniform float uShakeSpeed;
            uniform float uScale;

            uniform vec3 charPos;
            uniform float charSpeed;

            void main() {
                vUv = mix(uv, vec2(1.0 - uv.x, uv.y), step(0.5, rand.x));
                vRand = rand;
                vDetail = detail;
                vCentrTree = centr_tree;
                vLightDir = vec3(0.0);
                vColor = float(leavescolor);

                #if NUM_DIR_LIGHTS > 0
                    vLightDir = normalize(directionalLights[0].direction);
                #endif

                float scale = mix(0.5, 1.0, vRand.w) * uScale;
                float shake = sinenoise1(vec3(centr * 2.0) + vec3(-time * 0.1 * uShakeSpeed, 0.0, time * 0.15 * uShakeSpeed)) * PI2 * uLeavesShake * mix(0.25, 1.0, vRand.y);

                mat3 rot = mat3(1.0);

                if (detail == 1) {
                    vec2 aspectVec = vec2(resolution.x / resolution.y, 1.0);

                    // get screen position of the quad and the center of the bush
                    vec4 quadPos = projectionMatrix * modelViewMatrix * vec4(centr, 1.0);
                    vec4 bushPos = projectionMatrix * modelViewMatrix * vec4(centr_tree, 1.0);
                    vec2 quad2D = quadPos.xy / quadPos.w * aspectVec;
                    vec2 bush2D = bushPos.xy / bushPos.w * aspectVec;

                    // rotate towards the center of the bush
                    vec2 dir = normalize(quad2D - bush2D);
                    float angle = atan(dir.y, dir.x);
                    rot = rotateZ(angle - PI2 * 0.25);

                } else {
                    rot = rotateZ(fit(vRand.z, 0.0, 1.0, -PI2, PI2) + shake);
                }

                // shake with player movement
                float distToPlayer = length(charPos - centr);
                float disp = fit(distToPlayer, 0.0, fit(charSpeed, 0.0, 0.001, 0.0, 0.85), 1.0, 0.0) * fit(charSpeed, 0.0, 0.15, 0.0, 10.0);
                if (length(disp) > 0.001) rot = rotateZ(sin(disp) * 0.15 * sign(rand.w - 0.5)) * rot;

                vec3 posLeaf = rot * vec3(uv * 2.0 - 1.0, 0.0) * scale;

                vec3 pos = centr;
                vec3 right = getViewRight();
                vec3 up = getViewUp();
                vec3 back = getViewBack();
                pos += right * posLeaf.x;
                pos += up * posLeaf.y;
                pos += back * posLeaf.z;

                // shake a bit
                float shakePosMult = 2.0;
                float shakeDisp = 0.025;
                float shakeSpeed = 1.1;
                vec3 shakeX = right * sin((centr.x + centr.y) * shakePosMult + 534.35 + time * shakeSpeed) * shakeDisp;
                vec3 shakeZ = back * sin((centr.z + centr.y) * shakePosMult + 543.55 + time * shakeSpeed * 0.5) * shakeDisp;
                pos -= centr;
                pos += shakeX + shakeZ;
                pos += centr;

                vNormal = normalize(normalMatrix * normal);

                // for shadows
                vec3 transformedNormal = vNormal;
                vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
                #include <shadowmap_vertex>

                vPos = viewMatrix * worldPosition;

                gl_Position = projectionMatrix * vPos;

                // save same depth for all leaves
                vec4 centrPos = projectionMatrix * modelViewMatrix * vec4(centr_tree, 1.0);
                vHighPrecisionZW = centrPos.zw;
            }
        `,
    fragmentShader: `
            layout(location = 1) out highp vec4 gInfo;

            // for shadows
            #include <packing>
            #include <shadowmap_pars_fragment>

            ${scope.globalUBO_default}
            ${scope.encoding_default}
            ${scope.sinenoise_default}
            ${scope.colorutils_default}
            ${scope.fog_default}

            varying vec2 vUv;
            varying vec4 vPos;
            varying vec4 vRand;
            varying vec2 vHighPrecisionZW;
            flat varying vec3 vCentrTree;
            flat varying int vDetail;
            flat varying vec3 vNormal;
            flat varying vec3 vLightDir;
            flat varying float vColor;

            uniform sampler2D tTrees;
            uniform sampler2D tTreeDetail;
            uniform vec3 uColor1;
            uniform vec3 uColor2;
            uniform vec3 uColor3;
            uniform vec2 uNearFar;

            void main() {
                float surfaceId = fract((vCentrTree.x + vCentrTree.y + vCentrTree.z) * 3.424);
                float negativeDistance = perspectiveDepthToViewZ(gl_FragCoord.z, uNearFar.x, uNearFar.y);

                if (vDetail == 1) {
                    float shapes = 5.0;
                    float shapesStep = 1.0 / shapes;
                    float offset = floor(mod((vRand.z * 4.35 + vRand.w * 43.5) * shapes, shapes));
                    vec2 uv = vec2(vUv.x * shapesStep + offset * shapesStep, vUv.y);
                    float shape = texture2D(tTreeDetail, uv).r;
                    if (shape > 0.9) discard;

                    surfaceId = fract(vRand.x * 32.234);

                    // move details nearest to the camera
                    gl_FragDepth = viewZToPerspectiveDepth(negativeDistance + 0.2, uNearFar.x, uNearFar.y);
                } else {
                    float shape = texture2D(tTrees, vUv).r;
                    if (shape > 0.9) discard;

                    float noise = sinenoise1(vec3(vUv * mix(0.8, 1.0, vRand.z) * 5.0, time * 0.1));
                    gl_FragDepth = viewZToPerspectiveDepth(negativeDistance + noise * 0.1, uNearFar.x, uNearFar.y);
                }

                float outlineContribution = step(sinenoise1(vec3(vUv * 2.0, vRand.x + vRand.w * 34.32)), 0.35);

                // light
                vec3 geometryNormal = normalize(vNormal);
                float light = dot(geometryNormal, normalize(vLightDir));

                // shadow
                float shadow = 0.0;
                #if defined(USE_SHADOWMAP) && NUM_DIR_LIGHTS > 0 && NUM_DIR_LIGHT_SHADOWS > 0
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

                light = min(light, shadow);

                vec3 grassColor = mix(uColor1, uColor2, clamp(vColor, 0.0, 1.0));
                grassColor = mix(grassColor, uColor3, clamp(vColor - 1.0, 0.0, 1.0));

                vec3 colorhsv = rgb2hsv(grassColor);
                vec3 colorShadow = colorhsv;
                colorShadow.r -= 0.02;
                colorShadow.b *= 0.5;
                colorShadow = hsv2rgb(colorShadow);

                vec3 color = mix(colorShadow, grassColor, smoothstep(0.0, 0.1, light));

                addFog(color, vPos.z);

                gl_FragColor = vec4(color, surfaceId);
                gInfo = vec4(1.0 - (0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5), vec2(0.0), outlineContribution);
            }
        `
  });
};
}
