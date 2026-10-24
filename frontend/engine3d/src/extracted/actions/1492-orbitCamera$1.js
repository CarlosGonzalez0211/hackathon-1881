/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 910455:910547.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1492(scope) {
scope.orbitCamera$1 = function orbitCamera$1(r = "perspective") {
  const e = scope.baseCamera(r),
    i = scope.orbitCamera(e);
  return new i();
};
}
