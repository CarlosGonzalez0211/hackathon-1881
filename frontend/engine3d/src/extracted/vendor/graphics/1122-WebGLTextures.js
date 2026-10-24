/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 582846:612809.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1122(scope) {
scope.WebGLTextures = function WebGLTextures(r, e, i, s, a, o, l) {
  const c = e.has("WEBGL_multisampled_render_to_texture") ? e.get("WEBGL_multisampled_render_to_texture") : null,
    h = typeof navigator > "u" ? !1 : /OculusBrowser/g.test(navigator.userAgent),
    d = new scope.Vector2(),
    p = new WeakMap();
  let f;
  const _ = new WeakMap();
  let x = !1;
  try {
    x = typeof OffscreenCanvas < "u" && new OffscreenCanvas(1, 1).getContext("2d") !== null;
  } catch {}
  function b(K, G) {
    return x ? new OffscreenCanvas(K, G) : scope.createElementNS("canvas");
  }
  function T(K, G, fe) {
    let Re = 1;
    const Ve = St(K);
    if ((Ve.width > fe || Ve.height > fe) && (Re = fe / Math.max(Ve.width, Ve.height)), Re < 1) if (typeof HTMLImageElement < "u" && K instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && K instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && K instanceof ImageBitmap || typeof VideoFrame < "u" && K instanceof VideoFrame) {
      const Me = Math.floor(Re * Ve.width),
        ot = Math.floor(Re * Ve.height);
      f === void 0 && (f = b(Me, ot));
      const tt = G ? b(Me, ot) : f;
      return tt.width = Me, tt.height = ot, tt.getContext("2d").drawImage(K, 0, 0, Me, ot), console.warn("THREE.WebGLRenderer: Texture has been resized from (" + Ve.width + "x" + Ve.height + ") to (" + Me + "x" + ot + ")."), tt;
    } else return "data" in K && console.warn("THREE.WebGLRenderer: Image in DataTexture is too big (" + Ve.width + "x" + Ve.height + ")."), K;
    return K;
  }
  function M(K) {
    return K.generateMipmaps;
  }
  function w(K) {
    r.generateMipmap(K);
  }
  function D(K) {
    return K.isWebGLCubeRenderTarget ? r.TEXTURE_CUBE_MAP : K.isWebGL3DRenderTarget ? r.TEXTURE_3D : K.isWebGLArrayRenderTarget || K.isCompressedArrayTexture ? r.TEXTURE_2D_ARRAY : r.TEXTURE_2D;
  }
  function R(K, G, fe, Re, Ve = !1) {
    if (K !== null) {
      if (r[K] !== void 0) return r[K];
      console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '" + K + "'");
    }
    let Me = G;
    if (G === r.RED && (fe === r.FLOAT && (Me = r.R32F), fe === r.HALF_FLOAT && (Me = r.R16F), fe === r.UNSIGNED_BYTE && (Me = r.R8)), G === r.RED_INTEGER && (fe === r.UNSIGNED_BYTE && (Me = r.R8UI), fe === r.UNSIGNED_SHORT && (Me = r.R16UI), fe === r.UNSIGNED_INT && (Me = r.R32UI), fe === r.BYTE && (Me = r.R8I), fe === r.SHORT && (Me = r.R16I), fe === r.INT && (Me = r.R32I)), G === r.RG && (fe === r.FLOAT && (Me = r.RG32F), fe === r.HALF_FLOAT && (Me = r.RG16F), fe === r.UNSIGNED_BYTE && (Me = r.RG8)), G === r.RG_INTEGER && (fe === r.UNSIGNED_BYTE && (Me = r.RG8UI), fe === r.UNSIGNED_SHORT && (Me = r.RG16UI), fe === r.UNSIGNED_INT && (Me = r.RG32UI), fe === r.BYTE && (Me = r.RG8I), fe === r.SHORT && (Me = r.RG16I), fe === r.INT && (Me = r.RG32I)), G === r.RGB_INTEGER && (fe === r.UNSIGNED_BYTE && (Me = r.RGB8UI), fe === r.UNSIGNED_SHORT && (Me = r.RGB16UI), fe === r.UNSIGNED_INT && (Me = r.RGB32UI), fe === r.BYTE && (Me = r.RGB8I), fe === r.SHORT && (Me = r.RGB16I), fe === r.INT && (Me = r.RGB32I)), G === r.RGBA_INTEGER && (fe === r.UNSIGNED_BYTE && (Me = r.RGBA8UI), fe === r.UNSIGNED_SHORT && (Me = r.RGBA16UI), fe === r.UNSIGNED_INT && (Me = r.RGBA32UI), fe === r.BYTE && (Me = r.RGBA8I), fe === r.SHORT && (Me = r.RGBA16I), fe === r.INT && (Me = r.RGBA32I)), G === r.RGB && (fe === r.UNSIGNED_INT_5_9_9_9_REV && (Me = r.RGB9_E5), fe === r.UNSIGNED_INT_10F_11F_11F_REV && (Me = r.R11F_G11F_B10F)), G === r.RGBA) {
      const ot = Ve ? scope.LinearTransfer : scope.ColorManagement.getTransfer(Re);
      fe === r.FLOAT && (Me = r.RGBA32F), fe === r.HALF_FLOAT && (Me = r.RGBA16F), fe === r.UNSIGNED_BYTE && (Me = ot === scope.SRGBTransfer ? r.SRGB8_ALPHA8 : r.RGBA8), fe === r.UNSIGNED_SHORT_4_4_4_4 && (Me = r.RGBA4), fe === r.UNSIGNED_SHORT_5_5_5_1 && (Me = r.RGB5_A1);
    }
    return (Me === r.R16F || Me === r.R32F || Me === r.RG16F || Me === r.RG32F || Me === r.RGBA16F || Me === r.RGBA32F) && e.get("EXT_color_buffer_float"), Me;
  }
  function P(K, G) {
    let fe;
    return K ? G === null || G === scope.UnsignedIntType || G === scope.UnsignedInt248Type ? fe = r.DEPTH24_STENCIL8 : G === scope.FloatType ? fe = r.DEPTH32F_STENCIL8 : G === scope.UnsignedShortType && (fe = r.DEPTH24_STENCIL8, console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")) : G === null || G === scope.UnsignedIntType || G === scope.UnsignedInt248Type ? fe = r.DEPTH_COMPONENT24 : G === scope.FloatType ? fe = r.DEPTH_COMPONENT32F : G === scope.UnsignedShortType && (fe = r.DEPTH_COMPONENT16), fe;
  }
  function U(K, G) {
    return M(K) === !0 || K.isFramebufferTexture && K.minFilter !== scope.NearestFilter && K.minFilter !== scope.LinearFilter ? Math.log2(Math.max(G.width, G.height)) + 1 : K.mipmaps !== void 0 && K.mipmaps.length > 0 ? K.mipmaps.length : K.isCompressedTexture && Array.isArray(K.image) ? G.mipmaps.length : 1;
  }
  function O(K) {
    const G = K.target;
    scope.__lifecycle.unlisten(G, "dispose", O), H(G), G.isVideoTexture && p.delete(G);
  }
  function N(K) {
    const G = K.target;
    scope.__lifecycle.unlisten(G, "dispose", N), k(G);
  }
  function H(K) {
    const G = s.get(K);
    if (G.__webglInit === void 0) return;
    const fe = K.source,
      Re = _.get(fe);
    if (Re) {
      const Ve = Re[G.__cacheKey];
      Ve.usedTimes--, Ve.usedTimes === 0 && F(K), Object.keys(Re).length === 0 && _.delete(fe);
    }
    s.remove(K);
  }
  function F(K) {
    const G = s.get(K);
    r.deleteTexture(G.__webglTexture);
    const fe = K.source,
      Re = _.get(fe);
    delete Re[G.__cacheKey], l.memory.textures--;
  }
  function k(K) {
    const G = s.get(K);
    if (K.depthTexture && (K.depthTexture.dispose(), s.remove(K.depthTexture)), K.isWebGLCubeRenderTarget) for (let Re = 0; Re < 6; Re++) {
      if (Array.isArray(G.__webglFramebuffer[Re])) for (let Ve = 0; Ve < G.__webglFramebuffer[Re].length; Ve++) r.deleteFramebuffer(G.__webglFramebuffer[Re][Ve]);else r.deleteFramebuffer(G.__webglFramebuffer[Re]);
      G.__webglDepthbuffer && r.deleteRenderbuffer(G.__webglDepthbuffer[Re]);
    } else {
      if (Array.isArray(G.__webglFramebuffer)) for (let Re = 0; Re < G.__webglFramebuffer.length; Re++) r.deleteFramebuffer(G.__webglFramebuffer[Re]);else r.deleteFramebuffer(G.__webglFramebuffer);
      if (G.__webglDepthbuffer && r.deleteRenderbuffer(G.__webglDepthbuffer), G.__webglMultisampledFramebuffer && r.deleteFramebuffer(G.__webglMultisampledFramebuffer), G.__webglColorRenderbuffer) for (let Re = 0; Re < G.__webglColorRenderbuffer.length; Re++) G.__webglColorRenderbuffer[Re] && r.deleteRenderbuffer(G.__webglColorRenderbuffer[Re]);
      G.__webglDepthRenderbuffer && r.deleteRenderbuffer(G.__webglDepthRenderbuffer);
    }
    const fe = K.textures;
    for (let Re = 0, Ve = fe.length; Re < Ve; Re++) {
      const Me = s.get(fe[Re]);
      Me.__webglTexture && (r.deleteTexture(Me.__webglTexture), l.memory.textures--), s.remove(fe[Re]);
    }
    s.remove(K);
  }
  let W = 0;
  function $() {
    W = 0;
  }
  function Z() {
    const K = W;
    return K >= a.maxTextures && console.warn("THREE.WebGLTextures: Trying to use " + K + " texture units while this GPU supports only " + a.maxTextures), W += 1, K;
  }
  function J(K) {
    const G = [];
    return G.push(K.wrapS), G.push(K.wrapT), G.push(K.wrapR || 0), G.push(K.magFilter), G.push(K.minFilter), G.push(K.anisotropy), G.push(K.internalFormat), G.push(K.format), G.push(K.type), G.push(K.generateMipmaps), G.push(K.premultiplyAlpha), G.push(K.flipY), G.push(K.unpackAlignment), G.push(K.colorSpace), G.join();
  }
  function se(K, G) {
    const fe = s.get(K);
    if (K.isVideoTexture && Xe(K), K.isRenderTargetTexture === !1 && K.isExternalTexture !== !0 && K.version > 0 && fe.__version !== K.version) {
      const Re = K.image;
      if (Re === null) console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if (Re.complete === !1) console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else {
        z(fe, K, G);
        return;
      }
    } else K.isExternalTexture && (fe.__webglTexture = K.sourceTexture ? K.sourceTexture : null);
    i.bindTexture(r.TEXTURE_2D, fe.__webglTexture, r.TEXTURE0 + G);
  }
  function re(K, G) {
    const fe = s.get(K);
    if (K.isRenderTargetTexture === !1 && K.version > 0 && fe.__version !== K.version) {
      z(fe, K, G);
      return;
    }
    i.bindTexture(r.TEXTURE_2D_ARRAY, fe.__webglTexture, r.TEXTURE0 + G);
  }
  function he(K, G) {
    const fe = s.get(K);
    if (K.isRenderTargetTexture === !1 && K.version > 0 && fe.__version !== K.version) {
      z(fe, K, G);
      return;
    }
    i.bindTexture(r.TEXTURE_3D, fe.__webglTexture, r.TEXTURE0 + G);
  }
  function ee(K, G) {
    const fe = s.get(K);
    if (K.version > 0 && fe.__version !== K.version) {
      V(fe, K, G);
      return;
    }
    i.bindTexture(r.TEXTURE_CUBE_MAP, fe.__webglTexture, r.TEXTURE0 + G);
  }
  const Ie = {
      [scope.RepeatWrapping]: r.REPEAT,
      [scope.ClampToEdgeWrapping]: r.CLAMP_TO_EDGE,
      [scope.MirroredRepeatWrapping]: r.MIRRORED_REPEAT
    },
    Te = {
      [scope.NearestFilter]: r.NEAREST,
      [scope.NearestMipmapNearestFilter]: r.NEAREST_MIPMAP_NEAREST,
      [scope.NearestMipmapLinearFilter]: r.NEAREST_MIPMAP_LINEAR,
      [scope.LinearFilter]: r.LINEAR,
      [scope.LinearMipmapNearestFilter]: r.LINEAR_MIPMAP_NEAREST,
      [scope.LinearMipmapLinearFilter]: r.LINEAR_MIPMAP_LINEAR
    },
    Ue = {
      [scope.NeverCompare]: r.NEVER,
      [scope.AlwaysCompare]: r.ALWAYS,
      [scope.LessCompare]: r.LESS,
      [scope.LessEqualCompare]: r.LEQUAL,
      [scope.EqualCompare]: r.EQUAL,
      [scope.GreaterEqualCompare]: r.GEQUAL,
      [scope.GreaterCompare]: r.GREATER,
      [scope.NotEqualCompare]: r.NOTEQUAL
    };
  function nt(K, G) {
    if (G.type === scope.FloatType && e.has("OES_texture_float_linear") === !1 && (G.magFilter === scope.LinearFilter || G.magFilter === scope.LinearMipmapNearestFilter || G.magFilter === scope.NearestMipmapLinearFilter || G.magFilter === scope.LinearMipmapLinearFilter || G.minFilter === scope.LinearFilter || G.minFilter === scope.LinearMipmapNearestFilter || G.minFilter === scope.NearestMipmapLinearFilter || G.minFilter === scope.LinearMipmapLinearFilter) && console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."), r.texParameteri(K, r.TEXTURE_WRAP_S, Ie[G.wrapS]), r.texParameteri(K, r.TEXTURE_WRAP_T, Ie[G.wrapT]), (K === r.TEXTURE_3D || K === r.TEXTURE_2D_ARRAY) && r.texParameteri(K, r.TEXTURE_WRAP_R, Ie[G.wrapR]), r.texParameteri(K, r.TEXTURE_MAG_FILTER, Te[G.magFilter]), r.texParameteri(K, r.TEXTURE_MIN_FILTER, Te[G.minFilter]), G.compareFunction && (r.texParameteri(K, r.TEXTURE_COMPARE_MODE, r.COMPARE_REF_TO_TEXTURE), r.texParameteri(K, r.TEXTURE_COMPARE_FUNC, Ue[G.compareFunction])), e.has("EXT_texture_filter_anisotropic") === !0) {
      if (G.magFilter === scope.NearestFilter || G.minFilter !== scope.NearestMipmapLinearFilter && G.minFilter !== scope.LinearMipmapLinearFilter || G.type === scope.FloatType && e.has("OES_texture_float_linear") === !1) return;
      if (G.anisotropy > 1 || s.get(G).__currentAnisotropy) {
        const fe = e.get("EXT_texture_filter_anisotropic");
        r.texParameterf(K, fe.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(G.anisotropy, a.getMaxAnisotropy())), s.get(G).__currentAnisotropy = G.anisotropy;
      }
    }
  }
  function mt(K, G) {
    let fe = !1;
    K.__webglInit === void 0 && (K.__webglInit = !0, scope.__lifecycle.listen(G, "dispose", O));
    const Re = G.source;
    let Ve = _.get(Re);
    Ve === void 0 && (Ve = {}, _.set(Re, Ve));
    const Me = J(G);
    if (Me !== K.__cacheKey) {
      Ve[Me] === void 0 && (Ve[Me] = {
        texture: r.createTexture(),
        usedTimes: 0
      }, l.memory.textures++, fe = !0), Ve[Me].usedTimes++;
      const ot = Ve[K.__cacheKey];
      ot !== void 0 && (Ve[K.__cacheKey].usedTimes--, ot.usedTimes === 0 && F(G)), K.__cacheKey = Me, K.__webglTexture = Ve[Me].texture;
    }
    return fe;
  }
  function ve(K, G, fe) {
    return Math.floor(Math.floor(K / fe) / G);
  }
  function ne(K, G, fe, Re) {
    const Me = K.updateRanges;
    if (Me.length === 0) i.texSubImage2D(r.TEXTURE_2D, 0, 0, 0, G.width, G.height, fe, Re, G.data);else {
      Me.sort((Ge, ce) => Ge.start - ce.start);
      let ot = 0;
      for (let Ge = 1; Ge < Me.length; Ge++) {
        const ce = Me[ot],
          xe = Me[Ge],
          be = ce.start + ce.count,
          Ce = ve(xe.start, G.width, 4),
          $e = ve(ce.start, G.width, 4);
        xe.start <= be + 1 && Ce === $e && ve(xe.start + xe.count - 1, G.width, 4) === Ce ? ce.count = Math.max(ce.count, xe.start + xe.count - ce.start) : (++ot, Me[ot] = xe);
      }
      Me.length = ot + 1;
      const tt = r.getParameter(r.UNPACK_ROW_LENGTH),
        ut = r.getParameter(r.UNPACK_SKIP_PIXELS),
        ft = r.getParameter(r.UNPACK_SKIP_ROWS);
      r.pixelStorei(r.UNPACK_ROW_LENGTH, G.width);
      for (let Ge = 0, ce = Me.length; Ge < ce; Ge++) {
        const xe = Me[Ge],
          be = Math.floor(xe.start / 4),
          Ce = Math.ceil(xe.count / 4),
          $e = be % G.width,
          ie = Math.floor(be / G.width),
          Ne = Ce,
          je = 1;
        r.pixelStorei(r.UNPACK_SKIP_PIXELS, $e), r.pixelStorei(r.UNPACK_SKIP_ROWS, ie), i.texSubImage2D(r.TEXTURE_2D, 0, $e, ie, Ne, je, fe, Re, G.data);
      }
      K.clearUpdateRanges(), r.pixelStorei(r.UNPACK_ROW_LENGTH, tt), r.pixelStorei(r.UNPACK_SKIP_PIXELS, ut), r.pixelStorei(r.UNPACK_SKIP_ROWS, ft);
    }
  }
  function z(K, G, fe) {
    let Re = r.TEXTURE_2D;
    (G.isDataArrayTexture || G.isCompressedArrayTexture) && (Re = r.TEXTURE_2D_ARRAY), G.isData3DTexture && (Re = r.TEXTURE_3D);
    const Ve = mt(K, G),
      Me = G.source;
    i.bindTexture(Re, K.__webglTexture, r.TEXTURE0 + fe);
    const ot = s.get(Me);
    if (Me.version !== ot.__version || Ve === !0) {
      i.activeTexture(r.TEXTURE0 + fe);
      const tt = scope.ColorManagement.getPrimaries(scope.ColorManagement.workingColorSpace),
        ut = G.colorSpace === scope.NoColorSpace ? null : scope.ColorManagement.getPrimaries(G.colorSpace),
        ft = G.colorSpace === scope.NoColorSpace || tt === ut ? r.NONE : r.BROWSER_DEFAULT_WEBGL;
      r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL, G.flipY), r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL, G.premultiplyAlpha), r.pixelStorei(r.UNPACK_ALIGNMENT, G.unpackAlignment), r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL, ft);
      let Ge = T(G.image, !1, a.maxTextureSize);
      Ge = vt(G, Ge);
      const ce = o.convert(G.format, G.colorSpace),
        xe = o.convert(G.type);
      let be = R(G.internalFormat, ce, xe, G.colorSpace, G.isVideoTexture);
      nt(Re, G);
      let Ce;
      const $e = G.mipmaps,
        ie = G.isVideoTexture !== !0,
        Ne = ot.__version === void 0 || Ve === !0,
        je = Me.dataReady,
        rt = U(G, Ge);
      if (G.isDepthTexture) be = P(G.format === scope.DepthStencilFormat, G.type), Ne && (ie ? i.texStorage2D(r.TEXTURE_2D, 1, be, Ge.width, Ge.height) : i.texImage2D(r.TEXTURE_2D, 0, be, Ge.width, Ge.height, 0, ce, xe, null));else if (G.isDataTexture) {
        if ($e.length > 0) {
          ie && Ne && i.texStorage2D(r.TEXTURE_2D, rt, be, $e[0].width, $e[0].height);
          for (let Ke = 0, ke = $e.length; Ke < ke; Ke++) Ce = $e[Ke], ie ? je && i.texSubImage2D(r.TEXTURE_2D, Ke, 0, 0, Ce.width, Ce.height, ce, xe, Ce.data) : i.texImage2D(r.TEXTURE_2D, Ke, be, Ce.width, Ce.height, 0, ce, xe, Ce.data);
          G.generateMipmaps = !1;
        } else ie ? (Ne && i.texStorage2D(r.TEXTURE_2D, rt, be, Ge.width, Ge.height), je && ne(G, Ge, ce, xe)) : i.texImage2D(r.TEXTURE_2D, 0, be, Ge.width, Ge.height, 0, ce, xe, Ge.data);
      } else if (G.isCompressedTexture) {
        if (G.isCompressedArrayTexture) {
          ie && Ne && i.texStorage3D(r.TEXTURE_2D_ARRAY, rt, be, $e[0].width, $e[0].height, Ge.depth);
          for (let Ke = 0, ke = $e.length; Ke < ke; Ke++) if (Ce = $e[Ke], G.format !== scope.RGBAFormat) {
            if (ce !== null) {
              if (ie) {
                if (je) if (G.layerUpdates.size > 0) {
                  const ct = scope.getByteLength(Ce.width, Ce.height, G.format, G.type);
                  for (const wt of G.layerUpdates) {
                    const Pt = Ce.data.subarray(wt * ct / Ce.data.BYTES_PER_ELEMENT, (wt + 1) * ct / Ce.data.BYTES_PER_ELEMENT);
                    i.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY, Ke, 0, 0, wt, Ce.width, Ce.height, 1, ce, Pt);
                  }
                  G.clearLayerUpdates();
                } else i.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY, Ke, 0, 0, 0, Ce.width, Ce.height, Ge.depth, ce, Ce.data);
              } else i.compressedTexImage3D(r.TEXTURE_2D_ARRAY, Ke, be, Ce.width, Ce.height, Ge.depth, 0, Ce.data, 0, 0);
            } else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");
          } else ie ? je && i.texSubImage3D(r.TEXTURE_2D_ARRAY, Ke, 0, 0, 0, Ce.width, Ce.height, Ge.depth, ce, xe, Ce.data) : i.texImage3D(r.TEXTURE_2D_ARRAY, Ke, be, Ce.width, Ce.height, Ge.depth, 0, ce, xe, Ce.data);
        } else {
          ie && Ne && i.texStorage2D(r.TEXTURE_2D, rt, be, $e[0].width, $e[0].height);
          for (let Ke = 0, ke = $e.length; Ke < ke; Ke++) Ce = $e[Ke], G.format !== scope.RGBAFormat ? ce !== null ? ie ? je && i.compressedTexSubImage2D(r.TEXTURE_2D, Ke, 0, 0, Ce.width, Ce.height, ce, Ce.data) : i.compressedTexImage2D(r.TEXTURE_2D, Ke, be, Ce.width, Ce.height, 0, Ce.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : ie ? je && i.texSubImage2D(r.TEXTURE_2D, Ke, 0, 0, Ce.width, Ce.height, ce, xe, Ce.data) : i.texImage2D(r.TEXTURE_2D, Ke, be, Ce.width, Ce.height, 0, ce, xe, Ce.data);
        }
      } else if (G.isDataArrayTexture) {
        if (ie) {
          if (Ne && i.texStorage3D(r.TEXTURE_2D_ARRAY, rt, be, Ge.width, Ge.height, Ge.depth), je) if (G.layerUpdates.size > 0) {
            const Ke = scope.getByteLength(Ge.width, Ge.height, G.format, G.type);
            for (const ke of G.layerUpdates) {
              const ct = Ge.data.subarray(ke * Ke / Ge.data.BYTES_PER_ELEMENT, (ke + 1) * Ke / Ge.data.BYTES_PER_ELEMENT);
              i.texSubImage3D(r.TEXTURE_2D_ARRAY, 0, 0, 0, ke, Ge.width, Ge.height, 1, ce, xe, ct);
            }
            G.clearLayerUpdates();
          } else i.texSubImage3D(r.TEXTURE_2D_ARRAY, 0, 0, 0, 0, Ge.width, Ge.height, Ge.depth, ce, xe, Ge.data);
        } else i.texImage3D(r.TEXTURE_2D_ARRAY, 0, be, Ge.width, Ge.height, Ge.depth, 0, ce, xe, Ge.data);
      } else if (G.isData3DTexture) ie ? (Ne && i.texStorage3D(r.TEXTURE_3D, rt, be, Ge.width, Ge.height, Ge.depth), je && i.texSubImage3D(r.TEXTURE_3D, 0, 0, 0, 0, Ge.width, Ge.height, Ge.depth, ce, xe, Ge.data)) : i.texImage3D(r.TEXTURE_3D, 0, be, Ge.width, Ge.height, Ge.depth, 0, ce, xe, Ge.data);else if (G.isFramebufferTexture) {
        if (Ne) if (ie) i.texStorage2D(r.TEXTURE_2D, rt, be, Ge.width, Ge.height);else {
          let Ke = Ge.width,
            ke = Ge.height;
          for (let ct = 0; ct < rt; ct++) i.texImage2D(r.TEXTURE_2D, ct, be, Ke, ke, 0, ce, xe, null), Ke >>= 1, ke >>= 1;
        }
      } else if ($e.length > 0) {
        if (ie && Ne) {
          const Ke = St($e[0]);
          i.texStorage2D(r.TEXTURE_2D, rt, be, Ke.width, Ke.height);
        }
        for (let Ke = 0, ke = $e.length; Ke < ke; Ke++) Ce = $e[Ke], ie ? je && i.texSubImage2D(r.TEXTURE_2D, Ke, 0, 0, ce, xe, Ce) : i.texImage2D(r.TEXTURE_2D, Ke, be, ce, xe, Ce);
        G.generateMipmaps = !1;
      } else if (ie) {
        if (Ne) {
          const Ke = St(Ge);
          i.texStorage2D(r.TEXTURE_2D, rt, be, Ke.width, Ke.height);
        }
        je && i.texSubImage2D(r.TEXTURE_2D, 0, 0, 0, ce, xe, Ge);
      } else i.texImage2D(r.TEXTURE_2D, 0, be, ce, xe, Ge);
      M(G) && w(Re), ot.__version = Me.version, G.onUpdate && G.onUpdate(G);
    }
    K.__version = G.version;
  }
  function V(K, G, fe) {
    if (G.image.length !== 6) return;
    const Re = mt(K, G),
      Ve = G.source;
    i.bindTexture(r.TEXTURE_CUBE_MAP, K.__webglTexture, r.TEXTURE0 + fe);
    const Me = s.get(Ve);
    if (Ve.version !== Me.__version || Re === !0) {
      i.activeTexture(r.TEXTURE0 + fe);
      const ot = scope.ColorManagement.getPrimaries(scope.ColorManagement.workingColorSpace),
        tt = G.colorSpace === scope.NoColorSpace ? null : scope.ColorManagement.getPrimaries(G.colorSpace),
        ut = G.colorSpace === scope.NoColorSpace || ot === tt ? r.NONE : r.BROWSER_DEFAULT_WEBGL;
      r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL, G.flipY), r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL, G.premultiplyAlpha), r.pixelStorei(r.UNPACK_ALIGNMENT, G.unpackAlignment), r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL, ut);
      const ft = G.isCompressedTexture || G.image[0].isCompressedTexture,
        Ge = G.image[0] && G.image[0].isDataTexture,
        ce = [];
      for (let ke = 0; ke < 6; ke++) !ft && !Ge ? ce[ke] = T(G.image[ke], !0, a.maxCubemapSize) : ce[ke] = Ge ? G.image[ke].image : G.image[ke], ce[ke] = vt(G, ce[ke]);
      const xe = ce[0],
        be = o.convert(G.format, G.colorSpace),
        Ce = o.convert(G.type),
        $e = R(G.internalFormat, be, Ce, G.colorSpace),
        ie = G.isVideoTexture !== !0,
        Ne = Me.__version === void 0 || Re === !0,
        je = Ve.dataReady;
      let rt = U(G, xe);
      nt(r.TEXTURE_CUBE_MAP, G);
      let Ke;
      if (ft) {
        ie && Ne && i.texStorage2D(r.TEXTURE_CUBE_MAP, rt, $e, xe.width, xe.height);
        for (let ke = 0; ke < 6; ke++) {
          Ke = ce[ke].mipmaps;
          for (let ct = 0; ct < Ke.length; ct++) {
            const wt = Ke[ct];
            G.format !== scope.RGBAFormat ? be !== null ? ie ? je && i.compressedTexSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X + ke, ct, 0, 0, wt.width, wt.height, be, wt.data) : i.compressedTexImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X + ke, ct, $e, wt.width, wt.height, 0, wt.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : ie ? je && i.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X + ke, ct, 0, 0, wt.width, wt.height, be, Ce, wt.data) : i.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X + ke, ct, $e, wt.width, wt.height, 0, be, Ce, wt.data);
          }
        }
      } else {
        if (Ke = G.mipmaps, ie && Ne) {
          Ke.length > 0 && rt++;
          const ke = St(ce[0]);
          i.texStorage2D(r.TEXTURE_CUBE_MAP, rt, $e, ke.width, ke.height);
        }
        for (let ke = 0; ke < 6; ke++) if (Ge) {
          ie ? je && i.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X + ke, 0, 0, 0, ce[ke].width, ce[ke].height, be, Ce, ce[ke].data) : i.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X + ke, 0, $e, ce[ke].width, ce[ke].height, 0, be, Ce, ce[ke].data);
          for (let ct = 0; ct < Ke.length; ct++) {
            const Pt = Ke[ct].image[ke].image;
            ie ? je && i.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X + ke, ct + 1, 0, 0, Pt.width, Pt.height, be, Ce, Pt.data) : i.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X + ke, ct + 1, $e, Pt.width, Pt.height, 0, be, Ce, Pt.data);
          }
        } else {
          ie ? je && i.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X + ke, 0, 0, 0, be, Ce, ce[ke]) : i.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X + ke, 0, $e, be, Ce, ce[ke]);
          for (let ct = 0; ct < Ke.length; ct++) {
            const wt = Ke[ct];
            ie ? je && i.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X + ke, ct + 1, 0, 0, be, Ce, wt.image[ke]) : i.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X + ke, ct + 1, $e, be, Ce, wt.image[ke]);
          }
        }
      }
      M(G) && w(r.TEXTURE_CUBE_MAP), Me.__version = Ve.version, G.onUpdate && G.onUpdate(G);
    }
    K.__version = G.version;
  }
  function _e(K, G, fe, Re, Ve, Me) {
    const ot = o.convert(fe.format, fe.colorSpace),
      tt = o.convert(fe.type),
      ut = R(fe.internalFormat, ot, tt, fe.colorSpace),
      ft = s.get(G),
      Ge = s.get(fe);
    if (Ge.__renderTarget = G, !ft.__hasExternalTextures) {
      const ce = Math.max(1, G.width >> Me),
        xe = Math.max(1, G.height >> Me);
      Ve === r.TEXTURE_3D || Ve === r.TEXTURE_2D_ARRAY ? i.texImage3D(Ve, Me, ut, ce, xe, G.depth, 0, ot, tt, null) : i.texImage2D(Ve, Me, ut, ce, xe, 0, ot, tt, null);
    }
    i.bindFramebuffer(r.FRAMEBUFFER, K), Y(G) ? c.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER, Re, Ve, Ge.__webglTexture, 0, le(G)) : (Ve === r.TEXTURE_2D || Ve >= r.TEXTURE_CUBE_MAP_POSITIVE_X && Ve <= r.TEXTURE_CUBE_MAP_NEGATIVE_Z) && r.framebufferTexture2D(r.FRAMEBUFFER, Re, Ve, Ge.__webglTexture, Me), i.bindFramebuffer(r.FRAMEBUFFER, null);
  }
  function Le(K, G, fe) {
    if (r.bindRenderbuffer(r.RENDERBUFFER, K), G.depthBuffer) {
      const Re = G.depthTexture,
        Ve = Re && Re.isDepthTexture ? Re.type : null,
        Me = P(G.stencilBuffer, Ve),
        ot = G.stencilBuffer ? r.DEPTH_STENCIL_ATTACHMENT : r.DEPTH_ATTACHMENT,
        tt = le(G);
      Y(G) ? c.renderbufferStorageMultisampleEXT(r.RENDERBUFFER, tt, Me, G.width, G.height) : fe ? r.renderbufferStorageMultisample(r.RENDERBUFFER, tt, Me, G.width, G.height) : r.renderbufferStorage(r.RENDERBUFFER, Me, G.width, G.height), r.framebufferRenderbuffer(r.FRAMEBUFFER, ot, r.RENDERBUFFER, K);
    } else {
      const Re = G.textures;
      for (let Ve = 0; Ve < Re.length; Ve++) {
        const Me = Re[Ve],
          ot = o.convert(Me.format, Me.colorSpace),
          tt = o.convert(Me.type),
          ut = R(Me.internalFormat, ot, tt, Me.colorSpace),
          ft = le(G);
        fe && Y(G) === !1 ? r.renderbufferStorageMultisample(r.RENDERBUFFER, ft, ut, G.width, G.height) : Y(G) ? c.renderbufferStorageMultisampleEXT(r.RENDERBUFFER, ft, ut, G.width, G.height) : r.renderbufferStorage(r.RENDERBUFFER, ut, G.width, G.height);
      }
    }
    r.bindRenderbuffer(r.RENDERBUFFER, null);
  }
  function pe(K, G) {
    if (G && G.isWebGLCubeRenderTarget) throw new Error("Depth Texture with cube render targets is not supported");
    if (i.bindFramebuffer(r.FRAMEBUFFER, K), !(G.depthTexture && G.depthTexture.isDepthTexture)) throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");
    const Re = s.get(G.depthTexture);
    Re.__renderTarget = G, (!Re.__webglTexture || G.depthTexture.image.width !== G.width || G.depthTexture.image.height !== G.height) && (G.depthTexture.image.width = G.width, G.depthTexture.image.height = G.height, G.depthTexture.needsUpdate = !0), se(G.depthTexture, 0);
    const Ve = Re.__webglTexture,
      Me = le(G);
    if (G.depthTexture.format === scope.DepthFormat) Y(G) ? c.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER, r.DEPTH_ATTACHMENT, r.TEXTURE_2D, Ve, 0, Me) : r.framebufferTexture2D(r.FRAMEBUFFER, r.DEPTH_ATTACHMENT, r.TEXTURE_2D, Ve, 0);else if (G.depthTexture.format === scope.DepthStencilFormat) Y(G) ? c.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER, r.DEPTH_STENCIL_ATTACHMENT, r.TEXTURE_2D, Ve, 0, Me) : r.framebufferTexture2D(r.FRAMEBUFFER, r.DEPTH_STENCIL_ATTACHMENT, r.TEXTURE_2D, Ve, 0);else throw new Error("Unknown depthTexture format");
  }
  function Fe(K) {
    const G = s.get(K),
      fe = K.isWebGLCubeRenderTarget === !0;
    if (G.__boundDepthTexture !== K.depthTexture) {
      const Re = K.depthTexture;
      if (G.__depthDisposeCallback && G.__depthDisposeCallback(), Re) {
        const Ve = () => {
          delete G.__boundDepthTexture, delete G.__depthDisposeCallback, scope.__lifecycle.unlisten(Re, "dispose", Ve);
        };
        scope.__lifecycle.listen(Re, "dispose", Ve), G.__depthDisposeCallback = Ve;
      }
      G.__boundDepthTexture = Re;
    }
    if (K.depthTexture && !G.__autoAllocateDepthBuffer) {
      if (fe) throw new Error("target.depthTexture not supported in Cube render targets");
      const Re = K.texture.mipmaps;
      Re && Re.length > 0 ? pe(G.__webglFramebuffer[0], K) : pe(G.__webglFramebuffer, K);
    } else if (fe) {
      G.__webglDepthbuffer = [];
      for (let Re = 0; Re < 6; Re++) if (i.bindFramebuffer(r.FRAMEBUFFER, G.__webglFramebuffer[Re]), G.__webglDepthbuffer[Re] === void 0) G.__webglDepthbuffer[Re] = r.createRenderbuffer(), Le(G.__webglDepthbuffer[Re], K, !1);else {
        const Ve = K.stencilBuffer ? r.DEPTH_STENCIL_ATTACHMENT : r.DEPTH_ATTACHMENT,
          Me = G.__webglDepthbuffer[Re];
        r.bindRenderbuffer(r.RENDERBUFFER, Me), r.framebufferRenderbuffer(r.FRAMEBUFFER, Ve, r.RENDERBUFFER, Me);
      }
    } else {
      const Re = K.texture.mipmaps;
      if (Re && Re.length > 0 ? i.bindFramebuffer(r.FRAMEBUFFER, G.__webglFramebuffer[0]) : i.bindFramebuffer(r.FRAMEBUFFER, G.__webglFramebuffer), G.__webglDepthbuffer === void 0) G.__webglDepthbuffer = r.createRenderbuffer(), Le(G.__webglDepthbuffer, K, !1);else {
        const Ve = K.stencilBuffer ? r.DEPTH_STENCIL_ATTACHMENT : r.DEPTH_ATTACHMENT,
          Me = G.__webglDepthbuffer;
        r.bindRenderbuffer(r.RENDERBUFFER, Me), r.framebufferRenderbuffer(r.FRAMEBUFFER, Ve, r.RENDERBUFFER, Me);
      }
    }
    i.bindFramebuffer(r.FRAMEBUFFER, null);
  }
  function st(K, G, fe) {
    const Re = s.get(K);
    G !== void 0 && _e(Re.__webglFramebuffer, K, K.texture, r.COLOR_ATTACHMENT0, r.TEXTURE_2D, 0), fe !== void 0 && Fe(K);
  }
  function j(K) {
    const G = K.texture,
      fe = s.get(K),
      Re = s.get(G);
    scope.__lifecycle.listen(K, "dispose", N);
    const Ve = K.textures,
      Me = K.isWebGLCubeRenderTarget === !0,
      ot = Ve.length > 1;
    if (ot || (Re.__webglTexture === void 0 && (Re.__webglTexture = r.createTexture()), Re.__version = G.version, l.memory.textures++), Me) {
      fe.__webglFramebuffer = [];
      for (let tt = 0; tt < 6; tt++) if (G.mipmaps && G.mipmaps.length > 0) {
        fe.__webglFramebuffer[tt] = [];
        for (let ut = 0; ut < G.mipmaps.length; ut++) fe.__webglFramebuffer[tt][ut] = r.createFramebuffer();
      } else fe.__webglFramebuffer[tt] = r.createFramebuffer();
    } else {
      if (G.mipmaps && G.mipmaps.length > 0) {
        fe.__webglFramebuffer = [];
        for (let tt = 0; tt < G.mipmaps.length; tt++) fe.__webglFramebuffer[tt] = r.createFramebuffer();
      } else fe.__webglFramebuffer = r.createFramebuffer();
      if (ot) for (let tt = 0, ut = Ve.length; tt < ut; tt++) {
        const ft = s.get(Ve[tt]);
        ft.__webglTexture === void 0 && (ft.__webglTexture = r.createTexture(), l.memory.textures++);
      }
      if (K.samples > 0 && Y(K) === !1) {
        fe.__webglMultisampledFramebuffer = r.createFramebuffer(), fe.__webglColorRenderbuffer = [], i.bindFramebuffer(r.FRAMEBUFFER, fe.__webglMultisampledFramebuffer);
        for (let tt = 0; tt < Ve.length; tt++) {
          const ut = Ve[tt];
          fe.__webglColorRenderbuffer[tt] = r.createRenderbuffer(), r.bindRenderbuffer(r.RENDERBUFFER, fe.__webglColorRenderbuffer[tt]);
          const ft = o.convert(ut.format, ut.colorSpace),
            Ge = o.convert(ut.type),
            ce = R(ut.internalFormat, ft, Ge, ut.colorSpace, K.isXRRenderTarget === !0),
            xe = le(K);
          r.renderbufferStorageMultisample(r.RENDERBUFFER, xe, ce, K.width, K.height), r.framebufferRenderbuffer(r.FRAMEBUFFER, r.COLOR_ATTACHMENT0 + tt, r.RENDERBUFFER, fe.__webglColorRenderbuffer[tt]);
        }
        r.bindRenderbuffer(r.RENDERBUFFER, null), K.depthBuffer && (fe.__webglDepthRenderbuffer = r.createRenderbuffer(), Le(fe.__webglDepthRenderbuffer, K, !0)), i.bindFramebuffer(r.FRAMEBUFFER, null);
      }
    }
    if (Me) {
      i.bindTexture(r.TEXTURE_CUBE_MAP, Re.__webglTexture), nt(r.TEXTURE_CUBE_MAP, G);
      for (let tt = 0; tt < 6; tt++) if (G.mipmaps && G.mipmaps.length > 0) for (let ut = 0; ut < G.mipmaps.length; ut++) _e(fe.__webglFramebuffer[tt][ut], K, G, r.COLOR_ATTACHMENT0, r.TEXTURE_CUBE_MAP_POSITIVE_X + tt, ut);else _e(fe.__webglFramebuffer[tt], K, G, r.COLOR_ATTACHMENT0, r.TEXTURE_CUBE_MAP_POSITIVE_X + tt, 0);
      M(G) && w(r.TEXTURE_CUBE_MAP), i.unbindTexture();
    } else if (ot) {
      for (let tt = 0, ut = Ve.length; tt < ut; tt++) {
        const ft = Ve[tt],
          Ge = s.get(ft);
        let ce = r.TEXTURE_2D;
        (K.isWebGL3DRenderTarget || K.isWebGLArrayRenderTarget) && (ce = K.isWebGL3DRenderTarget ? r.TEXTURE_3D : r.TEXTURE_2D_ARRAY), i.bindTexture(ce, Ge.__webglTexture), nt(ce, ft), _e(fe.__webglFramebuffer, K, ft, r.COLOR_ATTACHMENT0 + tt, ce, 0), M(ft) && w(ce);
      }
      i.unbindTexture();
    } else {
      let tt = r.TEXTURE_2D;
      if ((K.isWebGL3DRenderTarget || K.isWebGLArrayRenderTarget) && (tt = K.isWebGL3DRenderTarget ? r.TEXTURE_3D : r.TEXTURE_2D_ARRAY), i.bindTexture(tt, Re.__webglTexture), nt(tt, G), G.mipmaps && G.mipmaps.length > 0) for (let ut = 0; ut < G.mipmaps.length; ut++) _e(fe.__webglFramebuffer[ut], K, G, r.COLOR_ATTACHMENT0, tt, ut);else _e(fe.__webglFramebuffer, K, G, r.COLOR_ATTACHMENT0, tt, 0);
      M(G) && w(tt), i.unbindTexture();
    }
    K.depthBuffer && Fe(K);
  }
  function De(K) {
    const G = K.textures;
    for (let fe = 0, Re = G.length; fe < Re; fe++) {
      const Ve = G[fe];
      if (M(Ve)) {
        const Me = D(K),
          ot = s.get(Ve).__webglTexture;
        i.bindTexture(Me, ot), w(Me), i.unbindTexture();
      }
    }
  }
  const Pe = [],
    Oe = [];
  function Be(K) {
    if (K.samples > 0) {
      if (Y(K) === !1) {
        const G = K.textures,
          fe = K.width,
          Re = K.height;
        let Ve = r.COLOR_BUFFER_BIT;
        const Me = K.stencilBuffer ? r.DEPTH_STENCIL_ATTACHMENT : r.DEPTH_ATTACHMENT,
          ot = s.get(K),
          tt = G.length > 1;
        if (tt) for (let ft = 0; ft < G.length; ft++) i.bindFramebuffer(r.FRAMEBUFFER, ot.__webglMultisampledFramebuffer), r.framebufferRenderbuffer(r.FRAMEBUFFER, r.COLOR_ATTACHMENT0 + ft, r.RENDERBUFFER, null), i.bindFramebuffer(r.FRAMEBUFFER, ot.__webglFramebuffer), r.framebufferTexture2D(r.DRAW_FRAMEBUFFER, r.COLOR_ATTACHMENT0 + ft, r.TEXTURE_2D, null, 0);
        i.bindFramebuffer(r.READ_FRAMEBUFFER, ot.__webglMultisampledFramebuffer);
        const ut = K.texture.mipmaps;
        ut && ut.length > 0 ? i.bindFramebuffer(r.DRAW_FRAMEBUFFER, ot.__webglFramebuffer[0]) : i.bindFramebuffer(r.DRAW_FRAMEBUFFER, ot.__webglFramebuffer);
        for (let ft = 0; ft < G.length; ft++) {
          if (K.resolveDepthBuffer && (K.depthBuffer && (Ve |= r.DEPTH_BUFFER_BIT), K.stencilBuffer && K.resolveStencilBuffer && (Ve |= r.STENCIL_BUFFER_BIT)), tt) {
            r.framebufferRenderbuffer(r.READ_FRAMEBUFFER, r.COLOR_ATTACHMENT0, r.RENDERBUFFER, ot.__webglColorRenderbuffer[ft]);
            const Ge = s.get(G[ft]).__webglTexture;
            r.framebufferTexture2D(r.DRAW_FRAMEBUFFER, r.COLOR_ATTACHMENT0, r.TEXTURE_2D, Ge, 0);
          }
          r.blitFramebuffer(0, 0, fe, Re, 0, 0, fe, Re, Ve, r.NEAREST), h === !0 && (Pe.length = 0, Oe.length = 0, Pe.push(r.COLOR_ATTACHMENT0 + ft), K.depthBuffer && K.resolveDepthBuffer === !1 && (Pe.push(Me), Oe.push(Me), r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER, Oe)), r.invalidateFramebuffer(r.READ_FRAMEBUFFER, Pe));
        }
        if (i.bindFramebuffer(r.READ_FRAMEBUFFER, null), i.bindFramebuffer(r.DRAW_FRAMEBUFFER, null), tt) for (let ft = 0; ft < G.length; ft++) {
          i.bindFramebuffer(r.FRAMEBUFFER, ot.__webglMultisampledFramebuffer), r.framebufferRenderbuffer(r.FRAMEBUFFER, r.COLOR_ATTACHMENT0 + ft, r.RENDERBUFFER, ot.__webglColorRenderbuffer[ft]);
          const Ge = s.get(G[ft]).__webglTexture;
          i.bindFramebuffer(r.FRAMEBUFFER, ot.__webglFramebuffer), r.framebufferTexture2D(r.DRAW_FRAMEBUFFER, r.COLOR_ATTACHMENT0 + ft, r.TEXTURE_2D, Ge, 0);
        }
        i.bindFramebuffer(r.DRAW_FRAMEBUFFER, ot.__webglMultisampledFramebuffer);
      } else if (K.depthBuffer && K.resolveDepthBuffer === !1 && h) {
        const G = K.stencilBuffer ? r.DEPTH_STENCIL_ATTACHMENT : r.DEPTH_ATTACHMENT;
        r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER, [G]);
      }
    }
  }
  function le(K) {
    return Math.min(a.maxSamples, K.samples);
  }
  function Y(K) {
    const G = s.get(K);
    return K.samples > 0 && e.has("WEBGL_multisampled_render_to_texture") === !0 && G.__useRenderToTexture !== !1;
  }
  function Xe(K) {
    const G = l.render.frame;
    p.get(K) !== G && (p.set(K, G), K.update());
  }
  function vt(K, G) {
    const fe = K.colorSpace,
      Re = K.format,
      Ve = K.type;
    return K.isCompressedTexture === !0 || K.isVideoTexture === !0 || fe !== scope.LinearSRGBColorSpace && fe !== scope.NoColorSpace && (scope.ColorManagement.getTransfer(fe) === scope.SRGBTransfer ? (Re !== scope.RGBAFormat || Ve !== scope.UnsignedByteType) && console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.") : console.error("THREE.WebGLTextures: Unsupported texture color space:", fe)), G;
  }
  function St(K) {
    return typeof HTMLImageElement < "u" && K instanceof HTMLImageElement ? (d.width = K.naturalWidth || K.width, d.height = K.naturalHeight || K.height) : typeof VideoFrame < "u" && K instanceof VideoFrame ? (d.width = K.displayWidth, d.height = K.displayHeight) : (d.width = K.width, d.height = K.height), d;
  }
  this.allocateTextureUnit = Z, this.resetTextureUnits = $, this.setTexture2D = se, this.setTexture2DArray = re, this.setTexture3D = he, this.setTextureCube = ee, this.rebindTextures = st, this.setupRenderTarget = j, this.updateRenderTargetMipmap = De, this.updateMultisampleRenderTarget = Be, this.setupDepthRenderbuffer = Fe, this.setupFrameBufferTexture = _e, this.useMultisampledRTT = Y;
};
}
