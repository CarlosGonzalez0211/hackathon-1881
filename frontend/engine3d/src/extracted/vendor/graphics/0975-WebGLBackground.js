/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 483718:487121.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0975(scope) {
scope.WebGLBackground = function WebGLBackground(r, e, i, s, a, o, l) {
  const c = new scope.Color(0);
  let h = o === !0 ? 0 : 1,
    d,
    p,
    f = null,
    _ = 0,
    x = null;
  function b(R) {
    let P = R.isScene === !0 ? R.background : null;
    return P && P.isTexture && (P = (R.backgroundBlurriness > 0 ? i : e).get(P)), P;
  }
  function T(R) {
    let P = !1;
    const U = b(R);
    U === null ? w(c, h) : U && U.isColor && (w(U, 1), P = !0);
    const O = r.xr.getEnvironmentBlendMode();
    O === "additive" ? s.buffers.color.setClear(0, 0, 0, 1, l) : O === "alpha-blend" && s.buffers.color.setClear(0, 0, 0, 0, l), (r.autoClear || P) && (s.buffers.depth.setTest(!0), s.buffers.depth.setMask(!0), s.buffers.color.setMask(!0), r.clear(r.autoClearColor, r.autoClearDepth, r.autoClearStencil));
  }
  function M(R, P) {
    const U = b(P);
    U && (U.isCubeTexture || U.mapping === scope.CubeUVReflectionMapping) ? (p === void 0 && (p = new scope.Mesh(new scope.BoxGeometry(1, 1, 1), new scope.ShaderMaterial({
      name: "BackgroundCubeMaterial",
      uniforms: scope.cloneUniforms(scope.ShaderLib.backgroundCube.uniforms),
      vertexShader: scope.ShaderLib.backgroundCube.vertexShader,
      fragmentShader: scope.ShaderLib.backgroundCube.fragmentShader,
      side: scope.BackSide,
      depthTest: !1,
      depthWrite: !1,
      fog: !1,
      allowOverride: !1
    })), p.geometry.deleteAttribute("normal"), p.geometry.deleteAttribute("uv"), p.onBeforeRender = function (O, N, H) {
      this.matrixWorld.copyPosition(H.matrixWorld);
    }, Object.defineProperty(p.material, "envMap", {
      get: function () {
        return this.uniforms.envMap.value;
      }
    }), a.update(p)), scope._e1$1.copy(P.backgroundRotation), scope._e1$1.x *= -1, scope._e1$1.y *= -1, scope._e1$1.z *= -1, U.isCubeTexture && U.isRenderTargetTexture === !1 && (scope._e1$1.y *= -1, scope._e1$1.z *= -1), p.material.uniforms.envMap.value = U, p.material.uniforms.flipEnvMap.value = U.isCubeTexture && U.isRenderTargetTexture === !1 ? -1 : 1, p.material.uniforms.backgroundBlurriness.value = P.backgroundBlurriness, p.material.uniforms.backgroundIntensity.value = P.backgroundIntensity, p.material.uniforms.backgroundRotation.value.setFromMatrix4(scope._m1$1.makeRotationFromEuler(scope._e1$1)), p.material.toneMapped = scope.ColorManagement.getTransfer(U.colorSpace) !== scope.SRGBTransfer, (f !== U || _ !== U.version || x !== r.toneMapping) && (p.material.needsUpdate = !0, f = U, _ = U.version, x = r.toneMapping), p.layers.enableAll(), R.unshift(p, p.geometry, p.material, 0, 0, null)) : U && U.isTexture && (d === void 0 && (d = new scope.Mesh(new scope.PlaneGeometry(2, 2), new scope.ShaderMaterial({
      name: "BackgroundMaterial",
      uniforms: scope.cloneUniforms(scope.ShaderLib.background.uniforms),
      vertexShader: scope.ShaderLib.background.vertexShader,
      fragmentShader: scope.ShaderLib.background.fragmentShader,
      side: scope.FrontSide,
      depthTest: !1,
      depthWrite: !1,
      fog: !1,
      allowOverride: !1
    })), d.geometry.deleteAttribute("normal"), Object.defineProperty(d.material, "map", {
      get: function () {
        return this.uniforms.t2D.value;
      }
    }), a.update(d)), d.material.uniforms.t2D.value = U, d.material.uniforms.backgroundIntensity.value = P.backgroundIntensity, d.material.toneMapped = scope.ColorManagement.getTransfer(U.colorSpace) !== scope.SRGBTransfer, U.matrixAutoUpdate === !0 && U.updateMatrix(), d.material.uniforms.uvTransform.value.copy(U.matrix), (f !== U || _ !== U.version || x !== r.toneMapping) && (d.material.needsUpdate = !0, f = U, _ = U.version, x = r.toneMapping), d.layers.enableAll(), R.unshift(d, d.geometry, d.material, 0, 0, null));
  }
  function w(R, P) {
    R.getRGB(scope._rgb, scope.getUnlitUniformColorSpace(r)), s.buffers.color.setClear(scope._rgb.r, scope._rgb.g, scope._rgb.b, P, l);
  }
  function D() {
    p !== void 0 && (p.geometry.dispose(), p.material.dispose(), p = void 0), d !== void 0 && (d.geometry.dispose(), d.material.dispose(), d = void 0);
  }
  return {
    getClearColor: function () {
      return c;
    },
    setClearColor: function (R, P = 1) {
      c.set(R), h = P, w(c, h);
    },
    getClearAlpha: function () {
      return h;
    },
    setClearAlpha: function (R) {
      h = R, w(c, h);
    },
    render: T,
    addToRenderList: M,
    dispose: D
  };
};
}
