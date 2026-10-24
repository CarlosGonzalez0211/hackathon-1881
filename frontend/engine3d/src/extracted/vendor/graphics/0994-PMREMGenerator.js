/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 496868:502998.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0994(scope) {
scope.PMREMGenerator = class PMREMGenerator {
  constructor(e) {
    this._renderer = e, this._pingPongRenderTarget = null, this._lodMax = 0, this._cubeSize = 0, this._lodPlanes = [], this._sizeLods = [], this._sigmas = [], this._blurMaterial = null, this._cubemapMaterial = null, this._equirectMaterial = null, this._compileMaterial(this._blurMaterial);
  }
  fromScene(e, i = 0, s = .1, a = 100, o = {}) {
    const {
      size: l = 256,
      position: c = scope._origin
    } = o;
    scope._oldTarget = this._renderer.getRenderTarget(), scope._oldActiveCubeFace = this._renderer.getActiveCubeFace(), scope._oldActiveMipmapLevel = this._renderer.getActiveMipmapLevel(), scope._oldXrEnabled = this._renderer.xr.enabled, this._renderer.xr.enabled = !1, this._setSize(l);
    const h = this._allocateTargets();
    return h.depthBuffer = !0, this._sceneToCubeUV(e, s, a, h, c), i > 0 && this._blur(h, 0, 0, i), this._applyPMREM(h), this._cleanup(h), h;
  }
  fromEquirectangular(e, i = null) {
    return this._fromTexture(e, i);
  }
  fromCubemap(e, i = null) {
    return this._fromTexture(e, i);
  }
  compileCubemapShader() {
    this._cubemapMaterial === null && (this._cubemapMaterial = scope._getCubemapMaterial(), this._compileMaterial(this._cubemapMaterial));
  }
  compileEquirectangularShader() {
    this._equirectMaterial === null && (this._equirectMaterial = scope._getEquirectMaterial(), this._compileMaterial(this._equirectMaterial));
  }
  dispose() {
    this._dispose(), this._cubemapMaterial !== null && this._cubemapMaterial.dispose(), this._equirectMaterial !== null && this._equirectMaterial.dispose();
  }
  _setSize(e) {
    this._lodMax = Math.floor(Math.log2(e)), this._cubeSize = Math.pow(2, this._lodMax);
  }
  _dispose() {
    this._blurMaterial !== null && this._blurMaterial.dispose(), this._pingPongRenderTarget !== null && this._pingPongRenderTarget.dispose();
    for (let e = 0; e < this._lodPlanes.length; e++) this._lodPlanes[e].dispose();
  }
  _cleanup(e) {
    this._renderer.setRenderTarget(scope._oldTarget, scope._oldActiveCubeFace, scope._oldActiveMipmapLevel), this._renderer.xr.enabled = scope._oldXrEnabled, e.scissorTest = !1, scope._setViewport(e, 0, 0, e.width, e.height);
  }
  _fromTexture(e, i) {
    e.mapping === scope.CubeReflectionMapping || e.mapping === scope.CubeRefractionMapping ? this._setSize(e.image.length === 0 ? 16 : e.image[0].width || e.image[0].image.width) : this._setSize(e.image.width / 4), scope._oldTarget = this._renderer.getRenderTarget(), scope._oldActiveCubeFace = this._renderer.getActiveCubeFace(), scope._oldActiveMipmapLevel = this._renderer.getActiveMipmapLevel(), scope._oldXrEnabled = this._renderer.xr.enabled, this._renderer.xr.enabled = !1;
    const s = i || this._allocateTargets();
    return this._textureToCubeUV(e, s), this._applyPMREM(s), this._cleanup(s), s;
  }
  _allocateTargets() {
    const e = 3 * Math.max(this._cubeSize, 112),
      i = 4 * this._cubeSize,
      s = {
        magFilter: scope.LinearFilter,
        minFilter: scope.LinearFilter,
        generateMipmaps: !1,
        type: scope.HalfFloatType,
        format: scope.RGBAFormat,
        colorSpace: scope.LinearSRGBColorSpace,
        depthBuffer: !1
      },
      a = scope._createRenderTarget(e, i, s);
    if (this._pingPongRenderTarget === null || this._pingPongRenderTarget.width !== e || this._pingPongRenderTarget.height !== i) {
      this._pingPongRenderTarget !== null && this._dispose(), this._pingPongRenderTarget = scope._createRenderTarget(e, i, s);
      const {
        _lodMax: o
      } = this;
      ({
        sizeLods: this._sizeLods,
        lodPlanes: this._lodPlanes,
        sigmas: this._sigmas
      } = scope._createPlanes(o)), this._blurMaterial = scope._getBlurShader(o, e, i);
    }
    return a;
  }
  _compileMaterial(e) {
    const i = new scope.Mesh(this._lodPlanes[0], e);
    this._renderer.compile(i, scope._flatCamera);
  }
  _sceneToCubeUV(e, i, s, a, o) {
    const h = new scope.PerspectiveCamera(90, 1, i, s),
      d = [1, -1, 1, 1, 1, 1],
      p = [1, 1, 1, -1, -1, -1],
      f = this._renderer,
      _ = f.autoClear,
      x = f.toneMapping;
    f.getClearColor(scope._clearColor$1), f.toneMapping = scope.NoToneMapping, f.autoClear = !1, f.state.buffers.depth.getReversed() && (f.setRenderTarget(a), f.clearDepth(), f.setRenderTarget(null));
    const T = new scope.MeshBasicMaterial({
        name: "PMREM.Background",
        side: scope.BackSide,
        depthWrite: !1,
        depthTest: !1
      }),
      M = new scope.Mesh(new scope.BoxGeometry(), T);
    let w = !1;
    const D = e.background;
    D ? D.isColor && (T.color.copy(D), e.background = null, w = !0) : (T.color.copy(scope._clearColor$1), w = !0);
    for (let R = 0; R < 6; R++) {
      const P = R % 3;
      P === 0 ? (h.up.set(0, d[R], 0), h.position.set(o.x, o.y, o.z), h.lookAt(o.x + p[R], o.y, o.z)) : P === 1 ? (h.up.set(0, 0, d[R]), h.position.set(o.x, o.y, o.z), h.lookAt(o.x, o.y + p[R], o.z)) : (h.up.set(0, d[R], 0), h.position.set(o.x, o.y, o.z), h.lookAt(o.x, o.y, o.z + p[R]));
      const U = this._cubeSize;
      scope._setViewport(a, P * U, R > 2 ? U : 0, U, U), f.setRenderTarget(a), w && f.render(M, h), f.render(e, h);
    }
    M.geometry.dispose(), M.material.dispose(), f.toneMapping = x, f.autoClear = _, e.background = D;
  }
  _textureToCubeUV(e, i) {
    const s = this._renderer,
      a = e.mapping === scope.CubeReflectionMapping || e.mapping === scope.CubeRefractionMapping;
    a ? (this._cubemapMaterial === null && (this._cubemapMaterial = scope._getCubemapMaterial()), this._cubemapMaterial.uniforms.flipEnvMap.value = e.isRenderTargetTexture === !1 ? -1 : 1) : this._equirectMaterial === null && (this._equirectMaterial = scope._getEquirectMaterial());
    const o = a ? this._cubemapMaterial : this._equirectMaterial,
      l = new scope.Mesh(this._lodPlanes[0], o),
      c = o.uniforms;
    c.envMap.value = e;
    const h = this._cubeSize;
    scope._setViewport(i, 0, 0, 3 * h, 2 * h), s.setRenderTarget(i), s.render(l, scope._flatCamera);
  }
  _applyPMREM(e) {
    const i = this._renderer,
      s = i.autoClear;
    i.autoClear = !1;
    const a = this._lodPlanes.length;
    for (let o = 1; o < a; o++) {
      const l = Math.sqrt(this._sigmas[o] * this._sigmas[o] - this._sigmas[o - 1] * this._sigmas[o - 1]),
        c = scope._axisDirections[(a - o - 1) % scope._axisDirections.length];
      this._blur(e, o - 1, o, l, c);
    }
    i.autoClear = s;
  }
  _blur(e, i, s, a, o) {
    const l = this._pingPongRenderTarget;
    this._halfBlur(e, l, i, s, a, "latitudinal", o), this._halfBlur(l, e, s, s, a, "longitudinal", o);
  }
  _halfBlur(e, i, s, a, o, l, c) {
    const h = this._renderer,
      d = this._blurMaterial;
    l !== "latitudinal" && l !== "longitudinal" && console.error("blur direction must be either latitudinal or longitudinal!");
    const p = 3,
      f = new scope.Mesh(this._lodPlanes[a], d),
      _ = d.uniforms,
      x = this._sizeLods[s] - 1,
      b = isFinite(o) ? Math.PI / (2 * x) : 2 * Math.PI / (2 * scope.MAX_SAMPLES - 1),
      T = o / b,
      M = isFinite(o) ? 1 + Math.floor(p * T) : scope.MAX_SAMPLES;
    M > scope.MAX_SAMPLES && console.warn(`sigmaRadians, ${o}, is too large and will clip, as it requested ${M} samples when the maximum is set to ${scope.MAX_SAMPLES}`);
    const w = [];
    let D = 0;
    for (let N = 0; N < scope.MAX_SAMPLES; ++N) {
      const H = N / T,
        F = Math.exp(-H * H / 2);
      w.push(F), N === 0 ? D += F : N < M && (D += 2 * F);
    }
    for (let N = 0; N < w.length; N++) w[N] = w[N] / D;
    _.envMap.value = e.texture, _.samples.value = M, _.weights.value = w, _.latitudinal.value = l === "latitudinal", c && (_.poleAxis.value = c);
    const {
      _lodMax: R
    } = this;
    _.dTheta.value = b, _.mipInt.value = R - s;
    const P = this._sizeLods[a],
      U = 3 * P * (a > R - scope.LOD_MIN ? a - R + scope.LOD_MIN : 0),
      O = 4 * (this._cubeSize - P);
    scope._setViewport(i, U, O, 3 * P, 2 * P), h.setRenderTarget(i), h.render(f, scope._flatCamera);
  }
};
}
