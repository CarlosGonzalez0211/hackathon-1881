/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 974170:974228.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1597(scope) {
scope.orthographicDepthToViewZ = function orthographicDepthToViewZ(r, e, i) {
  return r * (e - i) - e;
};
}
