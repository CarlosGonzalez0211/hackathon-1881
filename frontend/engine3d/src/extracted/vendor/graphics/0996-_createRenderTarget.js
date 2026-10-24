/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 503798:503969.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0996(scope) {
scope._createRenderTarget = function _createRenderTarget(r, e, i) {
  const s = new scope.WebGLRenderTarget(r, e, i);
  return s.texture.mapping = scope.CubeUVReflectionMapping, s.texture.name = "PMREM.cubeUv", s.scissorTest = !0, s;
};
}
