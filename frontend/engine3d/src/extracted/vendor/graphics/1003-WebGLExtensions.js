/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 509257:510488.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1003(scope) {
scope.WebGLExtensions = function WebGLExtensions(r) {
  const e = {};
  function i(s) {
    if (e[s] !== void 0) return e[s];
    let a;
    switch (s) {
      case "WEBGL_depth_texture":
        a = r.getExtension("WEBGL_depth_texture") || r.getExtension("MOZ_WEBGL_depth_texture") || r.getExtension("WEBKIT_WEBGL_depth_texture");
        break;
      case "EXT_texture_filter_anisotropic":
        a = r.getExtension("EXT_texture_filter_anisotropic") || r.getExtension("MOZ_EXT_texture_filter_anisotropic") || r.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
        break;
      case "WEBGL_compressed_texture_s3tc":
        a = r.getExtension("WEBGL_compressed_texture_s3tc") || r.getExtension("MOZ_WEBGL_compressed_texture_s3tc") || r.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
        break;
      case "WEBGL_compressed_texture_pvrtc":
        a = r.getExtension("WEBGL_compressed_texture_pvrtc") || r.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
        break;
      default:
        a = r.getExtension(s);
    }
    return e[s] = a, a;
  }
  return {
    has: function (s) {
      return i(s) !== null;
    },
    init: function () {
      i("EXT_color_buffer_float"), i("WEBGL_clip_cull_distance"), i("OES_texture_float_linear"), i("EXT_color_buffer_half_float"), i("WEBGL_multisampled_render_to_texture"), i("WEBGL_render_shared_exponent");
    },
    get: function (s) {
      const a = i(s);
      return a === null && scope.warnOnce("THREE.WebGLRenderer: " + s + " extension not supported."), a;
    }
  };
};
}
