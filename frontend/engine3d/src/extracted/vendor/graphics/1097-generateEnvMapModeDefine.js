/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 531431:531601.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1097(scope) {
scope.generateEnvMapModeDefine = function generateEnvMapModeDefine(r) {
  let e = "ENVMAP_MODE_REFLECTION";
  if (r.envMap) switch (r.envMapMode) {
    case scope.CubeRefractionMapping:
      e = "ENVMAP_MODE_REFRACTION";
      break;
  }
  return e;
};
}
