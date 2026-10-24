/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1588558:1591340.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2027(scope) {
scope.material = function material(r = {}) {
  const e = scope.UniformsUtils.merge([scope.UniformsLib.common, scope.UniformsLib.lights, {
    uColor: {
      value: new scope.Color("#F6CF5F")
    },
    uColor2: {
      value: new scope.Color("#BD8A42")
    },
    tNoise: {
      value: null
    },
    uSeed: {
      value: Math.random()
    },
    uHover: {
      value: 0
    }
  }]);
  return e.tNoise.value = scope.textureLoader.load("clouds_noise_64.ktx2", "srgb-repeat"), new scope.ShaderMaterial({
    userData: {
      hotReload: "button"
    },
    uniformsGroups: [scope.global$1.UBO],
    uniforms: e,
    vertexShader: `
            ${scope.globalUBO_default}
            ${scope.rotate_default}

            attribute int vertid;
            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec2 vHighPrecisionZW;

            uniform float uSeed;
            uniform float uHover;

            vec3 hash31(float p) {
                vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973));
                p3 += dot(p3, p3.yzx+33.33);
                return fract((p3.xxy+p3.yzz)*p3.zyx);
            }

            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);

                // random stepped rotation animation
                float t = floor(time * 3.0);
                vec3 axis = normalize(hash31(t) * 2.0 - 1.0);
                float angle = 0.02;

                vec4 pos = vec4(position, 1.0);
                float seed = fract((uSeed) * 54.32 + float(vertid) * 31.2344);
                vec3 dir = normalize(position.xyz);
                pos.xyz += dir * seed * 0.3;
                pos.xyz *= 1.0 + 0.05 * uHover;

                pos = rotation3D(axis, angle) * pos;

                // ignore view matrix to lock title in position
                gl_Position = projectionMatrix * modelViewMatrix * pos;
                vHighPrecisionZW = gl_Position.zw;
            }
        `,
    fragmentShader: `
            layout(location = 1) out highp vec4 gInfo;

            ${scope.globalUBO_default}
            ${scope.encoding_default}

            varying vec3 vNormal;
            varying vec2 vUv;
            varying vec2 vHighPrecisionZW;

            uniform sampler2D tNoise;
            uniform vec3 uColor;
            uniform vec3 uColor2;

            void main() {
                vec4 noise = texture(tNoise, vUv * 1.0);

                float outlineContribution = step(0.2, noise.r);
                float surfaceId = 0.34242;

                float facing = abs(dot(normalize(vNormal), normalize(vec3(0.0, 0.0, 1.0))));
                vec3 color = mix(uColor, uColor2, 1.0 - smoothstep(0.2, 0.8, facing));

                gl_FragColor = vec4(color, 1.0);
                gInfo = vec4(1.0 - (0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5), encodeNormalSpheremap(normalize(vNormal)), outlineContribution);
            }
        `
  });
};
}
