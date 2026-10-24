/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1206080:1209208.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1697(scope) {
scope.outlines$1 = class extends scope.ShaderMaterial {
  constructor(e) {
    super({
      uniformsGroups: [scope.global$1.UBO],
      uniforms: {
        tDiffuse: {
          value: null
        },
        tInfo: {
          value: null
        },
        uCameraNear: {
          value: e.camera.near,
          ignore: !0
        },
        uCameraFar: {
          value: e.camera.far,
          ignore: !0
        },
        tLUT: {
          value: scope.textureLoader.load("lut.ktx2", "luttetrahedral")
        },
        uLUTIntensity: {
          value: 1
        },
        uOutlineFade: {
          value: new scope.Vector2()
        },
        uOutlineThickness: {
          value: 0
        },
        uOutlineColor: {
          value: new scope.Color("#ff0000")
        },
        uInfoRange: {
          value: new scope.Vector3()
        },
        uInfoMinScale: {
          value: 0
        },
        uDepthRange: {
          value: new scope.Vector3()
        },
        uNormalRange: {
          value: new scope.Vector3()
        },
        uOutlineScale: {
          value: 0
        },
        uSmoothMargin: {
          value: 0
        }
      },
      vertexShader: `
                ${scope.globalUBO_default}

                varying vec2 vUv;

                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `,
      fragmentShader: `
                ${scope.globalUBO_default}

                uniform sampler2D tDiffuse;
                uniform sampler2D tInfo;

                uniform float uCameraNear;
                uniform float uCameraFar;

                uniform vec2 uOutlineDepth;

                uniform vec2 uOutlineFade;
                uniform float uOutlineThickness;
                uniform vec3 uOutlineColor;
                uniform float uOutlineScale;

                uniform vec3 uInfoRange;
                uniform vec3 uDepthRange;
                uniform vec3 uNormalRange;
                uniform float uSmoothMargin;
                uniform float uInfoMinScale;

                ${scope.lut_default}
                uniform sampler3D tLUT;
                uniform float uLUTIntensity;

                varying vec2 vUv;

                ${scope.fit_default}
                ${scope.depth_default}
                ${scope.encoding_default}
                ${scope.custom_default}

                void main() {
                    vec2 uv = vUv;
                    float aspect = resolution.x / resolution.y;

                    // get scene color
                    vec4 scene = texture2D(tDiffuse, vUv);
                    vec3 sceneColor = scene.rgb;

                    // compensate outline scale with resolution
                    float resScale = min(1.0, resolution.y / 1300.0) * uOutlineScale;

                    // get outline value
                    float centerDepth = 0.0;
                    float nearestDepth = 0.0;
                    float outlineValue = outline(tDiffuse, tInfo, vUv, uOutlineThickness, resScale, uInfoRange, uDepthRange, uNormalRange, uSmoothMargin, uInfoMinScale, uOutlineFade, vec2(uCameraNear, uCameraFar), nearestDepth, centerDepth);

                    // add the outline to the scene
                    sceneColor = mix(sceneColor, uOutlineColor, outlineValue);

                    // add color correction
                    sceneColor = apply3DLUTTetrahedral(sceneColor, tLUT, uLUTIntensity);

                    // outline debug
                    // gl_FragColor = vec4(vec3(outlineValue), 1.0); // debug

                    gl_FragColor = vec4(sceneColor, 1.0);
                }
            `
    });
  }
};
}
