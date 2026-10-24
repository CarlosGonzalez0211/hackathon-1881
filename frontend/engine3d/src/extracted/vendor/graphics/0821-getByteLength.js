/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 325190:327731.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0821(scope) {
scope.getByteLength = function getByteLength(r, e, i, s) {
  const a = scope.getTextureTypeByteLength(s);
  switch (i) {
    case scope.AlphaFormat:
      return r * e;
    case scope.RedFormat:
      return r * e / a.components * a.byteLength;
    case scope.RedIntegerFormat:
      return r * e / a.components * a.byteLength;
    case scope.RGFormat:
      return r * e * 2 / a.components * a.byteLength;
    case scope.RGIntegerFormat:
      return r * e * 2 / a.components * a.byteLength;
    case scope.RGBFormat:
      return r * e * 3 / a.components * a.byteLength;
    case scope.RGBAFormat:
      return r * e * 4 / a.components * a.byteLength;
    case scope.RGBAIntegerFormat:
      return r * e * 4 / a.components * a.byteLength;
    case scope.RGB_S3TC_DXT1_Format:
    case scope.RGBA_S3TC_DXT1_Format:
      return Math.floor((r + 3) / 4) * Math.floor((e + 3) / 4) * 8;
    case scope.RGBA_S3TC_DXT3_Format:
    case scope.RGBA_S3TC_DXT5_Format:
      return Math.floor((r + 3) / 4) * Math.floor((e + 3) / 4) * 16;
    case scope.RGB_PVRTC_2BPPV1_Format:
    case scope.RGBA_PVRTC_2BPPV1_Format:
      return Math.max(r, 16) * Math.max(e, 8) / 4;
    case scope.RGB_PVRTC_4BPPV1_Format:
    case scope.RGBA_PVRTC_4BPPV1_Format:
      return Math.max(r, 8) * Math.max(e, 8) / 2;
    case scope.RGB_ETC1_Format:
    case scope.RGB_ETC2_Format:
      return Math.floor((r + 3) / 4) * Math.floor((e + 3) / 4) * 8;
    case scope.RGBA_ETC2_EAC_Format:
      return Math.floor((r + 3) / 4) * Math.floor((e + 3) / 4) * 16;
    case scope.RGBA_ASTC_4x4_Format:
      return Math.floor((r + 3) / 4) * Math.floor((e + 3) / 4) * 16;
    case scope.RGBA_ASTC_5x4_Format:
      return Math.floor((r + 4) / 5) * Math.floor((e + 3) / 4) * 16;
    case scope.RGBA_ASTC_5x5_Format:
      return Math.floor((r + 4) / 5) * Math.floor((e + 4) / 5) * 16;
    case scope.RGBA_ASTC_6x5_Format:
      return Math.floor((r + 5) / 6) * Math.floor((e + 4) / 5) * 16;
    case scope.RGBA_ASTC_6x6_Format:
      return Math.floor((r + 5) / 6) * Math.floor((e + 5) / 6) * 16;
    case scope.RGBA_ASTC_8x5_Format:
      return Math.floor((r + 7) / 8) * Math.floor((e + 4) / 5) * 16;
    case scope.RGBA_ASTC_8x6_Format:
      return Math.floor((r + 7) / 8) * Math.floor((e + 5) / 6) * 16;
    case scope.RGBA_ASTC_8x8_Format:
      return Math.floor((r + 7) / 8) * Math.floor((e + 7) / 8) * 16;
    case scope.RGBA_ASTC_10x5_Format:
      return Math.floor((r + 9) / 10) * Math.floor((e + 4) / 5) * 16;
    case scope.RGBA_ASTC_10x6_Format:
      return Math.floor((r + 9) / 10) * Math.floor((e + 5) / 6) * 16;
    case scope.RGBA_ASTC_10x8_Format:
      return Math.floor((r + 9) / 10) * Math.floor((e + 7) / 8) * 16;
    case scope.RGBA_ASTC_10x10_Format:
      return Math.floor((r + 9) / 10) * Math.floor((e + 9) / 10) * 16;
    case scope.RGBA_ASTC_12x10_Format:
      return Math.floor((r + 11) / 12) * Math.floor((e + 9) / 10) * 16;
    case scope.RGBA_ASTC_12x12_Format:
      return Math.floor((r + 11) / 12) * Math.floor((e + 11) / 12) * 16;
    case scope.RGBA_BPTC_Format:
    case scope.RGB_BPTC_SIGNED_Format:
    case scope.RGB_BPTC_UNSIGNED_Format:
      return Math.ceil(r / 4) * Math.ceil(e / 4) * 16;
    case scope.RED_RGTC1_Format:
    case scope.SIGNED_RED_RGTC1_Format:
      return Math.ceil(r / 4) * Math.ceil(e / 4) * 8;
    case scope.RED_GREEN_RGTC2_Format:
    case scope.SIGNED_RED_GREEN_RGTC2_Format:
      return Math.ceil(r / 4) * Math.ceil(e / 4) * 16;
  }
  throw new Error(`Unable to determine texture byte length for ${i} format.`);
};
}
