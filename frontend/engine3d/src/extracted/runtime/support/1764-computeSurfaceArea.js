/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1324483:1324579.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1764(scope) {
scope.computeSurfaceArea = function computeSurfaceArea(r) {
  const e = r[3] - r[0],
    i = r[4] - r[1],
    s = r[5] - r[2];
  return 2 * (e * i + i * s + s * e);
};
}
