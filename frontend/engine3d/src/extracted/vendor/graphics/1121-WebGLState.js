/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 571398:582846.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1121(scope) {
scope.WebGLState = function WebGLState(r, e) {
  function i() {
    let ie = !1;
    const Ne = new scope.Vector4();
    let je = null;
    const rt = new scope.Vector4(0, 0, 0, 0);
    return {
      setMask: function (Ke) {
        je !== Ke && !ie && (r.colorMask(Ke, Ke, Ke, Ke), je = Ke);
      },
      setLocked: function (Ke) {
        ie = Ke;
      },
      setClear: function (Ke, ke, ct, wt, Pt) {
        Pt === !0 && (Ke *= wt, ke *= wt, ct *= wt), Ne.set(Ke, ke, ct, wt), rt.equals(Ne) === !1 && (r.clearColor(Ke, ke, ct, wt), rt.copy(Ne));
      },
      reset: function () {
        ie = !1, je = null, rt.set(-1, 0, 0, 0);
      }
    };
  }
  function s() {
    let ie = !1,
      Ne = !1,
      je = null,
      rt = null,
      Ke = null;
    return {
      setReversed: function (ke) {
        if (Ne !== ke) {
          const ct = e.get("EXT_clip_control");
          ke ? ct.clipControlEXT(ct.LOWER_LEFT_EXT, ct.ZERO_TO_ONE_EXT) : ct.clipControlEXT(ct.LOWER_LEFT_EXT, ct.NEGATIVE_ONE_TO_ONE_EXT), Ne = ke;
          const wt = Ke;
          Ke = null, this.setClear(wt);
        }
      },
      getReversed: function () {
        return Ne;
      },
      setTest: function (ke) {
        ke ? V(r.DEPTH_TEST) : _e(r.DEPTH_TEST);
      },
      setMask: function (ke) {
        je !== ke && !ie && (r.depthMask(ke), je = ke);
      },
      setFunc: function (ke) {
        if (Ne && (ke = scope.reversedFuncs[ke]), rt !== ke) {
          switch (ke) {
            case scope.NeverDepth:
              r.depthFunc(r.NEVER);
              break;
            case scope.AlwaysDepth:
              r.depthFunc(r.ALWAYS);
              break;
            case scope.LessDepth:
              r.depthFunc(r.LESS);
              break;
            case scope.LessEqualDepth:
              r.depthFunc(r.LEQUAL);
              break;
            case scope.EqualDepth:
              r.depthFunc(r.EQUAL);
              break;
            case scope.GreaterEqualDepth:
              r.depthFunc(r.GEQUAL);
              break;
            case scope.GreaterDepth:
              r.depthFunc(r.GREATER);
              break;
            case scope.NotEqualDepth:
              r.depthFunc(r.NOTEQUAL);
              break;
            default:
              r.depthFunc(r.LEQUAL);
          }
          rt = ke;
        }
      },
      setLocked: function (ke) {
        ie = ke;
      },
      setClear: function (ke) {
        Ke !== ke && (Ne && (ke = 1 - ke), r.clearDepth(ke), Ke = ke);
      },
      reset: function () {
        ie = !1, je = null, rt = null, Ke = null, Ne = !1;
      }
    };
  }
  function a() {
    let ie = !1,
      Ne = null,
      je = null,
      rt = null,
      Ke = null,
      ke = null,
      ct = null,
      wt = null,
      Pt = null;
    return {
      setTest: function (It) {
        ie || (It ? V(r.STENCIL_TEST) : _e(r.STENCIL_TEST));
      },
      setMask: function (It) {
        Ne !== It && !ie && (r.stencilMask(It), Ne = It);
      },
      setFunc: function (It, Gi, Bi) {
        (je !== It || rt !== Gi || Ke !== Bi) && (r.stencilFunc(It, Gi, Bi), je = It, rt = Gi, Ke = Bi);
      },
      setOp: function (It, Gi, Bi) {
        (ke !== It || ct !== Gi || wt !== Bi) && (r.stencilOp(It, Gi, Bi), ke = It, ct = Gi, wt = Bi);
      },
      setLocked: function (It) {
        ie = It;
      },
      setClear: function (It) {
        Pt !== It && (r.clearStencil(It), Pt = It);
      },
      reset: function () {
        ie = !1, Ne = null, je = null, rt = null, Ke = null, ke = null, ct = null, wt = null, Pt = null;
      }
    };
  }
  const o = new i(),
    l = new s(),
    c = new a(),
    h = new WeakMap(),
    d = new WeakMap();
  let p = {},
    f = {},
    _ = new WeakMap(),
    x = [],
    b = null,
    T = !1,
    M = null,
    w = null,
    D = null,
    R = null,
    P = null,
    U = null,
    O = null,
    N = new scope.Color(0, 0, 0),
    H = 0,
    F = !1,
    k = null,
    W = null,
    $ = null,
    Z = null,
    J = null;
  const se = r.getParameter(r.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
  let re = !1,
    he = 0;
  const ee = r.getParameter(r.VERSION);
  ee.indexOf("WebGL") !== -1 ? (he = parseFloat(/^WebGL (\d)/.exec(ee)[1]), re = he >= 1) : ee.indexOf("OpenGL ES") !== -1 && (he = parseFloat(/^OpenGL ES (\d)/.exec(ee)[1]), re = he >= 2);
  let Ie = null,
    Te = {};
  const Ue = r.getParameter(r.SCISSOR_BOX),
    nt = r.getParameter(r.VIEWPORT),
    mt = new scope.Vector4().fromArray(Ue),
    ve = new scope.Vector4().fromArray(nt);
  function ne(ie, Ne, je, rt) {
    const Ke = new Uint8Array(4),
      ke = r.createTexture();
    r.bindTexture(ie, ke), r.texParameteri(ie, r.TEXTURE_MIN_FILTER, r.NEAREST), r.texParameteri(ie, r.TEXTURE_MAG_FILTER, r.NEAREST);
    for (let ct = 0; ct < je; ct++) ie === r.TEXTURE_3D || ie === r.TEXTURE_2D_ARRAY ? r.texImage3D(Ne, 0, r.RGBA, 1, 1, rt, 0, r.RGBA, r.UNSIGNED_BYTE, Ke) : r.texImage2D(Ne + ct, 0, r.RGBA, 1, 1, 0, r.RGBA, r.UNSIGNED_BYTE, Ke);
    return ke;
  }
  const z = {};
  z[r.TEXTURE_2D] = ne(r.TEXTURE_2D, r.TEXTURE_2D, 1), z[r.TEXTURE_CUBE_MAP] = ne(r.TEXTURE_CUBE_MAP, r.TEXTURE_CUBE_MAP_POSITIVE_X, 6), z[r.TEXTURE_2D_ARRAY] = ne(r.TEXTURE_2D_ARRAY, r.TEXTURE_2D_ARRAY, 1, 1), z[r.TEXTURE_3D] = ne(r.TEXTURE_3D, r.TEXTURE_3D, 1, 1), o.setClear(0, 0, 0, 1), l.setClear(1), c.setClear(0), V(r.DEPTH_TEST), l.setFunc(scope.LessEqualDepth), Oe(!1), Be(scope.CullFaceBack), V(r.CULL_FACE), De(scope.NoBlending);
  function V(ie) {
    p[ie] !== !0 && (r.enable(ie), p[ie] = !0);
  }
  function _e(ie) {
    p[ie] !== !1 && (r.disable(ie), p[ie] = !1);
  }
  function Le(ie, Ne) {
    return f[ie] !== Ne ? (r.bindFramebuffer(ie, Ne), f[ie] = Ne, ie === r.DRAW_FRAMEBUFFER && (f[r.FRAMEBUFFER] = Ne), ie === r.FRAMEBUFFER && (f[r.DRAW_FRAMEBUFFER] = Ne), !0) : !1;
  }
  function pe(ie, Ne) {
    let je = x,
      rt = !1;
    if (ie) {
      je = _.get(Ne), je === void 0 && (je = [], _.set(Ne, je));
      const Ke = ie.textures;
      if (je.length !== Ke.length || je[0] !== r.COLOR_ATTACHMENT0) {
        for (let ke = 0, ct = Ke.length; ke < ct; ke++) je[ke] = r.COLOR_ATTACHMENT0 + ke;
        je.length = Ke.length, rt = !0;
      }
    } else je[0] !== r.BACK && (je[0] = r.BACK, rt = !0);
    rt && r.drawBuffers(je);
  }
  function Fe(ie) {
    return b !== ie ? (r.useProgram(ie), b = ie, !0) : !1;
  }
  const st = {
    [scope.AddEquation]: r.FUNC_ADD,
    [scope.SubtractEquation]: r.FUNC_SUBTRACT,
    [scope.ReverseSubtractEquation]: r.FUNC_REVERSE_SUBTRACT
  };
  st[scope.MinEquation] = r.MIN, st[scope.MaxEquation] = r.MAX;
  const j = {
    [scope.ZeroFactor]: r.ZERO,
    [scope.OneFactor]: r.ONE,
    [scope.SrcColorFactor]: r.SRC_COLOR,
    [scope.SrcAlphaFactor]: r.SRC_ALPHA,
    [scope.SrcAlphaSaturateFactor]: r.SRC_ALPHA_SATURATE,
    [scope.DstColorFactor]: r.DST_COLOR,
    [scope.DstAlphaFactor]: r.DST_ALPHA,
    [scope.OneMinusSrcColorFactor]: r.ONE_MINUS_SRC_COLOR,
    [scope.OneMinusSrcAlphaFactor]: r.ONE_MINUS_SRC_ALPHA,
    [scope.OneMinusDstColorFactor]: r.ONE_MINUS_DST_COLOR,
    [scope.OneMinusDstAlphaFactor]: r.ONE_MINUS_DST_ALPHA,
    [scope.ConstantColorFactor]: r.CONSTANT_COLOR,
    [scope.OneMinusConstantColorFactor]: r.ONE_MINUS_CONSTANT_COLOR,
    [scope.ConstantAlphaFactor]: r.CONSTANT_ALPHA,
    [scope.OneMinusConstantAlphaFactor]: r.ONE_MINUS_CONSTANT_ALPHA
  };
  function De(ie, Ne, je, rt, Ke, ke, ct, wt, Pt, It) {
    if (ie === scope.NoBlending) {
      T === !0 && (_e(r.BLEND), T = !1);
      return;
    }
    if (T === !1 && (V(r.BLEND), T = !0), ie !== scope.CustomBlending) {
      if (ie !== M || It !== F) {
        if ((w !== scope.AddEquation || P !== scope.AddEquation) && (r.blendEquation(r.FUNC_ADD), w = scope.AddEquation, P = scope.AddEquation), It) switch (ie) {
          case scope.NormalBlending:
            r.blendFuncSeparate(r.ONE, r.ONE_MINUS_SRC_ALPHA, r.ONE, r.ONE_MINUS_SRC_ALPHA);
            break;
          case scope.AdditiveBlending:
            r.blendFunc(r.ONE, r.ONE);
            break;
          case scope.SubtractiveBlending:
            r.blendFuncSeparate(r.ZERO, r.ONE_MINUS_SRC_COLOR, r.ZERO, r.ONE);
            break;
          case scope.MultiplyBlending:
            r.blendFuncSeparate(r.DST_COLOR, r.ONE_MINUS_SRC_ALPHA, r.ZERO, r.ONE);
            break;
          default:
            console.error("THREE.WebGLState: Invalid blending: ", ie);
            break;
        } else switch (ie) {
          case scope.NormalBlending:
            r.blendFuncSeparate(r.SRC_ALPHA, r.ONE_MINUS_SRC_ALPHA, r.ONE, r.ONE_MINUS_SRC_ALPHA);
            break;
          case scope.AdditiveBlending:
            r.blendFuncSeparate(r.SRC_ALPHA, r.ONE, r.ONE, r.ONE);
            break;
          case scope.SubtractiveBlending:
            console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");
            break;
          case scope.MultiplyBlending:
            console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");
            break;
          default:
            console.error("THREE.WebGLState: Invalid blending: ", ie);
            break;
        }
        D = null, R = null, U = null, O = null, N.set(0, 0, 0), H = 0, M = ie, F = It;
      }
      return;
    }
    Ke = Ke || Ne, ke = ke || je, ct = ct || rt, (Ne !== w || Ke !== P) && (r.blendEquationSeparate(st[Ne], st[Ke]), w = Ne, P = Ke), (je !== D || rt !== R || ke !== U || ct !== O) && (r.blendFuncSeparate(j[je], j[rt], j[ke], j[ct]), D = je, R = rt, U = ke, O = ct), (wt.equals(N) === !1 || Pt !== H) && (r.blendColor(wt.r, wt.g, wt.b, Pt), N.copy(wt), H = Pt), M = ie, F = !1;
  }
  function Pe(ie, Ne) {
    ie.side === scope.DoubleSide ? _e(r.CULL_FACE) : V(r.CULL_FACE);
    let je = ie.side === scope.BackSide;
    Ne && (je = !je), Oe(je), ie.blending === scope.NormalBlending && ie.transparent === !1 ? De(scope.NoBlending) : De(ie.blending, ie.blendEquation, ie.blendSrc, ie.blendDst, ie.blendEquationAlpha, ie.blendSrcAlpha, ie.blendDstAlpha, ie.blendColor, ie.blendAlpha, ie.premultipliedAlpha), l.setFunc(ie.depthFunc), l.setTest(ie.depthTest), l.setMask(ie.depthWrite), o.setMask(ie.colorWrite);
    const rt = ie.stencilWrite;
    c.setTest(rt), rt && (c.setMask(ie.stencilWriteMask), c.setFunc(ie.stencilFunc, ie.stencilRef, ie.stencilFuncMask), c.setOp(ie.stencilFail, ie.stencilZFail, ie.stencilZPass)), Y(ie.polygonOffset, ie.polygonOffsetFactor, ie.polygonOffsetUnits), ie.alphaToCoverage === !0 ? V(r.SAMPLE_ALPHA_TO_COVERAGE) : _e(r.SAMPLE_ALPHA_TO_COVERAGE);
  }
  function Oe(ie) {
    k !== ie && (ie ? r.frontFace(r.CW) : r.frontFace(r.CCW), k = ie);
  }
  function Be(ie) {
    ie !== scope.CullFaceNone ? (V(r.CULL_FACE), ie !== W && (ie === scope.CullFaceBack ? r.cullFace(r.BACK) : ie === scope.CullFaceFront ? r.cullFace(r.FRONT) : r.cullFace(r.FRONT_AND_BACK))) : _e(r.CULL_FACE), W = ie;
  }
  function le(ie) {
    ie !== $ && (re && r.lineWidth(ie), $ = ie);
  }
  function Y(ie, Ne, je) {
    ie ? (V(r.POLYGON_OFFSET_FILL), (Z !== Ne || J !== je) && (r.polygonOffset(Ne, je), Z = Ne, J = je)) : _e(r.POLYGON_OFFSET_FILL);
  }
  function Xe(ie) {
    ie ? V(r.SCISSOR_TEST) : _e(r.SCISSOR_TEST);
  }
  function vt(ie) {
    ie === void 0 && (ie = r.TEXTURE0 + se - 1), Ie !== ie && (r.activeTexture(ie), Ie = ie);
  }
  function St(ie, Ne, je) {
    je === void 0 && (Ie === null ? je = r.TEXTURE0 + se - 1 : je = Ie);
    let rt = Te[je];
    rt === void 0 && (rt = {
      type: void 0,
      texture: void 0
    }, Te[je] = rt), (rt.type !== ie || rt.texture !== Ne) && (Ie !== je && (r.activeTexture(je), Ie = je), r.bindTexture(ie, Ne || z[ie]), rt.type = ie, rt.texture = Ne);
  }
  function K() {
    const ie = Te[Ie];
    ie !== void 0 && ie.type !== void 0 && (r.bindTexture(ie.type, null), ie.type = void 0, ie.texture = void 0);
  }
  function G() {
    try {
      r.compressedTexImage2D(...arguments);
    } catch (ie) {
      console.error("THREE.WebGLState:", ie);
    }
  }
  function fe() {
    try {
      r.compressedTexImage3D(...arguments);
    } catch (ie) {
      console.error("THREE.WebGLState:", ie);
    }
  }
  function Re() {
    try {
      r.texSubImage2D(...arguments);
    } catch (ie) {
      console.error("THREE.WebGLState:", ie);
    }
  }
  function Ve() {
    try {
      r.texSubImage3D(...arguments);
    } catch (ie) {
      console.error("THREE.WebGLState:", ie);
    }
  }
  function Me() {
    try {
      r.compressedTexSubImage2D(...arguments);
    } catch (ie) {
      console.error("THREE.WebGLState:", ie);
    }
  }
  function ot() {
    try {
      r.compressedTexSubImage3D(...arguments);
    } catch (ie) {
      console.error("THREE.WebGLState:", ie);
    }
  }
  function tt() {
    try {
      r.texStorage2D(...arguments);
    } catch (ie) {
      console.error("THREE.WebGLState:", ie);
    }
  }
  function ut() {
    try {
      r.texStorage3D(...arguments);
    } catch (ie) {
      console.error("THREE.WebGLState:", ie);
    }
  }
  function ft() {
    try {
      r.texImage2D(...arguments);
    } catch (ie) {
      console.error("THREE.WebGLState:", ie);
    }
  }
  function Ge() {
    try {
      r.texImage3D(...arguments);
    } catch (ie) {
      console.error("THREE.WebGLState:", ie);
    }
  }
  function ce(ie) {
    mt.equals(ie) === !1 && (r.scissor(ie.x, ie.y, ie.z, ie.w), mt.copy(ie));
  }
  function xe(ie) {
    ve.equals(ie) === !1 && (r.viewport(ie.x, ie.y, ie.z, ie.w), ve.copy(ie));
  }
  function be(ie, Ne) {
    let je = d.get(Ne);
    je === void 0 && (je = new WeakMap(), d.set(Ne, je));
    let rt = je.get(ie);
    rt === void 0 && (rt = r.getUniformBlockIndex(Ne, ie.name), je.set(ie, rt));
  }
  function Ce(ie, Ne) {
    const rt = d.get(Ne).get(ie);
    h.get(Ne) !== rt && (r.uniformBlockBinding(Ne, rt, ie.__bindingPointIndex), h.set(Ne, rt));
  }
  function $e() {
    r.disable(r.BLEND), r.disable(r.CULL_FACE), r.disable(r.DEPTH_TEST), r.disable(r.POLYGON_OFFSET_FILL), r.disable(r.SCISSOR_TEST), r.disable(r.STENCIL_TEST), r.disable(r.SAMPLE_ALPHA_TO_COVERAGE), r.blendEquation(r.FUNC_ADD), r.blendFunc(r.ONE, r.ZERO), r.blendFuncSeparate(r.ONE, r.ZERO, r.ONE, r.ZERO), r.blendColor(0, 0, 0, 0), r.colorMask(!0, !0, !0, !0), r.clearColor(0, 0, 0, 0), r.depthMask(!0), r.depthFunc(r.LESS), l.setReversed(!1), r.clearDepth(1), r.stencilMask(4294967295), r.stencilFunc(r.ALWAYS, 0, 4294967295), r.stencilOp(r.KEEP, r.KEEP, r.KEEP), r.clearStencil(0), r.cullFace(r.BACK), r.frontFace(r.CCW), r.polygonOffset(0, 0), r.activeTexture(r.TEXTURE0), r.bindFramebuffer(r.FRAMEBUFFER, null), r.bindFramebuffer(r.DRAW_FRAMEBUFFER, null), r.bindFramebuffer(r.READ_FRAMEBUFFER, null), r.useProgram(null), r.lineWidth(1), r.scissor(0, 0, r.canvas.width, r.canvas.height), r.viewport(0, 0, r.canvas.width, r.canvas.height), p = {}, Ie = null, Te = {}, f = {}, _ = new WeakMap(), x = [], b = null, T = !1, M = null, w = null, D = null, R = null, P = null, U = null, O = null, N = new scope.Color(0, 0, 0), H = 0, F = !1, k = null, W = null, $ = null, Z = null, J = null, mt.set(0, 0, r.canvas.width, r.canvas.height), ve.set(0, 0, r.canvas.width, r.canvas.height), o.reset(), l.reset(), c.reset();
  }
  return {
    buffers: {
      color: o,
      depth: l,
      stencil: c
    },
    enable: V,
    disable: _e,
    bindFramebuffer: Le,
    drawBuffers: pe,
    useProgram: Fe,
    setBlending: De,
    setMaterial: Pe,
    setFlipSided: Oe,
    setCullFace: Be,
    setLineWidth: le,
    setPolygonOffset: Y,
    setScissorTest: Xe,
    activeTexture: vt,
    bindTexture: St,
    unbindTexture: K,
    compressedTexImage2D: G,
    compressedTexImage3D: fe,
    texImage2D: ft,
    texImage3D: Ge,
    updateUBOMapping: be,
    uniformBlockBinding: Ce,
    texStorage2D: tt,
    texStorage3D: ut,
    texSubImage2D: Re,
    texSubImage3D: Ve,
    compressedTexSubImage2D: Me,
    compressedTexSubImage3D: ot,
    scissor: ce,
    viewport: xe,
    reset: $e
  };
};
}
