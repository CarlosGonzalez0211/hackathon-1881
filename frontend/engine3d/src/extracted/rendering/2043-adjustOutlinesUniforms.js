/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1615570:1615914.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2043(scope) {
scope.adjustOutlinesUniforms = function adjustOutlinesUniforms(r, e) {
  const i = e.passes[0].finalPasses[0];
  i.uniforms.uCameraNear.value = r.camera.near, i.uniforms.uCameraFar.value = r.camera.far;
  const s = scope.customUniforms[r.name] || scope.customUniforms.planet;
  Object.keys(s).forEach(a => {
    typeof i.uniforms[a].value == "number" ? i.uniforms[a].value = s[a].value : i.uniforms[a].value.copy(s[a].value);
  });
};
}
