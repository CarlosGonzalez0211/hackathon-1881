/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 531864:532054.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1099(scope) {
scope.generateCubeUVSize = function generateCubeUVSize(r) {
  const e = r.envMapCubeUVHeight;
  if (e === null) return null;
  const i = Math.log2(e) - 2,
    s = 1 / e;
  return {
    texelWidth: 1 / (3 * Math.max(Math.pow(2, i), 7 * 16)),
    texelHeight: s,
    maxMip: i
  };
};
}
