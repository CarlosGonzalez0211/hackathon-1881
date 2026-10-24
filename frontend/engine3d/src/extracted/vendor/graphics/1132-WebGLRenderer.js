/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 638721:672272.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1132(scope) {
scope.WebGLRenderer = class WebGLRenderer {
  constructor(e = {}) {
    const {
      canvas: i = scope.createCanvasElement(),
      context: s = null,
      depth: a = !0,
      stencil: o = !1,
      alpha: l = !1,
      antialias: c = !1,
      premultipliedAlpha: h = !0,
      preserveDrawingBuffer: d = !1,
      powerPreference: p = "default",
      failIfMajorPerformanceCaveat: f = !1,
      reversedDepthBuffer: _ = !1
    } = e;
    this.isWebGLRenderer = !0;
    let x;
    if (s !== null) {
      if (typeof WebGLRenderingContext < "u" && s instanceof WebGLRenderingContext) throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");
      x = s.getContextAttributes().alpha;
    } else x = l;
    const b = new Uint32Array(4),
      T = new Int32Array(4);
    let M = null,
      w = null;
    const D = [],
      R = [];
    this.domElement = i, this.debug = {
      checkShaderErrors: !0,
      onShaderError: null
    }, this.autoClear = !0, this.autoClearColor = !0, this.autoClearDepth = !0, this.autoClearStencil = !0, this.sortObjects = !0, this.clippingPlanes = [], this.localClippingEnabled = !1, this.toneMapping = scope.NoToneMapping, this.toneMappingExposure = 1, this.transmissionResolutionScale = 1;
    const P = this;
    let U = !1;
    this._outputColorSpace = scope.SRGBColorSpace;
    let O = 0,
      N = 0,
      H = null,
      F = -1,
      k = null;
    const W = new scope.Vector4(),
      $ = new scope.Vector4();
    let Z = null;
    const J = new scope.Color(0);
    let se = 0,
      re = i.width,
      he = i.height,
      ee = 1,
      Ie = null,
      Te = null;
    const Ue = new scope.Vector4(0, 0, re, he),
      nt = new scope.Vector4(0, 0, re, he);
    let mt = !1;
    const ve = new scope.Frustum();
    let ne = !1,
      z = !1;
    const V = new scope.Matrix4(),
      _e = new scope.Vector3(),
      Le = new scope.Vector4(),
      pe = {
        background: null,
        fog: null,
        environment: null,
        overrideMaterial: null,
        isScene: !0
      };
    let Fe = !1;
    function st() {
      return H === null ? ee : 1;
    }
    let j = s;
    function De(q, me) {
      return i.getContext(q, me);
    }
    try {
      const q = {
        alpha: !0,
        depth: a,
        stencil: o,
        antialias: c,
        premultipliedAlpha: h,
        preserveDrawingBuffer: d,
        powerPreference: p,
        failIfMajorPerformanceCaveat: f
      };
      if ("setAttribute" in i && i.setAttribute("data-engine", `three.js r${scope.REVISION}`), scope.__lifecycle.listen(i, "webglcontextlost", je, !1), scope.__lifecycle.listen(i, "webglcontextrestored", rt, !1), scope.__lifecycle.listen(i, "webglcontextcreationerror", Ke, !1), j === null) {
        const me = "webgl2";
        if (j = De(me, q), j === null) throw De(me) ? new Error("Error creating WebGL context with your selected attributes.") : new Error("Error creating WebGL context.");
      }
    } catch (q) {
      throw console.error("THREE.WebGLRenderer: " + q.message), q;
    }
    let Pe, Oe, Be, le, Y, Xe, vt, St, K, G, fe, Re, Ve, Me, ot, tt, ut, ft, Ge, ce, xe, be, Ce, $e;
    function ie() {
      Pe = new scope.WebGLExtensions(j), Pe.init(), be = new scope.WebGLUtils(j, Pe), Oe = new scope.WebGLCapabilities(j, Pe, e, be), Be = new scope.WebGLState(j, Pe), Oe.reversedDepthBuffer && _ && Be.buffers.depth.setReversed(!0), le = new scope.WebGLInfo(j), Y = new scope.WebGLProperties(), Xe = new scope.WebGLTextures(j, Pe, Be, Y, Oe, be, le), vt = new scope.WebGLCubeMaps(P), St = new scope.WebGLCubeUVMaps(P), K = new scope.WebGLAttributes(j), Ce = new scope.WebGLBindingStates(j, K), G = new scope.WebGLGeometries(j, K, le, Ce), fe = new scope.WebGLObjects(j, G, K, le), Ge = new scope.WebGLMorphtargets(j, Oe, Xe), tt = new scope.WebGLClipping(Y), Re = new scope.WebGLPrograms(P, vt, St, Pe, Oe, Ce, tt), Ve = new scope.WebGLMaterials(P, Y), Me = new scope.WebGLRenderLists(), ot = new scope.WebGLRenderStates(Pe), ft = new scope.WebGLBackground(P, vt, St, Be, fe, x, h), ut = new scope.WebGLShadowMap(P, fe, Oe), $e = new scope.WebGLUniformsGroups(j, le, Oe, Be), ce = new scope.WebGLBufferRenderer(j, Pe, le), xe = new scope.WebGLIndexedBufferRenderer(j, Pe, le), le.programs = Re.programs, P.capabilities = Oe, P.extensions = Pe, P.properties = Y, P.renderLists = Me, P.shadowMap = ut, P.state = Be, P.info = le;
    }
    ie();
    const Ne = new scope.WebXRManager(P, j);
    this.xr = Ne, this.getContext = function () {
      return j;
    }, this.getContextAttributes = function () {
      return j.getContextAttributes();
    }, this.forceContextLoss = function () {
      const q = Pe.get("WEBGL_lose_context");
      q && q.loseContext();
    }, this.forceContextRestore = function () {
      const q = Pe.get("WEBGL_lose_context");
      q && q.restoreContext();
    }, this.getPixelRatio = function () {
      return ee;
    }, this.setPixelRatio = function (q) {
      q !== void 0 && (ee = q, this.setSize(re, he, !1));
    }, this.getSize = function (q) {
      return q.set(re, he);
    }, this.setSize = function (q, me, we = !0) {
      if (Ne.isPresenting) {
        console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");
        return;
      }
      re = q, he = me, i.width = Math.floor(q * ee), i.height = Math.floor(me * ee), we === !0 && (i.style.width = q + "px", i.style.height = me + "px"), this.setViewport(0, 0, q, me);
    }, this.getDrawingBufferSize = function (q) {
      return q.set(re * ee, he * ee).floor();
    }, this.setDrawingBufferSize = function (q, me, we) {
      re = q, he = me, ee = we, i.width = Math.floor(q * we), i.height = Math.floor(me * we), this.setViewport(0, 0, q, me);
    }, this.getCurrentViewport = function (q) {
      return q.copy(W);
    }, this.getViewport = function (q) {
      return q.copy(Ue);
    }, this.setViewport = function (q, me, we, Se) {
      q.isVector4 ? Ue.set(q.x, q.y, q.z, q.w) : Ue.set(q, me, we, Se), Be.viewport(W.copy(Ue).multiplyScalar(ee).round());
    }, this.getScissor = function (q) {
      return q.copy(nt);
    }, this.setScissor = function (q, me, we, Se) {
      q.isVector4 ? nt.set(q.x, q.y, q.z, q.w) : nt.set(q, me, we, Se), Be.scissor($.copy(nt).multiplyScalar(ee).round());
    }, this.getScissorTest = function () {
      return mt;
    }, this.setScissorTest = function (q) {
      Be.setScissorTest(mt = q);
    }, this.setOpaqueSort = function (q) {
      Ie = q;
    }, this.setTransparentSort = function (q) {
      Te = q;
    }, this.getClearColor = function (q) {
      return q.copy(ft.getClearColor());
    }, this.setClearColor = function () {
      ft.setClearColor(...arguments);
    }, this.getClearAlpha = function () {
      return ft.getClearAlpha();
    }, this.setClearAlpha = function () {
      ft.setClearAlpha(...arguments);
    }, this.clear = function (q = !0, me = !0, we = !0) {
      let Se = 0;
      if (q) {
        let ge = !1;
        if (H !== null) {
          const et = H.texture.format;
          ge = et === scope.RGBAIntegerFormat || et === scope.RGIntegerFormat || et === scope.RedIntegerFormat;
        }
        if (ge) {
          const et = H.texture.type,
            at = et === scope.UnsignedByteType || et === scope.UnsignedIntType || et === scope.UnsignedShortType || et === scope.UnsignedInt248Type || et === scope.UnsignedShort4444Type || et === scope.UnsignedShort5551Type,
            pt = ft.getClearColor(),
            lt = ft.getClearAlpha(),
            yt = pt.r,
            bt = pt.g,
            At = pt.b;
          at ? (b[0] = yt, b[1] = bt, b[2] = At, b[3] = lt, j.clearBufferuiv(j.COLOR, 0, b)) : (T[0] = yt, T[1] = bt, T[2] = At, T[3] = lt, j.clearBufferiv(j.COLOR, 0, T));
        } else Se |= j.COLOR_BUFFER_BIT;
      }
      me && (Se |= j.DEPTH_BUFFER_BIT), we && (Se |= j.STENCIL_BUFFER_BIT, this.state.buffers.stencil.setMask(4294967295)), j.clear(Se);
    }, this.clearColor = function () {
      this.clear(!0, !1, !1);
    }, this.clearDepth = function () {
      this.clear(!1, !0, !1);
    }, this.clearStencil = function () {
      this.clear(!1, !1, !0);
    }, this.dispose = function () {
      scope.__lifecycle.unlisten(i, "webglcontextlost", je, !1), scope.__lifecycle.unlisten(i, "webglcontextrestored", rt, !1), scope.__lifecycle.unlisten(i, "webglcontextcreationerror", Ke, !1), ft.dispose(), Me.dispose(), ot.dispose(), Y.dispose(), vt.dispose(), St.dispose(), fe.dispose(), Ce.dispose(), $e.dispose(), Re.dispose(), Ne.dispose(), scope.__lifecycle.unlisten(Ne, "sessionstart", Bi), scope.__lifecycle.unlisten(Ne, "sessionend", $a), yn.stop();
    };
    function je(q) {
      q.preventDefault(), console.log("THREE.WebGLRenderer: Context Lost."), U = !0;
    }
    function rt() {
      console.log("THREE.WebGLRenderer: Context Restored."), U = !1;
      const q = le.autoReset,
        me = ut.enabled,
        we = ut.autoUpdate,
        Se = ut.needsUpdate,
        ge = ut.type;
      ie(), le.autoReset = q, ut.enabled = me, ut.autoUpdate = we, ut.needsUpdate = Se, ut.type = ge;
    }
    function Ke(q) {
      console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ", q.statusMessage);
    }
    function ke(q) {
      const me = q.target;
      scope.__lifecycle.unlisten(me, "dispose", ke), ct(me);
    }
    function ct(q) {
      wt(q), Y.remove(q);
    }
    function wt(q) {
      const me = Y.get(q).programs;
      me !== void 0 && (me.forEach(function (we) {
        Re.releaseProgram(we);
      }), q.isShaderMaterial && Re.releaseShaderCache(q));
    }
    this.renderBufferDirect = function (q, me, we, Se, ge, et) {
      me === null && (me = pe);
      const at = ge.isMesh && ge.matrixWorld.determinant() < 0,
        pt = Do(q, me, we, Se, ge);
      Be.setMaterial(Se, at);
      let lt = we.index,
        yt = 1;
      if (Se.wireframe === !0) {
        if (lt = G.getWireframeAttribute(we), lt === void 0) return;
        yt = 2;
      }
      const bt = we.drawRange,
        At = we.attributes.position;
      let Ct = bt.start * yt,
        Bt = (bt.start + bt.count) * yt;
      et !== null && (Ct = Math.max(Ct, et.start * yt), Bt = Math.min(Bt, (et.start + et.count) * yt)), lt !== null ? (Ct = Math.max(Ct, 0), Bt = Math.min(Bt, lt.count)) : At != null && (Ct = Math.max(Ct, 0), Bt = Math.min(Bt, At.count));
      const zt = Bt - Ct;
      if (zt < 0 || zt === 1 / 0) return;
      Ce.setup(ge, Se, pt, we, lt);
      let Ut,
        Dt = ce;
      if (lt !== null && (Ut = K.get(lt), Dt = xe, Dt.setIndex(Ut)), ge.isMesh) Se.wireframe === !0 ? (Be.setLineWidth(Se.wireframeLinewidth * st()), Dt.setMode(j.LINES)) : Dt.setMode(j.TRIANGLES);else if (ge.isLine) {
        let _t = Se.linewidth;
        _t === void 0 && (_t = 1), Be.setLineWidth(_t * st()), ge.isLineSegments ? Dt.setMode(j.LINES) : ge.isLineLoop ? Dt.setMode(j.LINE_LOOP) : Dt.setMode(j.LINE_STRIP);
      } else ge.isPoints ? Dt.setMode(j.POINTS) : ge.isSprite && Dt.setMode(j.TRIANGLES);
      if (ge.isBatchedMesh) {
        if (ge._multiDrawInstances !== null) scope.warnOnce("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."), Dt.renderMultiDrawInstances(ge._multiDrawStarts, ge._multiDrawCounts, ge._multiDrawCount, ge._multiDrawInstances);else if (Pe.get("WEBGL_multi_draw")) Dt.renderMultiDraw(ge._multiDrawStarts, ge._multiDrawCounts, ge._multiDrawCount);else {
          const _t = ge._multiDrawStarts,
            Ot = ge._multiDrawCounts,
            Tt = ge._multiDrawCount,
            ni = lt ? K.get(lt).bytesPerElement : 1,
            Xn = Y.get(Se).currentProgram.getUniforms();
          for (let si = 0; si < Tt; si++) Xn.setValue(j, "_gl_DrawID", si), Dt.render(_t[si] / ni, Ot[si]);
        }
      } else if (ge.isInstancedMesh) Dt.renderInstances(Ct, zt, ge.count);else if (we.isInstancedBufferGeometry) {
        const _t = we._maxInstanceCount !== void 0 ? we._maxInstanceCount : 1 / 0,
          Ot = Math.min(we.instanceCount, _t);
        Dt.renderInstances(Ct, zt, Ot);
      } else Dt.render(Ct, zt);
    };
    function Pt(q, me, we) {
      q.transparent === !0 && q.side === scope.DoubleSide && q.forceSinglePass === !1 ? (q.side = scope.BackSide, q.needsUpdate = !0, Tr(q, me, we), q.side = scope.FrontSide, q.needsUpdate = !0, Tr(q, me, we), q.side = scope.DoubleSide) : Tr(q, me, we);
    }
    this.compile = function (q, me, we = null) {
      we === null && (we = q), w = ot.get(we), w.init(me), R.push(w), we.traverseVisible(function (ge) {
        ge.isLight && ge.layers.test(me.layers) && (w.pushLight(ge), ge.castShadow && w.pushShadow(ge));
      }), q !== we && q.traverseVisible(function (ge) {
        ge.isLight && ge.layers.test(me.layers) && (w.pushLight(ge), ge.castShadow && w.pushShadow(ge));
      }), w.setupLights();
      const Se = new Set();
      return q.traverse(function (ge) {
        if (!(ge.isMesh || ge.isPoints || ge.isLine || ge.isSprite)) return;
        const et = ge.material;
        if (et) if (Array.isArray(et)) for (let at = 0; at < et.length; at++) {
          const pt = et[at];
          Pt(pt, we, ge), Se.add(pt);
        } else Pt(et, we, ge), Se.add(et);
      }), w = R.pop(), Se;
    }, this.compileAsync = function (q, me, we = null) {
      const Se = this.compile(q, me, we);
      return new Promise(ge => {
        function et() {
          if (Se.forEach(function (at) {
            Y.get(at).currentProgram.isReady() && Se.delete(at);
          }), Se.size === 0) {
            ge(q);
            return;
          }
          scope.__lifecycle.setTimeout(et, 10);
        }
        Pe.get("KHR_parallel_shader_compile") !== null ? et() : scope.__lifecycle.setTimeout(et, 10);
      });
    };
    let It = null;
    function Gi(q) {
      It && It(q);
    }
    function Bi() {
      yn.stop();
    }
    function $a() {
      yn.start();
    }
    const yn = new scope.WebGLAnimation();
    yn.setAnimationLoop(Gi), typeof self < "u" && yn.setContext(self), this.setAnimationLoop = function (q) {
      It = q, Ne.setAnimationLoop(q), q === null ? yn.stop() : yn.start();
    }, scope.__lifecycle.listen(Ne, "sessionstart", Bi), scope.__lifecycle.listen(Ne, "sessionend", $a), this.render = function (q, me) {
      if (me !== void 0 && me.isCamera !== !0) {
        console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");
        return;
      }
      if (U === !0) return;
      if (q.matrixWorldAutoUpdate === !0 && q.updateMatrixWorld(), me.parent === null && me.matrixWorldAutoUpdate === !0 && me.updateMatrixWorld(), Ne.enabled === !0 && Ne.isPresenting === !0 && (Ne.cameraAutoUpdate === !0 && Ne.updateCamera(me), me = Ne.getCamera()), q.isScene === !0 && q.onBeforeRender(P, q, me, H), w = ot.get(q, R.length), w.init(me), R.push(w), V.multiplyMatrices(me.projectionMatrix, me.matrixWorldInverse), ve.setFromProjectionMatrix(V, scope.WebGLCoordinateSystem, me.reversedDepth), z = this.localClippingEnabled, ne = tt.init(this.clippingPlanes, z), M = Me.get(q, D.length), M.init(), D.push(M), Ne.enabled === !0 && Ne.isPresenting === !0) {
        const et = P.xr.getDepthSensingMesh();
        et !== null && fa(et, me, -1 / 0, P.sortObjects);
      }
      fa(q, me, 0, P.sortObjects), M.finish(), P.sortObjects === !0 && M.sort(Ie, Te), Fe = Ne.enabled === !1 || Ne.isPresenting === !1 || Ne.hasDepthSensing() === !1, Fe && ft.addToRenderList(M, q), this.info.render.frame++, ne === !0 && tt.beginShadows();
      const we = w.state.shadowsArray;
      ut.render(we, q, me), ne === !0 && tt.endShadows(), this.info.autoReset === !0 && this.info.reset();
      const Se = M.opaque,
        ge = M.transmissive;
      if (w.setupLights(), me.isArrayCamera) {
        const et = me.cameras;
        if (ge.length > 0) for (let at = 0, pt = et.length; at < pt; at++) {
          const lt = et[at];
          Ya(Se, ge, q, lt);
        }
        Fe && ft.render(q);
        for (let at = 0, pt = et.length; at < pt; at++) {
          const lt = et[at];
          Xa(M, q, lt, lt.viewport);
        }
      } else ge.length > 0 && Ya(Se, ge, q, me), Fe && ft.render(q), Xa(M, q, me);
      H !== null && N === 0 && (Xe.updateMultisampleRenderTarget(H), Xe.updateRenderTargetMipmap(H)), q.isScene === !0 && q.onAfterRender(P, q, me), Ce.resetDefaultState(), F = -1, k = null, R.pop(), R.length > 0 ? (w = R[R.length - 1], ne === !0 && tt.setGlobalState(P.clippingPlanes, w.state.camera)) : w = null, D.pop(), D.length > 0 ? M = D[D.length - 1] : M = null;
    };
    function fa(q, me, we, Se) {
      if (q.visible === !1) return;
      if (q.layers.test(me.layers)) {
        if (q.isGroup) we = q.renderOrder;else if (q.isLOD) q.autoUpdate === !0 && q.update(me);else if (q.isLight) w.pushLight(q), q.castShadow && w.pushShadow(q);else if (q.isSprite) {
          if (!q.frustumCulled || ve.intersectsSprite(q)) {
            Se && Le.setFromMatrixPosition(q.matrixWorld).applyMatrix4(V);
            const at = fe.update(q),
              pt = q.material;
            pt.visible && M.push(q, at, pt, we, Le.z, null);
          }
        } else if ((q.isMesh || q.isLine || q.isPoints) && (!q.frustumCulled || ve.intersectsObject(q))) {
          const at = fe.update(q),
            pt = q.material;
          if (Se && (q.boundingSphere !== void 0 ? (q.boundingSphere === null && q.computeBoundingSphere(), Le.copy(q.boundingSphere.center)) : (at.boundingSphere === null && at.computeBoundingSphere(), Le.copy(at.boundingSphere.center)), Le.applyMatrix4(q.matrixWorld).applyMatrix4(V)), Array.isArray(pt)) {
            const lt = at.groups;
            for (let yt = 0, bt = lt.length; yt < bt; yt++) {
              const At = lt[yt],
                Ct = pt[At.materialIndex];
              Ct && Ct.visible && M.push(q, at, Ct, we, Le.z, At);
            }
          } else pt.visible && M.push(q, at, pt, we, Le.z, null);
        }
      }
      const et = q.children;
      for (let at = 0, pt = et.length; at < pt; at++) fa(et[at], me, we, Se);
    }
    function Xa(q, me, we, Se) {
      const ge = q.opaque,
        et = q.transmissive,
        at = q.transparent;
      w.setupLightsView(we), ne === !0 && tt.setGlobalState(P.clippingPlanes, we), Se && Be.viewport(W.copy(Se)), ge.length > 0 && Er(ge, me, we), et.length > 0 && Er(et, me, we), at.length > 0 && Er(at, me, we), Be.buffers.depth.setTest(!0), Be.buffers.depth.setMask(!0), Be.buffers.color.setMask(!0), Be.setPolygonOffset(!1);
    }
    function Ya(q, me, we, Se) {
      if ((we.isScene === !0 ? we.overrideMaterial : null) !== null) return;
      w.state.transmissionRenderTarget[Se.id] === void 0 && (w.state.transmissionRenderTarget[Se.id] = new scope.WebGLRenderTarget(1, 1, {
        generateMipmaps: !0,
        type: Pe.has("EXT_color_buffer_half_float") || Pe.has("EXT_color_buffer_float") ? scope.HalfFloatType : scope.UnsignedByteType,
        minFilter: scope.LinearMipmapLinearFilter,
        samples: 4,
        stencilBuffer: o,
        resolveDepthBuffer: !1,
        resolveStencilBuffer: !1,
        colorSpace: scope.ColorManagement.workingColorSpace
      }));
      const et = w.state.transmissionRenderTarget[Se.id],
        at = Se.viewport || W;
      et.setSize(at.z * P.transmissionResolutionScale, at.w * P.transmissionResolutionScale);
      const pt = P.getRenderTarget(),
        lt = P.getActiveCubeFace(),
        yt = P.getActiveMipmapLevel();
      P.setRenderTarget(et), P.getClearColor(J), se = P.getClearAlpha(), se < 1 && P.setClearColor(16777215, .5), P.clear(), Fe && ft.render(we);
      const bt = P.toneMapping;
      P.toneMapping = scope.NoToneMapping;
      const At = Se.viewport;
      if (Se.viewport !== void 0 && (Se.viewport = void 0), w.setupLightsView(Se), ne === !0 && tt.setGlobalState(P.clippingPlanes, Se), Er(q, we, Se), Xe.updateMultisampleRenderTarget(et), Xe.updateRenderTargetMipmap(et), Pe.has("WEBGL_multisampled_render_to_texture") === !1) {
        let Ct = !1;
        for (let Bt = 0, zt = me.length; Bt < zt; Bt++) {
          const Ut = me[Bt],
            Dt = Ut.object,
            _t = Ut.geometry,
            Ot = Ut.material,
            Tt = Ut.group;
          if (Ot.side === scope.DoubleSide && Dt.layers.test(Se.layers)) {
            const ni = Ot.side;
            Ot.side = scope.BackSide, Ot.needsUpdate = !0, ja(Dt, we, Se, _t, Ot, Tt), Ot.side = ni, Ot.needsUpdate = !0, Ct = !0;
          }
        }
        Ct === !0 && (Xe.updateMultisampleRenderTarget(et), Xe.updateRenderTargetMipmap(et));
      }
      P.setRenderTarget(pt, lt, yt), P.setClearColor(J, se), At !== void 0 && (Se.viewport = At), P.toneMapping = bt;
    }
    function Er(q, me, we) {
      const Se = me.isScene === !0 ? me.overrideMaterial : null;
      for (let ge = 0, et = q.length; ge < et; ge++) {
        const at = q[ge],
          pt = at.object,
          lt = at.geometry,
          yt = at.group;
        let bt = at.material;
        bt.allowOverride === !0 && Se !== null && (bt = Se), pt.layers.test(we.layers) && ja(pt, me, we, lt, bt, yt);
      }
    }
    function ja(q, me, we, Se, ge, et) {
      q.onBeforeRender(P, me, we, Se, ge, et), q.modelViewMatrix.multiplyMatrices(we.matrixWorldInverse, q.matrixWorld), q.normalMatrix.getNormalMatrix(q.modelViewMatrix), ge.onBeforeRender(P, me, we, Se, q, et), ge.transparent === !0 && ge.side === scope.DoubleSide && ge.forceSinglePass === !1 ? (ge.side = scope.BackSide, ge.needsUpdate = !0, P.renderBufferDirect(we, me, Se, ge, q, et), ge.side = scope.FrontSide, ge.needsUpdate = !0, P.renderBufferDirect(we, me, Se, ge, q, et), ge.side = scope.DoubleSide) : P.renderBufferDirect(we, me, Se, ge, q, et), q.onAfterRender(P, me, we, Se, ge, et);
    }
    function Tr(q, me, we) {
      me.isScene !== !0 && (me = pe);
      const Se = Y.get(q),
        ge = w.state.lights,
        et = w.state.shadowsArray,
        at = ge.state.version,
        pt = Re.getParameters(q, ge.state, et, me, we),
        lt = Re.getProgramCacheKey(pt);
      let yt = Se.programs;
      Se.environment = q.isMeshStandardMaterial ? me.environment : null, Se.fog = me.fog, Se.envMap = (q.isMeshStandardMaterial ? St : vt).get(q.envMap || Se.environment), Se.envMapRotation = Se.environment !== null && q.envMap === null ? me.environmentRotation : q.envMapRotation, yt === void 0 && (scope.__lifecycle.listen(q, "dispose", ke), yt = new Map(), Se.programs = yt);
      let bt = yt.get(lt);
      if (bt !== void 0) {
        if (Se.currentProgram === bt && Se.lightsStateVersion === at) return Ja(q, pt), bt;
      } else pt.uniforms = Re.getUniforms(q), q.onBeforeCompile(pt, P), bt = Re.acquireProgram(pt, lt), yt.set(lt, bt), Se.uniforms = pt.uniforms;
      const At = Se.uniforms;
      return (!q.isShaderMaterial && !q.isRawShaderMaterial || q.clipping === !0) && (At.clippingPlanes = tt.uniform), Ja(q, pt), Se.needsLights = Po(q), Se.lightsStateVersion = at, Se.needsLights && (At.ambientLightColor.value = ge.state.ambient, At.lightProbe.value = ge.state.probe, At.directionalLights.value = ge.state.directional, At.directionalLightShadows.value = ge.state.directionalShadow, At.spotLights.value = ge.state.spot, At.spotLightShadows.value = ge.state.spotShadow, At.rectAreaLights.value = ge.state.rectArea, At.ltc_1.value = ge.state.rectAreaLTC1, At.ltc_2.value = ge.state.rectAreaLTC2, At.pointLights.value = ge.state.point, At.pointLightShadows.value = ge.state.pointShadow, At.hemisphereLights.value = ge.state.hemi, At.directionalShadowMap.value = ge.state.directionalShadowMap, At.directionalShadowMatrix.value = ge.state.directionalShadowMatrix, At.spotShadowMap.value = ge.state.spotShadowMap, At.spotLightMatrix.value = ge.state.spotLightMatrix, At.spotLightMap.value = ge.state.spotLightMap, At.pointShadowMap.value = ge.state.pointShadowMap, At.pointShadowMatrix.value = ge.state.pointShadowMatrix), Se.currentProgram = bt, Se.uniformsList = null, bt;
    }
    function Ka(q) {
      if (q.uniformsList === null) {
        const me = q.currentProgram.getUniforms();
        q.uniformsList = scope.WebGLUniforms.seqWithValue(me.seq, q.uniforms);
      }
      return q.uniformsList;
    }
    function Ja(q, me) {
      const we = Y.get(q);
      we.outputColorSpace = me.outputColorSpace, we.batching = me.batching, we.batchingColor = me.batchingColor, we.instancing = me.instancing, we.instancingColor = me.instancingColor, we.instancingMorph = me.instancingMorph, we.skinning = me.skinning, we.morphTargets = me.morphTargets, we.morphNormals = me.morphNormals, we.morphColors = me.morphColors, we.morphTargetsCount = me.morphTargetsCount, we.numClippingPlanes = me.numClippingPlanes, we.numIntersection = me.numClipIntersection, we.vertexAlphas = me.vertexAlphas, we.vertexTangents = me.vertexTangents, we.toneMapping = me.toneMapping;
    }
    function Do(q, me, we, Se, ge) {
      me.isScene !== !0 && (me = pe), Xe.resetTextureUnits();
      const et = me.fog,
        at = Se.isMeshStandardMaterial ? me.environment : null,
        pt = H === null ? P.outputColorSpace : H.isXRRenderTarget === !0 ? H.texture.colorSpace : scope.LinearSRGBColorSpace,
        lt = (Se.isMeshStandardMaterial ? St : vt).get(Se.envMap || at),
        yt = Se.vertexColors === !0 && !!we.attributes.color && we.attributes.color.itemSize === 4,
        bt = !!we.attributes.tangent && (!!Se.normalMap || Se.anisotropy > 0),
        At = !!we.morphAttributes.position,
        Ct = !!we.morphAttributes.normal,
        Bt = !!we.morphAttributes.color;
      let zt = scope.NoToneMapping;
      Se.toneMapped && (H === null || H.isXRRenderTarget === !0) && (zt = P.toneMapping);
      const Ut = we.morphAttributes.position || we.morphAttributes.normal || we.morphAttributes.color,
        Dt = Ut !== void 0 ? Ut.length : 0,
        _t = Y.get(Se),
        Ot = w.state.lights;
      if (ne === !0 && (z === !0 || q !== k)) {
        const Jt = q === k && Se.id === F;
        tt.setState(Se, q, Jt);
      }
      let Tt = !1;
      Se.version === _t.__version ? (_t.needsLights && _t.lightsStateVersion !== Ot.state.version || _t.outputColorSpace !== pt || ge.isBatchedMesh && _t.batching === !1 || !ge.isBatchedMesh && _t.batching === !0 || ge.isBatchedMesh && _t.batchingColor === !0 && ge.colorTexture === null || ge.isBatchedMesh && _t.batchingColor === !1 && ge.colorTexture !== null || ge.isInstancedMesh && _t.instancing === !1 || !ge.isInstancedMesh && _t.instancing === !0 || ge.isSkinnedMesh && _t.skinning === !1 || !ge.isSkinnedMesh && _t.skinning === !0 || ge.isInstancedMesh && _t.instancingColor === !0 && ge.instanceColor === null || ge.isInstancedMesh && _t.instancingColor === !1 && ge.instanceColor !== null || ge.isInstancedMesh && _t.instancingMorph === !0 && ge.morphTexture === null || ge.isInstancedMesh && _t.instancingMorph === !1 && ge.morphTexture !== null || _t.envMap !== lt || Se.fog === !0 && _t.fog !== et || _t.numClippingPlanes !== void 0 && (_t.numClippingPlanes !== tt.numPlanes || _t.numIntersection !== tt.numIntersection) || _t.vertexAlphas !== yt || _t.vertexTangents !== bt || _t.morphTargets !== At || _t.morphNormals !== Ct || _t.morphColors !== Bt || _t.toneMapping !== zt || _t.morphTargetsCount !== Dt) && (Tt = !0) : (Tt = !0, _t.__version = Se.version);
      let ni = _t.currentProgram;
      Tt === !0 && (ni = Tr(Se, me, ge));
      let Xn = !1,
        si = !1,
        xs = !1;
      const kt = ni.getUniforms(),
        pi = _t.uniforms;
      if (Be.useProgram(ni.program) && (Xn = !0, si = !0, xs = !0), Se.id !== F && (F = Se.id, si = !0), Xn || k !== q) {
        Be.buffers.depth.getReversed() && q.reversedDepth !== !0 && (q._reversedDepth = !0, q.updateProjectionMatrix()), kt.setValue(j, "projectionMatrix", q.projectionMatrix), kt.setValue(j, "viewMatrix", q.matrixWorldInverse);
        const ti = kt.map.cameraPosition;
        ti !== void 0 && ti.setValue(j, _e.setFromMatrixPosition(q.matrixWorld)), Oe.logarithmicDepthBuffer && kt.setValue(j, "logDepthBufFC", 2 / (Math.log(q.far + 1) / Math.LN2)), (Se.isMeshPhongMaterial || Se.isMeshToonMaterial || Se.isMeshLambertMaterial || Se.isMeshBasicMaterial || Se.isMeshStandardMaterial || Se.isShaderMaterial) && kt.setValue(j, "isOrthographic", q.isOrthographicCamera === !0), k !== q && (k = q, si = !0, xs = !0);
      }
      if (ge.isSkinnedMesh) {
        kt.setOptional(j, ge, "bindMatrix"), kt.setOptional(j, ge, "bindMatrixInverse");
        const Jt = ge.skeleton;
        Jt && (Jt.boneTexture === null && Jt.computeBoneTexture(), kt.setValue(j, "boneTexture", Jt.boneTexture, Xe));
      }
      ge.isBatchedMesh && (kt.setOptional(j, ge, "batchingTexture"), kt.setValue(j, "batchingTexture", ge._matricesTexture, Xe), kt.setOptional(j, ge, "batchingIdTexture"), kt.setValue(j, "batchingIdTexture", ge._indirectTexture, Xe), kt.setOptional(j, ge, "batchingColorTexture"), ge._colorsTexture !== null && kt.setValue(j, "batchingColorTexture", ge._colorsTexture, Xe));
      const mi = we.morphAttributes;
      if ((mi.position !== void 0 || mi.normal !== void 0 || mi.color !== void 0) && Ge.update(ge, we, ni), (si || _t.receiveShadow !== ge.receiveShadow) && (_t.receiveShadow = ge.receiveShadow, kt.setValue(j, "receiveShadow", ge.receiveShadow)), Se.isMeshGouraudMaterial && Se.envMap !== null && (pi.envMap.value = lt, pi.flipEnvMap.value = lt.isCubeTexture && lt.isRenderTargetTexture === !1 ? -1 : 1), Se.isMeshStandardMaterial && Se.envMap === null && me.environment !== null && (pi.envMapIntensity.value = me.environmentIntensity), si && (kt.setValue(j, "toneMappingExposure", P.toneMappingExposure), _t.needsLights && Ro(pi, xs), et && Se.fog === !0 && Ve.refreshFogUniforms(pi, et), Ve.refreshMaterialUniforms(pi, Se, ee, he, w.state.transmissionRenderTarget[q.id]), scope.WebGLUniforms.upload(j, Ka(_t), pi, Xe)), Se.isShaderMaterial && Se.uniformsNeedUpdate === !0 && (scope.WebGLUniforms.upload(j, Ka(_t), pi, Xe), Se.uniformsNeedUpdate = !1), Se.isSpriteMaterial && kt.setValue(j, "center", ge.center), kt.setValue(j, "modelViewMatrix", ge.modelViewMatrix), kt.setValue(j, "normalMatrix", ge.normalMatrix), kt.setValue(j, "modelMatrix", ge.matrixWorld), Se.isShaderMaterial || Se.isRawShaderMaterial) {
        const Jt = Se.uniformsGroups;
        for (let ti = 0, pa = Jt.length; ti < pa; ti++) {
          const bn = Jt[ti];
          $e.update(bn, ni), $e.bind(bn, ni);
        }
      }
      return ni;
    }
    function Ro(q, me) {
      q.ambientLightColor.needsUpdate = me, q.lightProbe.needsUpdate = me, q.directionalLights.needsUpdate = me, q.directionalLightShadows.needsUpdate = me, q.pointLights.needsUpdate = me, q.pointLightShadows.needsUpdate = me, q.spotLights.needsUpdate = me, q.spotLightShadows.needsUpdate = me, q.rectAreaLights.needsUpdate = me, q.hemisphereLights.needsUpdate = me;
    }
    function Po(q) {
      return q.isMeshLambertMaterial || q.isMeshToonMaterial || q.isMeshPhongMaterial || q.isMeshStandardMaterial || q.isShadowMaterial || q.isShaderMaterial && q.lights === !0;
    }
    this.getActiveCubeFace = function () {
      return O;
    }, this.getActiveMipmapLevel = function () {
      return N;
    }, this.getRenderTarget = function () {
      return H;
    }, this.setRenderTargetTextures = function (q, me, we) {
      const Se = Y.get(q);
      Se.__autoAllocateDepthBuffer = q.resolveDepthBuffer === !1, Se.__autoAllocateDepthBuffer === !1 && (Se.__useRenderToTexture = !1), Y.get(q.texture).__webglTexture = me, Y.get(q.depthTexture).__webglTexture = Se.__autoAllocateDepthBuffer ? void 0 : we, Se.__hasExternalTextures = !0;
    }, this.setRenderTargetFramebuffer = function (q, me) {
      const we = Y.get(q);
      we.__webglFramebuffer = me, we.__useDefaultFramebuffer = me === void 0;
    };
    const Lo = j.createFramebuffer();
    this.setRenderTarget = function (q, me = 0, we = 0) {
      H = q, O = me, N = we;
      let Se = !0,
        ge = null,
        et = !1,
        at = !1;
      if (q) {
        const lt = Y.get(q);
        if (lt.__useDefaultFramebuffer !== void 0) Be.bindFramebuffer(j.FRAMEBUFFER, null), Se = !1;else if (lt.__webglFramebuffer === void 0) Xe.setupRenderTarget(q);else if (lt.__hasExternalTextures) Xe.rebindTextures(q, Y.get(q.texture).__webglTexture, Y.get(q.depthTexture).__webglTexture);else if (q.depthBuffer) {
          const At = q.depthTexture;
          if (lt.__boundDepthTexture !== At) {
            if (At !== null && Y.has(At) && (q.width !== At.image.width || q.height !== At.image.height)) throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");
            Xe.setupDepthRenderbuffer(q);
          }
        }
        const yt = q.texture;
        (yt.isData3DTexture || yt.isDataArrayTexture || yt.isCompressedArrayTexture) && (at = !0);
        const bt = Y.get(q).__webglFramebuffer;
        q.isWebGLCubeRenderTarget ? (Array.isArray(bt[me]) ? ge = bt[me][we] : ge = bt[me], et = !0) : q.samples > 0 && Xe.useMultisampledRTT(q) === !1 ? ge = Y.get(q).__webglMultisampledFramebuffer : Array.isArray(bt) ? ge = bt[we] : ge = bt, W.copy(q.viewport), $.copy(q.scissor), Z = q.scissorTest;
      } else W.copy(Ue).multiplyScalar(ee).floor(), $.copy(nt).multiplyScalar(ee).floor(), Z = mt;
      if (we !== 0 && (ge = Lo), Be.bindFramebuffer(j.FRAMEBUFFER, ge) && Se && Be.drawBuffers(q, ge), Be.viewport(W), Be.scissor($), Be.setScissorTest(Z), et) {
        const lt = Y.get(q.texture);
        j.framebufferTexture2D(j.FRAMEBUFFER, j.COLOR_ATTACHMENT0, j.TEXTURE_CUBE_MAP_POSITIVE_X + me, lt.__webglTexture, we);
      } else if (at) {
        const lt = me;
        for (let yt = 0; yt < q.textures.length; yt++) {
          const bt = Y.get(q.textures[yt]);
          j.framebufferTextureLayer(j.FRAMEBUFFER, j.COLOR_ATTACHMENT0 + yt, bt.__webglTexture, we, lt);
        }
      } else if (q !== null && we !== 0) {
        const lt = Y.get(q.texture);
        j.framebufferTexture2D(j.FRAMEBUFFER, j.COLOR_ATTACHMENT0, j.TEXTURE_2D, lt.__webglTexture, we);
      }
      F = -1;
    }, this.readRenderTargetPixels = function (q, me, we, Se, ge, et, at, pt = 0) {
      if (!(q && q.isWebGLRenderTarget)) {
        console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
        return;
      }
      let lt = Y.get(q).__webglFramebuffer;
      if (q.isWebGLCubeRenderTarget && at !== void 0 && (lt = lt[at]), lt) {
        Be.bindFramebuffer(j.FRAMEBUFFER, lt);
        try {
          const yt = q.textures[pt],
            bt = yt.format,
            At = yt.type;
          if (!Oe.textureFormatReadable(bt)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");
            return;
          }
          if (!Oe.textureTypeReadable(At)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");
            return;
          }
          me >= 0 && me <= q.width - Se && we >= 0 && we <= q.height - ge && (q.textures.length > 1 && j.readBuffer(j.COLOR_ATTACHMENT0 + pt), j.readPixels(me, we, Se, ge, be.convert(bt), be.convert(At), et));
        } finally {
          const yt = H !== null ? Y.get(H).__webglFramebuffer : null;
          Be.bindFramebuffer(j.FRAMEBUFFER, yt);
        }
      }
    }, this.readRenderTargetPixelsAsync = async function (q, me, we, Se, ge, et, at, pt = 0) {
      if (!(q && q.isWebGLRenderTarget)) throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
      let lt = Y.get(q).__webglFramebuffer;
      if (q.isWebGLCubeRenderTarget && at !== void 0 && (lt = lt[at]), lt) if (me >= 0 && me <= q.width - Se && we >= 0 && we <= q.height - ge) {
        Be.bindFramebuffer(j.FRAMEBUFFER, lt);
        const yt = q.textures[pt],
          bt = yt.format,
          At = yt.type;
        if (!Oe.textureFormatReadable(bt)) throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");
        if (!Oe.textureTypeReadable(At)) throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");
        const Ct = j.createBuffer();
        j.bindBuffer(j.PIXEL_PACK_BUFFER, Ct), j.bufferData(j.PIXEL_PACK_BUFFER, et.byteLength, j.STREAM_READ), q.textures.length > 1 && j.readBuffer(j.COLOR_ATTACHMENT0 + pt), j.readPixels(me, we, Se, ge, be.convert(bt), be.convert(At), 0);
        const Bt = H !== null ? Y.get(H).__webglFramebuffer : null;
        Be.bindFramebuffer(j.FRAMEBUFFER, Bt);
        const zt = j.fenceSync(j.SYNC_GPU_COMMANDS_COMPLETE, 0);
        return j.flush(), await scope.probeAsync(j, zt, 4), j.bindBuffer(j.PIXEL_PACK_BUFFER, Ct), j.getBufferSubData(j.PIXEL_PACK_BUFFER, 0, et), j.deleteBuffer(Ct), j.deleteSync(zt), et;
      } else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.");
    }, this.copyFramebufferToTexture = function (q, me = null, we = 0) {
      const Se = Math.pow(2, -we),
        ge = Math.floor(q.image.width * Se),
        et = Math.floor(q.image.height * Se),
        at = me !== null ? me.x : 0,
        pt = me !== null ? me.y : 0;
      Xe.setTexture2D(q, 0), j.copyTexSubImage2D(j.TEXTURE_2D, we, 0, 0, at, pt, ge, et), Be.unbindTexture();
    };
    const Uo = j.createFramebuffer(),
      Fo = j.createFramebuffer();
    this.copyTextureToTexture = function (q, me, we = null, Se = null, ge = 0, et = null) {
      et === null && (ge !== 0 ? (scope.warnOnce("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."), et = ge, ge = 0) : et = 0);
      let at, pt, lt, yt, bt, At, Ct, Bt, zt;
      const Ut = q.isCompressedTexture ? q.mipmaps[et] : q.image;
      if (we !== null) at = we.max.x - we.min.x, pt = we.max.y - we.min.y, lt = we.isBox3 ? we.max.z - we.min.z : 1, yt = we.min.x, bt = we.min.y, At = we.isBox3 ? we.min.z : 0;else {
        const mi = Math.pow(2, -ge);
        at = Math.floor(Ut.width * mi), pt = Math.floor(Ut.height * mi), q.isDataArrayTexture ? lt = Ut.depth : q.isData3DTexture ? lt = Math.floor(Ut.depth * mi) : lt = 1, yt = 0, bt = 0, At = 0;
      }
      Se !== null ? (Ct = Se.x, Bt = Se.y, zt = Se.z) : (Ct = 0, Bt = 0, zt = 0);
      const Dt = be.convert(me.format),
        _t = be.convert(me.type);
      let Ot;
      me.isData3DTexture ? (Xe.setTexture3D(me, 0), Ot = j.TEXTURE_3D) : me.isDataArrayTexture || me.isCompressedArrayTexture ? (Xe.setTexture2DArray(me, 0), Ot = j.TEXTURE_2D_ARRAY) : (Xe.setTexture2D(me, 0), Ot = j.TEXTURE_2D), j.pixelStorei(j.UNPACK_FLIP_Y_WEBGL, me.flipY), j.pixelStorei(j.UNPACK_PREMULTIPLY_ALPHA_WEBGL, me.premultiplyAlpha), j.pixelStorei(j.UNPACK_ALIGNMENT, me.unpackAlignment);
      const Tt = j.getParameter(j.UNPACK_ROW_LENGTH),
        ni = j.getParameter(j.UNPACK_IMAGE_HEIGHT),
        Xn = j.getParameter(j.UNPACK_SKIP_PIXELS),
        si = j.getParameter(j.UNPACK_SKIP_ROWS),
        xs = j.getParameter(j.UNPACK_SKIP_IMAGES);
      j.pixelStorei(j.UNPACK_ROW_LENGTH, Ut.width), j.pixelStorei(j.UNPACK_IMAGE_HEIGHT, Ut.height), j.pixelStorei(j.UNPACK_SKIP_PIXELS, yt), j.pixelStorei(j.UNPACK_SKIP_ROWS, bt), j.pixelStorei(j.UNPACK_SKIP_IMAGES, At);
      const kt = q.isDataArrayTexture || q.isData3DTexture,
        pi = me.isDataArrayTexture || me.isData3DTexture;
      if (q.isDepthTexture) {
        const mi = Y.get(q),
          Jt = Y.get(me),
          ti = Y.get(mi.__renderTarget),
          pa = Y.get(Jt.__renderTarget);
        Be.bindFramebuffer(j.READ_FRAMEBUFFER, ti.__webglFramebuffer), Be.bindFramebuffer(j.DRAW_FRAMEBUFFER, pa.__webglFramebuffer);
        for (let bn = 0; bn < lt; bn++) kt && (j.framebufferTextureLayer(j.READ_FRAMEBUFFER, j.COLOR_ATTACHMENT0, Y.get(q).__webglTexture, ge, At + bn), j.framebufferTextureLayer(j.DRAW_FRAMEBUFFER, j.COLOR_ATTACHMENT0, Y.get(me).__webglTexture, et, zt + bn)), j.blitFramebuffer(yt, bt, at, pt, Ct, Bt, at, pt, j.DEPTH_BUFFER_BIT, j.NEAREST);
        Be.bindFramebuffer(j.READ_FRAMEBUFFER, null), Be.bindFramebuffer(j.DRAW_FRAMEBUFFER, null);
      } else if (ge !== 0 || q.isRenderTargetTexture || Y.has(q)) {
        const mi = Y.get(q),
          Jt = Y.get(me);
        Be.bindFramebuffer(j.READ_FRAMEBUFFER, Uo), Be.bindFramebuffer(j.DRAW_FRAMEBUFFER, Fo);
        for (let ti = 0; ti < lt; ti++) kt ? j.framebufferTextureLayer(j.READ_FRAMEBUFFER, j.COLOR_ATTACHMENT0, mi.__webglTexture, ge, At + ti) : j.framebufferTexture2D(j.READ_FRAMEBUFFER, j.COLOR_ATTACHMENT0, j.TEXTURE_2D, mi.__webglTexture, ge), pi ? j.framebufferTextureLayer(j.DRAW_FRAMEBUFFER, j.COLOR_ATTACHMENT0, Jt.__webglTexture, et, zt + ti) : j.framebufferTexture2D(j.DRAW_FRAMEBUFFER, j.COLOR_ATTACHMENT0, j.TEXTURE_2D, Jt.__webglTexture, et), ge !== 0 ? j.blitFramebuffer(yt, bt, at, pt, Ct, Bt, at, pt, j.COLOR_BUFFER_BIT, j.NEAREST) : pi ? j.copyTexSubImage3D(Ot, et, Ct, Bt, zt + ti, yt, bt, at, pt) : j.copyTexSubImage2D(Ot, et, Ct, Bt, yt, bt, at, pt);
        Be.bindFramebuffer(j.READ_FRAMEBUFFER, null), Be.bindFramebuffer(j.DRAW_FRAMEBUFFER, null);
      } else pi ? q.isDataTexture || q.isData3DTexture ? j.texSubImage3D(Ot, et, Ct, Bt, zt, at, pt, lt, Dt, _t, Ut.data) : me.isCompressedArrayTexture ? j.compressedTexSubImage3D(Ot, et, Ct, Bt, zt, at, pt, lt, Dt, Ut.data) : j.texSubImage3D(Ot, et, Ct, Bt, zt, at, pt, lt, Dt, _t, Ut) : q.isDataTexture ? j.texSubImage2D(j.TEXTURE_2D, et, Ct, Bt, at, pt, Dt, _t, Ut.data) : q.isCompressedTexture ? j.compressedTexSubImage2D(j.TEXTURE_2D, et, Ct, Bt, Ut.width, Ut.height, Dt, Ut.data) : j.texSubImage2D(j.TEXTURE_2D, et, Ct, Bt, at, pt, Dt, _t, Ut);
      j.pixelStorei(j.UNPACK_ROW_LENGTH, Tt), j.pixelStorei(j.UNPACK_IMAGE_HEIGHT, ni), j.pixelStorei(j.UNPACK_SKIP_PIXELS, Xn), j.pixelStorei(j.UNPACK_SKIP_ROWS, si), j.pixelStorei(j.UNPACK_SKIP_IMAGES, xs), et === 0 && me.generateMipmaps && j.generateMipmap(Ot), Be.unbindTexture();
    }, this.initRenderTarget = function (q) {
      Y.get(q).__webglFramebuffer === void 0 && Xe.setupRenderTarget(q);
    }, this.initTexture = function (q) {
      q.isCubeTexture ? Xe.setTextureCube(q, 0) : q.isData3DTexture ? Xe.setTexture3D(q, 0) : q.isDataArrayTexture || q.isCompressedArrayTexture ? Xe.setTexture2DArray(q, 0) : Xe.setTexture2D(q, 0), Be.unbindTexture();
    }, this.resetState = function () {
      O = 0, N = 0, H = null, Be.reset(), Ce.reset();
    }, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", {
      detail: this
    }));
  }
  get coordinateSystem() {
    return scope.WebGLCoordinateSystem;
  }
  get outputColorSpace() {
    return this._outputColorSpace;
  }
  set outputColorSpace(e) {
    this._outputColorSpace = e;
    const i = this.getContext();
    i.drawingBufferColorSpace = scope.ColorManagement._getDrawingBufferColorSpace(e), i.unpackColorSpace = scope.ColorManagement._getUnpackColorSpace();
  }
};
}
