/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 492415:494340.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0978(scope) {
scope.WebGLCapabilities = function WebGLCapabilities(r, e, i, s) {
  let a;
  function o() {
    if (a !== void 0) return a;
    if (e.has("EXT_texture_filter_anisotropic") === !0) {
      const N = e.get("EXT_texture_filter_anisotropic");
      a = r.getParameter(N.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    } else a = 0;
    return a;
  }
  function l(N) {
    return !(N !== scope.RGBAFormat && s.convert(N) !== r.getParameter(r.IMPLEMENTATION_COLOR_READ_FORMAT));
  }
  function c(N) {
    const H = N === scope.HalfFloatType && (e.has("EXT_color_buffer_half_float") || e.has("EXT_color_buffer_float"));
    return !(N !== scope.UnsignedByteType && s.convert(N) !== r.getParameter(r.IMPLEMENTATION_COLOR_READ_TYPE) && N !== scope.FloatType && !H);
  }
  function h(N) {
    if (N === "highp") {
      if (r.getShaderPrecisionFormat(r.VERTEX_SHADER, r.HIGH_FLOAT).precision > 0 && r.getShaderPrecisionFormat(r.FRAGMENT_SHADER, r.HIGH_FLOAT).precision > 0) return "highp";
      N = "mediump";
    }
    return N === "mediump" && r.getShaderPrecisionFormat(r.VERTEX_SHADER, r.MEDIUM_FLOAT).precision > 0 && r.getShaderPrecisionFormat(r.FRAGMENT_SHADER, r.MEDIUM_FLOAT).precision > 0 ? "mediump" : "lowp";
  }
  let d = i.precision !== void 0 ? i.precision : "highp";
  const p = h(d);
  p !== d && (console.warn("THREE.WebGLRenderer:", d, "not supported, using", p, "instead."), d = p);
  const f = i.logarithmicDepthBuffer === !0,
    _ = i.reversedDepthBuffer === !0 && e.has("EXT_clip_control"),
    x = r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS),
    b = r.getParameter(r.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
    T = r.getParameter(r.MAX_TEXTURE_SIZE),
    M = r.getParameter(r.MAX_CUBE_MAP_TEXTURE_SIZE),
    w = r.getParameter(r.MAX_VERTEX_ATTRIBS),
    D = r.getParameter(r.MAX_VERTEX_UNIFORM_VECTORS),
    R = r.getParameter(r.MAX_VARYING_VECTORS),
    P = r.getParameter(r.MAX_FRAGMENT_UNIFORM_VECTORS),
    U = b > 0,
    O = r.getParameter(r.MAX_SAMPLES);
  return {
    isWebGL2: !0,
    getMaxAnisotropy: o,
    getMaxPrecision: h,
    textureFormatReadable: l,
    textureTypeReadable: c,
    precision: d,
    logarithmicDepthBuffer: f,
    reversedDepthBuffer: _,
    maxTextures: x,
    maxVertexTextures: b,
    maxTextureSize: T,
    maxCubemapSize: M,
    maxAttributes: w,
    maxVertexUniforms: D,
    maxVaryings: R,
    maxFragmentUniforms: P,
    vertexTextures: U,
    maxSamples: O
  };
};
}
