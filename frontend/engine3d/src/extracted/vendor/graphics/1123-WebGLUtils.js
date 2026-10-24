/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 612809:618709.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1123(scope) {
scope.WebGLUtils = function WebGLUtils(r, e) {
  function i(s, a = scope.NoColorSpace) {
    let o;
    const l = scope.ColorManagement.getTransfer(a);
    if (s === scope.UnsignedByteType) return r.UNSIGNED_BYTE;
    if (s === scope.UnsignedShort4444Type) return r.UNSIGNED_SHORT_4_4_4_4;
    if (s === scope.UnsignedShort5551Type) return r.UNSIGNED_SHORT_5_5_5_1;
    if (s === scope.UnsignedInt5999Type) return r.UNSIGNED_INT_5_9_9_9_REV;
    if (s === scope.UnsignedInt101111Type) return r.UNSIGNED_INT_10F_11F_11F_REV;
    if (s === scope.ByteType) return r.BYTE;
    if (s === scope.ShortType) return r.SHORT;
    if (s === scope.UnsignedShortType) return r.UNSIGNED_SHORT;
    if (s === scope.IntType) return r.INT;
    if (s === scope.UnsignedIntType) return r.UNSIGNED_INT;
    if (s === scope.FloatType) return r.FLOAT;
    if (s === scope.HalfFloatType) return r.HALF_FLOAT;
    if (s === scope.AlphaFormat) return r.ALPHA;
    if (s === scope.RGBFormat) return r.RGB;
    if (s === scope.RGBAFormat) return r.RGBA;
    if (s === scope.DepthFormat) return r.DEPTH_COMPONENT;
    if (s === scope.DepthStencilFormat) return r.DEPTH_STENCIL;
    if (s === scope.RedFormat) return r.RED;
    if (s === scope.RedIntegerFormat) return r.RED_INTEGER;
    if (s === scope.RGFormat) return r.RG;
    if (s === scope.RGIntegerFormat) return r.RG_INTEGER;
    if (s === scope.RGBAIntegerFormat) return r.RGBA_INTEGER;
    if (s === scope.RGB_S3TC_DXT1_Format || s === scope.RGBA_S3TC_DXT1_Format || s === scope.RGBA_S3TC_DXT3_Format || s === scope.RGBA_S3TC_DXT5_Format) if (l === scope.SRGBTransfer) {
      if (o = e.get("WEBGL_compressed_texture_s3tc_srgb"), o !== null) {
        if (s === scope.RGB_S3TC_DXT1_Format) return o.COMPRESSED_SRGB_S3TC_DXT1_EXT;
        if (s === scope.RGBA_S3TC_DXT1_Format) return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
        if (s === scope.RGBA_S3TC_DXT3_Format) return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
        if (s === scope.RGBA_S3TC_DXT5_Format) return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
      } else return null;
    } else if (o = e.get("WEBGL_compressed_texture_s3tc"), o !== null) {
      if (s === scope.RGB_S3TC_DXT1_Format) return o.COMPRESSED_RGB_S3TC_DXT1_EXT;
      if (s === scope.RGBA_S3TC_DXT1_Format) return o.COMPRESSED_RGBA_S3TC_DXT1_EXT;
      if (s === scope.RGBA_S3TC_DXT3_Format) return o.COMPRESSED_RGBA_S3TC_DXT3_EXT;
      if (s === scope.RGBA_S3TC_DXT5_Format) return o.COMPRESSED_RGBA_S3TC_DXT5_EXT;
    } else return null;
    if (s === scope.RGB_PVRTC_4BPPV1_Format || s === scope.RGB_PVRTC_2BPPV1_Format || s === scope.RGBA_PVRTC_4BPPV1_Format || s === scope.RGBA_PVRTC_2BPPV1_Format) if (o = e.get("WEBGL_compressed_texture_pvrtc"), o !== null) {
      if (s === scope.RGB_PVRTC_4BPPV1_Format) return o.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
      if (s === scope.RGB_PVRTC_2BPPV1_Format) return o.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
      if (s === scope.RGBA_PVRTC_4BPPV1_Format) return o.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
      if (s === scope.RGBA_PVRTC_2BPPV1_Format) return o.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
    } else return null;
    if (s === scope.RGB_ETC1_Format || s === scope.RGB_ETC2_Format || s === scope.RGBA_ETC2_EAC_Format) if (o = e.get("WEBGL_compressed_texture_etc"), o !== null) {
      if (s === scope.RGB_ETC1_Format || s === scope.RGB_ETC2_Format) return l === scope.SRGBTransfer ? o.COMPRESSED_SRGB8_ETC2 : o.COMPRESSED_RGB8_ETC2;
      if (s === scope.RGBA_ETC2_EAC_Format) return l === scope.SRGBTransfer ? o.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : o.COMPRESSED_RGBA8_ETC2_EAC;
    } else return null;
    if (s === scope.RGBA_ASTC_4x4_Format || s === scope.RGBA_ASTC_5x4_Format || s === scope.RGBA_ASTC_5x5_Format || s === scope.RGBA_ASTC_6x5_Format || s === scope.RGBA_ASTC_6x6_Format || s === scope.RGBA_ASTC_8x5_Format || s === scope.RGBA_ASTC_8x6_Format || s === scope.RGBA_ASTC_8x8_Format || s === scope.RGBA_ASTC_10x5_Format || s === scope.RGBA_ASTC_10x6_Format || s === scope.RGBA_ASTC_10x8_Format || s === scope.RGBA_ASTC_10x10_Format || s === scope.RGBA_ASTC_12x10_Format || s === scope.RGBA_ASTC_12x12_Format) if (o = e.get("WEBGL_compressed_texture_astc"), o !== null) {
      if (s === scope.RGBA_ASTC_4x4_Format) return l === scope.SRGBTransfer ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : o.COMPRESSED_RGBA_ASTC_4x4_KHR;
      if (s === scope.RGBA_ASTC_5x4_Format) return l === scope.SRGBTransfer ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : o.COMPRESSED_RGBA_ASTC_5x4_KHR;
      if (s === scope.RGBA_ASTC_5x5_Format) return l === scope.SRGBTransfer ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : o.COMPRESSED_RGBA_ASTC_5x5_KHR;
      if (s === scope.RGBA_ASTC_6x5_Format) return l === scope.SRGBTransfer ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : o.COMPRESSED_RGBA_ASTC_6x5_KHR;
      if (s === scope.RGBA_ASTC_6x6_Format) return l === scope.SRGBTransfer ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : o.COMPRESSED_RGBA_ASTC_6x6_KHR;
      if (s === scope.RGBA_ASTC_8x5_Format) return l === scope.SRGBTransfer ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : o.COMPRESSED_RGBA_ASTC_8x5_KHR;
      if (s === scope.RGBA_ASTC_8x6_Format) return l === scope.SRGBTransfer ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : o.COMPRESSED_RGBA_ASTC_8x6_KHR;
      if (s === scope.RGBA_ASTC_8x8_Format) return l === scope.SRGBTransfer ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : o.COMPRESSED_RGBA_ASTC_8x8_KHR;
      if (s === scope.RGBA_ASTC_10x5_Format) return l === scope.SRGBTransfer ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : o.COMPRESSED_RGBA_ASTC_10x5_KHR;
      if (s === scope.RGBA_ASTC_10x6_Format) return l === scope.SRGBTransfer ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : o.COMPRESSED_RGBA_ASTC_10x6_KHR;
      if (s === scope.RGBA_ASTC_10x8_Format) return l === scope.SRGBTransfer ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : o.COMPRESSED_RGBA_ASTC_10x8_KHR;
      if (s === scope.RGBA_ASTC_10x10_Format) return l === scope.SRGBTransfer ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : o.COMPRESSED_RGBA_ASTC_10x10_KHR;
      if (s === scope.RGBA_ASTC_12x10_Format) return l === scope.SRGBTransfer ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : o.COMPRESSED_RGBA_ASTC_12x10_KHR;
      if (s === scope.RGBA_ASTC_12x12_Format) return l === scope.SRGBTransfer ? o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : o.COMPRESSED_RGBA_ASTC_12x12_KHR;
    } else return null;
    if (s === scope.RGBA_BPTC_Format || s === scope.RGB_BPTC_SIGNED_Format || s === scope.RGB_BPTC_UNSIGNED_Format) if (o = e.get("EXT_texture_compression_bptc"), o !== null) {
      if (s === scope.RGBA_BPTC_Format) return l === scope.SRGBTransfer ? o.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : o.COMPRESSED_RGBA_BPTC_UNORM_EXT;
      if (s === scope.RGB_BPTC_SIGNED_Format) return o.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
      if (s === scope.RGB_BPTC_UNSIGNED_Format) return o.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT;
    } else return null;
    if (s === scope.RED_RGTC1_Format || s === scope.SIGNED_RED_RGTC1_Format || s === scope.RED_GREEN_RGTC2_Format || s === scope.SIGNED_RED_GREEN_RGTC2_Format) if (o = e.get("EXT_texture_compression_rgtc"), o !== null) {
      if (s === scope.RED_RGTC1_Format) return o.COMPRESSED_RED_RGTC1_EXT;
      if (s === scope.SIGNED_RED_RGTC1_Format) return o.COMPRESSED_SIGNED_RED_RGTC1_EXT;
      if (s === scope.RED_GREEN_RGTC2_Format) return o.COMPRESSED_RED_GREEN_RGTC2_EXT;
      if (s === scope.SIGNED_RED_GREEN_RGTC2_Format) return o.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
    } else return null;
    return s === scope.UnsignedInt248Type ? r.UNSIGNED_INT_24_8 : r[s] !== void 0 ? r[s] : null;
  }
  return {
    convert: i
  };
};
}
