/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 155952:156388.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0516(scope) {
scope.cloneUniforms = function cloneUniforms(r) {
  const e = {};
  for (const i in r) {
    e[i] = {};
    for (const s in r[i]) {
      const a = r[i][s];
      a && (a.isColor || a.isMatrix3 || a.isMatrix4 || a.isVector2 || a.isVector3 || a.isVector4 || a.isTexture || a.isQuaternion) ? a.isRenderTargetTexture ? (console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."), e[i][s] = null) : e[i][s] = a.clone() : Array.isArray(a) ? e[i][s] = a.slice() : e[i][s] = a;
    }
  }
  return e;
};
}
