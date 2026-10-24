/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 156388:156517.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0517(scope) {
scope.mergeUniforms = function mergeUniforms(r) {
  const e = {};
  for (let i = 0; i < r.length; i++) {
    const s = scope.cloneUniforms(r[i]);
    for (const a in s) e[a] = s[a];
  }
  return e;
};
}
