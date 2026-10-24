/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 526768:527262.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1078(scope) {
scope.getToneMappingFunction = function getToneMappingFunction(r, e) {
  let i;
  switch (e) {
    case scope.LinearToneMapping:
      i = "Linear";
      break;
    case scope.ReinhardToneMapping:
      i = "Reinhard";
      break;
    case scope.CineonToneMapping:
      i = "Cineon";
      break;
    case scope.ACESFilmicToneMapping:
      i = "ACESFilmic";
      break;
    case scope.AgXToneMapping:
      i = "AgX";
      break;
    case scope.NeutralToneMapping:
      i = "Neutral";
      break;
    case scope.CustomToneMapping:
      i = "Custom";
      break;
    default:
      console.warn("THREE.WebGLProgram: Unsupported toneMapping:", e), i = "Linear";
  }
  return "vec3 " + r + "( vec3 color ) { return " + i + "ToneMapping( color ); }";
};
}
