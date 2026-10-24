/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 531601:531864.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1098(scope) {
scope.generateEnvMapBlendingDefine = function generateEnvMapBlendingDefine(r) {
  let e = "ENVMAP_BLENDING_NONE";
  if (r.envMap) switch (r.combine) {
    case scope.MultiplyOperation:
      e = "ENVMAP_BLENDING_MULTIPLY";
      break;
    case scope.MixOperation:
      e = "ENVMAP_BLENDING_MIX";
      break;
    case scope.AddOperation:
      e = "ENVMAP_BLENDING_ADD";
      break;
  }
  return e;
};
}
