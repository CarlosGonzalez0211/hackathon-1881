/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 327731:328242.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0822(scope) {
scope.getTextureTypeByteLength = function getTextureTypeByteLength(r) {
  switch (r) {
    case scope.UnsignedByteType:
    case scope.ByteType:
      return {
        byteLength: 1,
        components: 1
      };
    case scope.UnsignedShortType:
    case scope.ShortType:
    case scope.HalfFloatType:
      return {
        byteLength: 2,
        components: 1
      };
    case scope.UnsignedShort4444Type:
    case scope.UnsignedShort5551Type:
      return {
        byteLength: 2,
        components: 4
      };
    case scope.UnsignedIntType:
    case scope.IntType:
    case scope.FloatType:
      return {
        byteLength: 4,
        components: 1
      };
    case scope.UnsignedInt5999Type:
    case scope.UnsignedInt101111Type:
      return {
        byteLength: 4,
        components: 3
      };
  }
  throw new Error(`Unknown texture type ${r}.`);
};
}
