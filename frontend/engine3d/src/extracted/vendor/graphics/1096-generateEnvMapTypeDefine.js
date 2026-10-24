/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 531187:531431.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1096(scope) {
scope.generateEnvMapTypeDefine = function generateEnvMapTypeDefine(r) {
  let e = "ENVMAP_TYPE_CUBE";
  if (r.envMap) switch (r.envMapMode) {
    case scope.CubeReflectionMapping:
    case scope.CubeRefractionMapping:
      e = "ENVMAP_TYPE_CUBE";
      break;
    case scope.CubeUVReflectionMapping:
      e = "ENVMAP_TYPE_CUBE_UV";
      break;
  }
  return e;
};
}
