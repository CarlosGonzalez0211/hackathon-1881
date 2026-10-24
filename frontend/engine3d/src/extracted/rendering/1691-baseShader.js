/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1190181:1192275.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1691(scope) {
scope.baseShader = class baseShader extends scope.ShaderMaterial {
  constructor() {
    super({
      uniformsGroups: [scope.global$1.UBO],
      uniforms: {
        tScene: {
          value: null
        },
        uWipe1: {
          value: 1
        },
        uWipe2: {
          value: 0
        },
        uWipeColor: {
          value: new scope.Color("#ffffff")
        },
        uFlash: {
          value: 0
        },
        uOverlay: {
          value: 0
        },
        uOverlayColor: {
          value: new scope.Color("#283436")
        }
      },
      vertexShader: `
                varying vec2 vUv;

                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `,
      fragmentShader: `
                ${scope.globalUBO_default}
                ${scope.falloff_default}
                ${scope.colorutils_default}

                uniform sampler2D tScene;
                uniform float uWipe1;
                uniform float uWipe2;
                uniform vec3 uWipeColor;
                uniform float uOverlay;
                uniform vec3 uOverlayColor;
                uniform float uFlash;

                varying vec2 vUv;

                void main() {
                    vec4 scene = texture2D(tScene, vUv);
                    vec3 color = scene.rgb;

                    // overlay
                    color = mix(color, uOverlayColor, clamp(uOverlay, 0.0, 1.0) * 0.9);

                    // wipes
                    if (uFlash > 0.0) {
                        color = vibrance(color, uFlash * 1.0);
                        color = brightnessContrast(color, uFlash, 1.0);
                    }

                    float inclination1 = 0.3 * uWipe1;
                    float uv1 = vUv.y - (1.0 - vUv.x) * inclination1;
                    float wipe1 = falloff(uv1, 1.0, -inclination1, 1e-6, uWipe1);

                    float inclination2 = 0.3 * (1.0 - uWipe2);
                    float uv2 = vUv.y - vUv.x * inclination2;
                    float wipe2 = falloff(uv2, -inclination2, 1.0, 1e-6, uWipe2);

                    color = mix(color, uWipeColor, wipe1);
                    color = mix(color, uWipeColor, wipe2);

                    gl_FragColor = vec4(color, 1.0);
                }
            `,
      depthTest: !1,
      depthWrite: !1
    });
  }
};
}
