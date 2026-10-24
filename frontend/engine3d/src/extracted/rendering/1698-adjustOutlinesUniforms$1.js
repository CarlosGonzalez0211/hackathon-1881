/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1209209:1209559.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1698(scope) {
scope.adjustOutlinesUniforms$1 = function adjustOutlinesUniforms$1(r, e) {
  const i = e.passes[0].finalPasses[0];
  i.uniforms.uCameraNear.value = r.camera.near, i.uniforms.uCameraFar.value = r.camera.far;
  const s = scope.customUniforms$1[r.name] || scope.customUniforms$1.planet;
  Object.keys(s).forEach(a => {
    typeof i.uniforms[a].value == "number" ? i.uniforms[a].value = s[a].value : i.uniforms[a].value.copy(s[a].value);
  });
};
}
