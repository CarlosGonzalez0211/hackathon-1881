/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 912297:915770.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1498(scope) {
scope.scene = class scene extends scope.Scene {
  constructor({
    customCamera: e = null,
    orbit: i = !1,
    cameraType: s = "perspective"
  } = {}) {
    super();
    const a = e || (i ? scope.orbitCamera$1 : scope.baseCamera$1);
    this.camera = a(s), this.composer = null, this.matrixWorldAutoUpdate = !0, this.matrixAutoUpdate = !1, this.beforeRenderCbs = [], this._textures = new Set(), this.customUploadRT = null, this.uploaded = new Promise(o => {
      this._isUploaded = o;
    }), this.ready = new Promise(o => {
      this.isReady = o;
    }).then(() => {
      this._upload();
    });
  }
  async _upload() {
    this.traverse(i => {
      var s, a, o, l, c, h, d;
      i !== this && (i.__uploadVars = {
        cull: i.frustumCulled,
        visible: i.visible
      }, i.frustumCulled = !1, i.visible = !0, i.frustumCulled && (i.boundingSphere === null ? (s = i.computeBoundingSphere) == null || s.call(i) : ((a = i.geometry) == null ? void 0 : a.boundingSphere) === null && ((l = (o = i.geometry).computeBoundingSphere) == null || l.call(o))), (c = i.material) != null && c.isMaterial && (i.material.uniforms && Object.entries(i.material.uniforms).forEach(([p, f]) => {
        var _;
        (_ = f.value) != null && _.isTexture && f.value._loaded && this._textures.add(f.value);
      }), Object.entries(i.material).forEach(([p, f]) => {
        f != null && f.isTexture && f._loaded && this._textures.add(f);
      }), i.__uploadVars.materialVisible = i.material.visible, i.__uploadVars.depthMaterialVisible = (h = i.customDepthMaterial) == null ? void 0 : h.visible, i.__uploadVars.distanceMaterialVisible = (d = i.customDistanceMaterial) == null ? void 0 : d.visible, i.material.visible = !0, i.customDepthMaterial && (i.customDepthMaterial.visible = !0), i.customDistanceMaterial && (i.customDistanceMaterial.visible = !0)));
    });
    const e = [];
    scope.webglRenderer.webgl.setRenderTarget(this.customUploadRT || scope.uploadRT), scope.webglRenderer.webgl.compile(this, this.camera), this._textures.size > 0 && e.push(...Array.from(this._textures).map(i => i._loaded.then(() => scope.webglRenderer.webgl.initTexture(i)))), await Promise.all(e), scope.webglRenderer.webgl.setRenderTarget(this.customUploadRT || scope.uploadRT), scope.webglRenderer.webgl.render(this, this.camera), this.traverse(i => {
      var s;
      i === this || !i.__uploadVars || (i.frustumCulled = i.__uploadVars.cull, i.visible = i.__uploadVars.visible, (s = i.material) != null && s.isMaterial && (i.material.visible = i.__uploadVars.materialVisible, i.customDepthMaterial && (i.customDepthMaterial.visible = i.__uploadVars.depthMaterialVisible), i.customDistanceMaterial && (i.customDistanceMaterial.visible = i.__uploadVars.distanceMaterialVisible)), delete i.__uploadVars);
    }), this._isUploaded();
  }
  debug() {
    scope.gui$1.add(this);
  }
  updateMatrixWorld(e) {
    super.updateMatrixWorld(e), !scope.miscutils.hasRunThisFrame(this) && (this.camera._resize(), this.camera._update(), this.camera.updateMatrixWorld(), this.beforeRenderCbs.forEach(i => i()));
  }
  dispose() {
    var e, i, s, a;
    this.composer = null, this.beforeRenderCbs = [], this.camera && ((i = (e = this.camera).dispose) == null || i.call(e), this.camera = null), this.customUploadRT && ((a = (s = this.customUploadRT).dispose) == null || a.call(s), this.customUploadRT = null), this._textures && (this._textures.forEach(o => {
      var l;
      return (l = o == null ? void 0 : o.dispose) == null ? void 0 : l.call(o);
    }), this._textures.clear(), this._textures = null), this.traverse(o => {
      var l, c, h, d, p, f, _, x;
      (c = (l = o.geometry) == null ? void 0 : l.dispose) == null || c.call(l), (d = (h = o.skeleton) == null ? void 0 : h.dispose) == null || d.call(h), (p = o.material) != null && p.isMaterial && (o.material.uniforms ? Object.entries(o.material.uniforms).forEach(([b, T]) => {
        var M, w, D;
        (M = T.value) != null && M.isTexture && ((D = (w = T.value).dispose) == null || D.call(w));
      }) : Object.entries(o.material).forEach(([b, T]) => {
        var M;
        T != null && T.isTexture && ((M = T.dispose) == null || M.call(T));
      }), (_ = (f = o.material).dispose) == null || _.call(f)), o !== this && ((x = o.dispose) == null || x.call(o));
    }), this.clear();
  }
};
}
