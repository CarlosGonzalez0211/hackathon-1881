/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 33901:34260.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0364(scope) {
scope.denormalize = function denormalize(r, e) {
  switch (e.constructor) {
    case Float32Array:
      return r;
    case Uint32Array:
      return r / 4294967295;
    case Uint16Array:
      return r / 65535;
    case Uint8Array:
      return r / 255;
    case Int32Array:
      return Math.max(r / 2147483647, -1);
    case Int16Array:
      return Math.max(r / 32767, -1);
    case Int8Array:
      return Math.max(r / 127, -1);
    default:
      throw new Error("Invalid component type.");
  }
};
}
