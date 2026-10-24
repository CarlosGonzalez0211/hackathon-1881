/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 34260:34650.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0365(scope) {
scope.normalize = function normalize(r, e) {
  switch (e.constructor) {
    case Float32Array:
      return r;
    case Uint32Array:
      return Math.round(r * 4294967295);
    case Uint16Array:
      return Math.round(r * 65535);
    case Uint8Array:
      return Math.round(r * 255);
    case Int32Array:
      return Math.round(r * 2147483647);
    case Int16Array:
      return Math.round(r * 32767);
    case Int8Array:
      return Math.round(r * 127);
    default:
      throw new Error("Invalid component type.");
  }
};
}
