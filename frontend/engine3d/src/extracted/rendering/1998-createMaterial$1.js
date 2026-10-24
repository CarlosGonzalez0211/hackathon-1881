/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1552545:1554563.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1998(scope) {
scope.createMaterial$1 = function createMaterial$1(r) {
  return new scope.ShaderMaterial({
    uniformsGroups: [scope.global$1.UBO],
    uniforms: {
      uColor1: {
        value: new scope.Color()
      },
      uColor2: {
        value: new scope.Color()
      },
      tBand: {
        value: null
      },
      tCurve: {
        value: null
      },
      uShowDistance: {
        value: 1
      },
      uScale: {
        value: 1
      },
      uShow: {
        value: 1
      },
      uPulse: {
        value: 0
      },
      uWiggleDir: {
        value: new scope.Vector3(0, 1, 0)
      }
    },
    vertexShader: `
            ${scope.globalUBO_default}
            ${scope.matrixutils_default}
            ${scope.slugvs_default}

            varying vec2 vUv;
            varying vec2 vHighPrecisionZW;

            uniform float uShowDistance;
            uniform float uScale;
            uniform float uShow;
            uniform float uPulse;
            uniform vec3 uWiggleDir;

            void main() {
                vUv = uv;

                vec3 pos = SlugVS();
                vec3 wPos = (modelMatrix * vec4(pos, 1.0)).xyz;

                float scale = smoothstep(uShowDistance, uShowDistance * 0.8, distance(wPos, cameraPosition)) * uScale * uShow;
                scale = mix(scale, scale * 1.2, uPulse);

                pos *= scale;
                pos += uWiggleDir * (0.05 + 0.05 * sin(time * 4.0));

                gl_Position = projectionMatrix * viewMatrix * billboardModelMatrix() * vec4(pos, 1.0);
                vHighPrecisionZW = gl_Position.zw;
            }
        `,
    fragmentShader: `
            layout(location = 1) out highp vec4 gInfo;

            ${scope.slugfs_default}

            varying vec2 vUv;
            varying vec2 vHighPrecisionZW;

            uniform sampler2D tCurve;
            uniform usampler2D tBand;
            uniform vec3 uColor1;
            uniform vec3 uColor2;

            void main() {
                vec4 color = RenderSlug(tCurve, tBand, vTexCoord, vColor, vBanding, vGlyph);
                if (color.w * vColor.w < 0.001) discard;

                gl_FragColor = vec4(color.rgb, 0.0);
                gInfo = vec4(1.0 - (0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5), vec3(0.0));
            }
        `
  });
};
}
