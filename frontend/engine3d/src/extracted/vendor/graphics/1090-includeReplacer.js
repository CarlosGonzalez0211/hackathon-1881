/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 529324:529632.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1090(scope) {
scope.includeReplacer = function includeReplacer(r, e) {
  let i = scope.ShaderChunk[e];
  if (i === void 0) {
    const s = scope.shaderChunkMap.get(e);
    if (s !== void 0) i = scope.ShaderChunk[s], console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.', e, s);else throw new Error("Can not resolve #include <" + e + ">");
  }
  return scope.resolveIncludes(i);
};
}
