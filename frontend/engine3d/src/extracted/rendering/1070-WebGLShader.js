/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 525519:525621.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1070(scope) {
scope.WebGLShader = function WebGLShader(r, e, i) {
  const s = r.createShader(e);
  return r.shaderSource(s, i), r.compileShader(s), s;
};
}
