/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 865986:866250.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1424(scope) {
scope.getNormalizedComponentScale = function getNormalizedComponentScale(r) {
  switch (r) {
    case Int8Array:
      return 1 / 127;
    case Uint8Array:
      return 1 / 255;
    case Int16Array:
      return 1 / 32767;
    case Uint16Array:
      return 1 / 65535;
    default:
      throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.");
  }
};
}
