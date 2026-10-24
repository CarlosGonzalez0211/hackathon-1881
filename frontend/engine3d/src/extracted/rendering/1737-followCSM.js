/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1307736:1312757.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1737(scope) {
scope.followCSM = class followCSM extends scope.DirectionalLight {
  static setOrthographicFrustum(e, i) {
    e.left = -i, e.right = i, e.top = i, e.bottom = -i, e.updateProjectionMatrix();
  }
  constructor({
    color: e = "#ffffff",
    intensity: i = 1,
    scene: s = null,
    positionOffset: a = new scope.Spherical(2, Math.PI * .2, 0),
    forwardOffset: o = 5,
    castShadow: l = !0,
    shadowMapSize: c = 2048,
    shadowSize: h = 12,
    csm: d = !0,
    csmMapSize: p = Math.min(Math.min(scope.client$1.screen.w, scope.client$1.screen.h) < 640 ? 4096 : 8192, scope.webglRenderer.webgl.capabilities.maxTextureSize),
    csmBoundingSphere: f = new scope.Sphere(new scope.Vector3(), 1),
    csmNear: _ = 1,
    csmLODLevel: x = 1,
    cameraLayer: b = 30,
    skipCSMMeshes: T = []
  } = {}) {
    var M;
    if (super(e, i), !s) throw new Error("Follow CSM light requires a scene");
    if (this.name = "followCSM", this._scene = s, this._camera = this._scene.camera, this._offset = new scope.Vector3().setFromSpherical(a), this._forwardOffset = o, this._shadowMapSize = c, this.castShadow = l, this.shadow.mapSize.width = this._shadowMapSize, this.shadow.mapSize.height = this._shadowMapSize, scope.followCSM.setOrthographicFrustum(this.shadow.camera, h), d) {
      this.csmMaps = new Array(x).fill(null).map(() => new scope.WebGLRenderTarget(p, p, {
        minFilter: scope.NearestFilter,
        magFilter: scope.NearestFilter
      }));
      const w = new scope.OrthographicCamera(),
        D = new scope.Spherical().copy(a);
      if (D.radius = Math.max(D.radius, f.radius), scope._v0$e.setFromSpherical(D), (M = this._camera._followedMesh) != null && M.isWorldCharacters) {
        const N = this._camera._followedMesh._localObject;
        scope._v0$e.applyQuaternion(N.quaternion), scope._v0$e.applyAxisAngle(N.up, Math.PI - N.rotationHorizontal);
      }
      w.position.copy(f.center).add(scope._v0$e), w.lookAt(f.center), w.near = _, w.far = D.radius * 2 - _, scope.followCSM.setOrthographicFrustum(w, D.radius), w.updateMatrixWorld(), w.layers.set(b), this.csmMatrix = new scope.Matrix4(), this.csmMatrix.set(.5, 0, 0, .5, 0, .5, 0, .5, 0, 0, .5, .5, 0, 0, 0, 1), this.csmMatrix.multiply(w.projectionMatrix), this.csmMatrix.multiply(w.matrixWorldInverse), this._scene.traverse(N => {
        var H, F;
        (H = N.material) != null && H.isMaterial && (N.visible || (F = N.parent) != null && F.isLOD) && N.castShadow && !N.isSkinnedMesh && !T.some(k => k === N) && (N.__prevMaterial = N.material, N.material = N.customDepthMaterial || scope.depthMaterial, N.layers.enable(b)), N.isLOD && (N.__prevAutoUpdate = N.autoUpdate, N.autoUpdate = !1);
      });
      const R = scope.webglRenderer.webgl.getRenderTarget(),
        P = scope.webglRenderer.webgl.autoClear,
        U = new scope.Color();
      scope.webglRenderer.webgl.getClearColor(U);
      const O = scope.webglRenderer.webgl.getClearAlpha();
      for (let N = 0; N < this.csmMaps.length; N++) this._scene.traverse(H => {
        H.isLOD && H.levels.forEach((F, k) => F.object.visible = k === N);
      }), scope.webglRenderer.webgl.setRenderTarget(this.csmMaps[N]), scope.webglRenderer.webgl.autoClear = !1, scope.webglRenderer.webgl.setClearColor("#ffffff", 1), scope.webglRenderer.webgl.clear(!0, !0, !1), scope.webglRenderer.webgl.render(this._scene, w);
      scope.webglRenderer.webgl.setClearColor(U, O), scope.webglRenderer.webgl.autoClear = P, scope.webglRenderer.webgl.setRenderTarget(R), this._scene.traverse(N => {
        var H, F, k, W, $, Z, J, se, re, he, ee, Ie;
        if (N.isLOD && (N.autoUpdate = N.__prevAutoUpdate, delete N.__prevAutoUpdate), !!((H = N.material) != null && H.isMaterial)) {
          if (N.__prevMaterial && (N.material = N.__prevMaterial, delete N.__prevMaterial), N.layers.test(b) && N.layers.disable(b), (k = (F = N.material) == null ? void 0 : F.uniforms) != null && k.csmMap) if (N.parent.isLOD) {
            const Te = N.parent.levels.findIndex(Ue => Ue.object === N);
            Te > -1 && (N.material.uniforms.csmMap.value = this.csmMaps[this.csmMaps.length > Te ? Te : 0].texture);
          } else N.material.uniforms.csmMap.value = this.csmMaps[0].texture;
          (Z = ($ = (W = N.material) == null ? void 0 : W.uniforms) == null ? void 0 : $.csmMatrix) != null && Z.value && N.material.uniforms.csmMatrix.value.copy(this.csmMatrix), (re = (se = (J = N.material) == null ? void 0 : J.uniforms) == null ? void 0 : se.csmOptions) != null && re.value && N.material.uniforms.csmOptions.value.set(p, 1, h * .75, h), (Ie = (ee = (he = N.material) == null ? void 0 : he.uniforms) == null ? void 0 : ee.csmTarget) != null && Ie.value && (N.material.uniforms.csmTarget.value = this.target.position);
        }
      });
    }
  }
  updateMatrixWorld(e) {
    var i, s, a, o, l;
    if (!scope.miscutils.hasRunThisFrame(this)) {
      if (this.target.position.copy(this._camera.target), this.target.position.addScaledVector(scope._v0$e.copy(this._camera.target).sub(this._camera.position).normalize(), this._forwardOffset), this.target.updateMatrixWorld(), (i = this._camera._followedMesh) != null && i.isWorldCharacters) {
        const c = this._camera._followedMesh._localObject;
        scope._v0$e.copy(this._offset).applyQuaternion(c.quaternion), scope._v0$e.applyAxisAngle(c.up, Math.PI - c.rotationHorizontal), this.position.copy(this.target.position).add(scope._v0$e), this.up.copy(c.up), this.shadow.camera.up.copy(c.up);
      } else this.position.copy(this.target.position).add(this._offset);
      scope.global$1.adaptiveDPR && (scope.global$1.adaptiveDPR.multiplier < .9 ? this.shadow.mapSize.width > this._shadowMapSize * .5 && (this.shadow.mapSize.width = this._shadowMapSize * .5, this.shadow.mapSize.height = this._shadowMapSize * .5, (a = (s = this.shadow.map) == null ? void 0 : s.dispose) == null || a.call(s), this.shadow.map = null) : this.shadow.mapSize.width < this._shadowMapSize && (this.shadow.mapSize.width = this._shadowMapSize, this.shadow.mapSize.height = this._shadowMapSize, (l = (o = this.shadow.map) == null ? void 0 : o.dispose) == null || l.call(o), this.shadow.map = null));
    }
    super.updateMatrixWorld(e);
  }
  dispose() {
    var e;
    (e = this.csmMaps) == null || e.forEach(i => i.dispose()), super.dispose();
  }
};
}
