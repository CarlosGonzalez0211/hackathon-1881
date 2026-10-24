/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1267811:1268664.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1718(scope) {
scope.skyMaterial = function skyMaterial(r = {}) {
  const e = scope.UniformsUtils.merge([scope.UniformsLib.common, scope.UniformsLib.lights, {
    uColor: {
      value: new scope.Color("#75bdc3")
    }
  }]);
  return new scope.ShaderMaterial({
    uniformsGroups: [scope.global$1.UBO],
    uniforms: e,
    vertexShader: `
            ${scope.globalUBO_default}

            void main() {
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
    fragmentShader: `
            layout(location = 1) out highp vec4 gInfo;

            ${scope.globalUBO_default}

            uniform vec3 uColor;

            void main() {

                float outlineContribution = 1.0;
                float surfaceId = 1.0;
                vec3 color = uColor;
                gl_FragColor = vec4(color, surfaceId);
                gInfo = vec4(0.0, vec2(0.0), outlineContribution);

            }
        `
  });
};
}
