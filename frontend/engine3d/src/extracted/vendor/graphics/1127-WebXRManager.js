/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 619926:628737.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1127(scope) {
scope.WebXRManager = class WebXRManager extends scope.EventDispatcher {
  constructor(e, i) {
    super();
    const s = this;
    let a = null,
      o = 1,
      l = null,
      c = "local-floor",
      h = 1,
      d = null,
      p = null,
      f = null,
      _ = null,
      x = null,
      b = null;
    const T = typeof XRWebGLBinding < "u",
      M = new scope.WebXRDepthSensing(),
      w = {},
      D = i.getContextAttributes();
    let R = null,
      P = null;
    const U = [],
      O = [],
      N = new scope.Vector2();
    let H = null;
    const F = new scope.PerspectiveCamera();
    F.viewport = new scope.Vector4();
    const k = new scope.PerspectiveCamera();
    k.viewport = new scope.Vector4();
    const W = [F, k],
      $ = new scope.ArrayCamera();
    let Z = null,
      J = null;
    this.cameraAutoUpdate = !0, this.enabled = !1, this.isPresenting = !1, this.getController = function (z) {
      let V = U[z];
      return V === void 0 && (V = new scope.WebXRController(), U[z] = V), V.getTargetRaySpace();
    }, this.getControllerGrip = function (z) {
      let V = U[z];
      return V === void 0 && (V = new scope.WebXRController(), U[z] = V), V.getGripSpace();
    }, this.getHand = function (z) {
      let V = U[z];
      return V === void 0 && (V = new scope.WebXRController(), U[z] = V), V.getHandSpace();
    };
    function se(z) {
      const V = O.indexOf(z.inputSource);
      if (V === -1) return;
      const _e = U[V];
      _e !== void 0 && (_e.update(z.inputSource, z.frame, d || l), _e.dispatchEvent({
        type: z.type,
        data: z.inputSource
      }));
    }
    function re() {
      scope.__lifecycle.unlisten(a, "select", se), scope.__lifecycle.unlisten(a, "selectstart", se), scope.__lifecycle.unlisten(a, "selectend", se), scope.__lifecycle.unlisten(a, "squeeze", se), scope.__lifecycle.unlisten(a, "squeezestart", se), scope.__lifecycle.unlisten(a, "squeezeend", se), scope.__lifecycle.unlisten(a, "end", re), scope.__lifecycle.unlisten(a, "inputsourceschange", he);
      for (let z = 0; z < U.length; z++) {
        const V = O[z];
        V !== null && (O[z] = null, U[z].disconnect(V));
      }
      Z = null, J = null, M.reset();
      for (const z in w) delete w[z];
      e.setRenderTarget(R), x = null, _ = null, f = null, a = null, P = null, ne.stop(), s.isPresenting = !1, e.setPixelRatio(H), e.setSize(N.width, N.height, !1), s.dispatchEvent({
        type: "sessionend"
      });
    }
    this.setFramebufferScaleFactor = function (z) {
      o = z, s.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.");
    }, this.setReferenceSpaceType = function (z) {
      c = z, s.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.");
    }, this.getReferenceSpace = function () {
      return d || l;
    }, this.setReferenceSpace = function (z) {
      d = z;
    }, this.getBaseLayer = function () {
      return _ !== null ? _ : x;
    }, this.getBinding = function () {
      return f === null && T && (f = new XRWebGLBinding(a, i)), f;
    }, this.getFrame = function () {
      return b;
    }, this.getSession = function () {
      return a;
    }, this.setSession = async function (z) {
      if (a = z, a !== null) {
        if (R = e.getRenderTarget(), scope.__lifecycle.listen(a, "select", se), scope.__lifecycle.listen(a, "selectstart", se), scope.__lifecycle.listen(a, "selectend", se), scope.__lifecycle.listen(a, "squeeze", se), scope.__lifecycle.listen(a, "squeezestart", se), scope.__lifecycle.listen(a, "squeezeend", se), scope.__lifecycle.listen(a, "end", re), scope.__lifecycle.listen(a, "inputsourceschange", he), D.xrCompatible !== !0 && (await i.makeXRCompatible()), H = e.getPixelRatio(), e.getSize(N), T && "createProjectionLayer" in XRWebGLBinding.prototype) {
          let _e = null,
            Le = null,
            pe = null;
          D.depth && (pe = D.stencil ? i.DEPTH24_STENCIL8 : i.DEPTH_COMPONENT24, _e = D.stencil ? scope.DepthStencilFormat : scope.DepthFormat, Le = D.stencil ? scope.UnsignedInt248Type : scope.UnsignedIntType);
          const Fe = {
            colorFormat: i.RGBA8,
            depthFormat: pe,
            scaleFactor: o
          };
          f = this.getBinding(), _ = f.createProjectionLayer(Fe), a.updateRenderState({
            layers: [_]
          }), e.setPixelRatio(1), e.setSize(_.textureWidth, _.textureHeight, !1), P = new scope.WebGLRenderTarget(_.textureWidth, _.textureHeight, {
            format: scope.RGBAFormat,
            type: scope.UnsignedByteType,
            depthTexture: new scope.DepthTexture(_.textureWidth, _.textureHeight, Le, void 0, void 0, void 0, void 0, void 0, void 0, _e),
            stencilBuffer: D.stencil,
            colorSpace: e.outputColorSpace,
            samples: D.antialias ? 4 : 0,
            resolveDepthBuffer: _.ignoreDepthValues === !1,
            resolveStencilBuffer: _.ignoreDepthValues === !1
          });
        } else {
          const _e = {
            antialias: D.antialias,
            alpha: !0,
            depth: D.depth,
            stencil: D.stencil,
            framebufferScaleFactor: o
          };
          x = new XRWebGLLayer(a, i, _e), a.updateRenderState({
            baseLayer: x
          }), e.setPixelRatio(1), e.setSize(x.framebufferWidth, x.framebufferHeight, !1), P = new scope.WebGLRenderTarget(x.framebufferWidth, x.framebufferHeight, {
            format: scope.RGBAFormat,
            type: scope.UnsignedByteType,
            colorSpace: e.outputColorSpace,
            stencilBuffer: D.stencil,
            resolveDepthBuffer: x.ignoreDepthValues === !1,
            resolveStencilBuffer: x.ignoreDepthValues === !1
          });
        }
        P.isXRRenderTarget = !0, this.setFoveation(h), d = null, l = await a.requestReferenceSpace(c), ne.setContext(a), ne.start(), s.isPresenting = !0, s.dispatchEvent({
          type: "sessionstart"
        });
      }
    }, this.getEnvironmentBlendMode = function () {
      if (a !== null) return a.environmentBlendMode;
    }, this.getDepthTexture = function () {
      return M.getDepthTexture();
    };
    function he(z) {
      for (let V = 0; V < z.removed.length; V++) {
        const _e = z.removed[V],
          Le = O.indexOf(_e);
        Le >= 0 && (O[Le] = null, U[Le].disconnect(_e));
      }
      for (let V = 0; V < z.added.length; V++) {
        const _e = z.added[V];
        let Le = O.indexOf(_e);
        if (Le === -1) {
          for (let Fe = 0; Fe < U.length; Fe++) if (Fe >= O.length) {
            O.push(_e), Le = Fe;
            break;
          } else if (O[Fe] === null) {
            O[Fe] = _e, Le = Fe;
            break;
          }
          if (Le === -1) break;
        }
        const pe = U[Le];
        pe && pe.connect(_e);
      }
    }
    const ee = new scope.Vector3(),
      Ie = new scope.Vector3();
    function Te(z, V, _e) {
      ee.setFromMatrixPosition(V.matrixWorld), Ie.setFromMatrixPosition(_e.matrixWorld);
      const Le = ee.distanceTo(Ie),
        pe = V.projectionMatrix.elements,
        Fe = _e.projectionMatrix.elements,
        st = pe[14] / (pe[10] - 1),
        j = pe[14] / (pe[10] + 1),
        De = (pe[9] + 1) / pe[5],
        Pe = (pe[9] - 1) / pe[5],
        Oe = (pe[8] - 1) / pe[0],
        Be = (Fe[8] + 1) / Fe[0],
        le = st * Oe,
        Y = st * Be,
        Xe = Le / (-Oe + Be),
        vt = Xe * -Oe;
      if (V.matrixWorld.decompose(z.position, z.quaternion, z.scale), z.translateX(vt), z.translateZ(Xe), z.matrixWorld.compose(z.position, z.quaternion, z.scale), z.matrixWorldInverse.copy(z.matrixWorld).invert(), pe[10] === -1) z.projectionMatrix.copy(V.projectionMatrix), z.projectionMatrixInverse.copy(V.projectionMatrixInverse);else {
        const St = st + Xe,
          K = j + Xe,
          G = le - vt,
          fe = Y + (Le - vt),
          Re = De * j / K * St,
          Ve = Pe * j / K * St;
        z.projectionMatrix.makePerspective(G, fe, Re, Ve, St, K), z.projectionMatrixInverse.copy(z.projectionMatrix).invert();
      }
    }
    function Ue(z, V) {
      V === null ? z.matrixWorld.copy(z.matrix) : z.matrixWorld.multiplyMatrices(V.matrixWorld, z.matrix), z.matrixWorldInverse.copy(z.matrixWorld).invert();
    }
    this.updateCamera = function (z) {
      if (a === null) return;
      let V = z.near,
        _e = z.far;
      M.texture !== null && (M.depthNear > 0 && (V = M.depthNear), M.depthFar > 0 && (_e = M.depthFar)), $.near = k.near = F.near = V, $.far = k.far = F.far = _e, (Z !== $.near || J !== $.far) && (a.updateRenderState({
        depthNear: $.near,
        depthFar: $.far
      }), Z = $.near, J = $.far), $.layers.mask = z.layers.mask | 6, F.layers.mask = $.layers.mask & 3, k.layers.mask = $.layers.mask & 5;
      const Le = z.parent,
        pe = $.cameras;
      Ue($, Le);
      for (let Fe = 0; Fe < pe.length; Fe++) Ue(pe[Fe], Le);
      pe.length === 2 ? Te($, F, k) : $.projectionMatrix.copy(F.projectionMatrix), nt(z, $, Le);
    };
    function nt(z, V, _e) {
      _e === null ? z.matrix.copy(V.matrixWorld) : (z.matrix.copy(_e.matrixWorld), z.matrix.invert(), z.matrix.multiply(V.matrixWorld)), z.matrix.decompose(z.position, z.quaternion, z.scale), z.updateMatrixWorld(!0), z.projectionMatrix.copy(V.projectionMatrix), z.projectionMatrixInverse.copy(V.projectionMatrixInverse), z.isPerspectiveCamera && (z.fov = scope.RAD2DEG * 2 * Math.atan(1 / z.projectionMatrix.elements[5]), z.zoom = 1);
    }
    this.getCamera = function () {
      return $;
    }, this.getFoveation = function () {
      if (!(_ === null && x === null)) return h;
    }, this.setFoveation = function (z) {
      h = z, _ !== null && (_.fixedFoveation = z), x !== null && x.fixedFoveation !== void 0 && (x.fixedFoveation = z);
    }, this.hasDepthSensing = function () {
      return M.texture !== null;
    }, this.getDepthSensingMesh = function () {
      return M.getMesh($);
    }, this.getCameraTexture = function (z) {
      return w[z];
    };
    let mt = null;
    function ve(z, V) {
      if (p = V.getViewerPose(d || l), b = V, p !== null) {
        const _e = p.views;
        x !== null && (e.setRenderTargetFramebuffer(P, x.framebuffer), e.setRenderTarget(P));
        let Le = !1;
        _e.length !== $.cameras.length && ($.cameras.length = 0, Le = !0);
        for (let j = 0; j < _e.length; j++) {
          const De = _e[j];
          let Pe = null;
          if (x !== null) Pe = x.getViewport(De);else {
            const Be = f.getViewSubImage(_, De);
            Pe = Be.viewport, j === 0 && (e.setRenderTargetTextures(P, Be.colorTexture, Be.depthStencilTexture), e.setRenderTarget(P));
          }
          let Oe = W[j];
          Oe === void 0 && (Oe = new scope.PerspectiveCamera(), Oe.layers.enable(j), Oe.viewport = new scope.Vector4(), W[j] = Oe), Oe.matrix.fromArray(De.transform.matrix), Oe.matrix.decompose(Oe.position, Oe.quaternion, Oe.scale), Oe.projectionMatrix.fromArray(De.projectionMatrix), Oe.projectionMatrixInverse.copy(Oe.projectionMatrix).invert(), Oe.viewport.set(Pe.x, Pe.y, Pe.width, Pe.height), j === 0 && ($.matrix.copy(Oe.matrix), $.matrix.decompose($.position, $.quaternion, $.scale)), Le === !0 && $.cameras.push(Oe);
        }
        const pe = a.enabledFeatures;
        if (pe && pe.includes("depth-sensing") && a.depthUsage == "gpu-optimized" && T) {
          f = s.getBinding();
          const j = f.getDepthInformation(_e[0]);
          j && j.isValid && j.texture && M.init(j, a.renderState);
        }
        if (pe && pe.includes("camera-access") && T) {
          e.state.unbindTexture(), f = s.getBinding();
          for (let j = 0; j < _e.length; j++) {
            const De = _e[j].camera;
            if (De) {
              let Pe = w[De];
              Pe || (Pe = new scope.ExternalTexture(), w[De] = Pe);
              const Oe = f.getCameraImage(De);
              Pe.sourceTexture = Oe;
            }
          }
        }
      }
      for (let _e = 0; _e < U.length; _e++) {
        const Le = O[_e],
          pe = U[_e];
        Le !== null && pe !== void 0 && pe.update(Le, V, d || l);
      }
      mt && mt(z, V), V.detectedPlanes && s.dispatchEvent({
        type: "planesdetected",
        data: V
      }), b = null;
    }
    const ne = new scope.WebGLAnimation();
    ne.setAnimationLoop(ve), this.setAnimationLoop = function (z) {
      mt = z;
    }, this.dispose = function () {};
  }
};
}
