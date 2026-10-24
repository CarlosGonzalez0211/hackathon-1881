/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1133230:1135714.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1662(scope) {
scope.GPUSim = class GPUSim {
  constructor({
    count: e = 4,
    width: i = null,
    height: s = null,
    textures: a = 1,
    initialTextures: o = [],
    material: l = null,
    afterCompute: c = null
  } = {}) {
    var p;
    const h = i || scope.math.getTextureSizeParticles(e),
      d = s || h;
    this.rt1 = new scope.WebGLRenderTarget(h, d, {
      count: a || 1,
      wrapS: scope.ClampToEdgeWrapping,
      wrapT: scope.ClampToEdgeWrapping,
      minFilter: scope.NearestFilter,
      magFilter: scope.NearestFilter,
      format: scope.RGBAFormat,
      type: scope.webglRenderer.webgl.capabilities.floatRenderTarget ? scope.FloatType : scope.HalfFloatType,
      depthBuffer: !1
    }), this.rt2 = this.rt1.clone(), this.rtCurrent = 0, scope.webglRenderer.webgl.initRenderTarget(this.rt1), scope.webglRenderer.webgl.initRenderTarget(this.rt2), this.initialTextures = o, ((p = this.initialTextures) == null ? void 0 : p.length) > 0 && this.initialTextures.forEach((f, _) => {
      scope.webglRenderer.webgl.copyTextureToTexture(f, this.rt1.textures[_]), scope.webglRenderer.webgl.copyTextureToTexture(f, this.rt2.textures[_]);
    }), this.computationMaterial = l, this.computationMaterial.name = "particlesGPU", this.fsQuad = new scope.utils.fsQuad(this.computationMaterial), scope.webglRenderer.webgl.compile(this.fsQuad.mesh, this.fsQuad.camera), this.afterCompute = c;
  }
  compute({
    mesh: e = null,
    camera: i = null
  } = {}) {
    var f, _;
    const s = this.computationMaterial.uniforms.uModelMatrix,
      a = this.computationMaterial.uniforms.uViewMatrix,
      o = this.computationMaterial.uniforms.uProjMatrix;
    e && s && s.value.copy(e.matrixWorld), i && a && a.value.copy(i.matrixWorldInverse), i && o && o.value.copy(i.projectionMatrix);
    const l = this.rtCurrent === 0 ? this.rt1 : this.rt2,
      c = this.rtCurrent === 0 ? this.rt2 : this.rt1;
    this.rtCurrent = (this.rtCurrent + 1) % 2;
    for (let x = 0; x < c.textures.length; x++) {
      const b = this.computationMaterial.uniforms[`tTexture${x + 1}`];
      b && (b.value = c.textures[x]);
    }
    const h = scope.webglRenderer.webgl.autoClear;
    scope.webglRenderer.webgl.autoClear = !1;
    const d = scope.webglRenderer.webgl.getRenderTarget();
    scope.webglRenderer.webgl.setRenderTarget(l), scope.webglRenderer.webgl.getClearColor(scope._c0$3);
    const p = scope.webglRenderer.webgl.getClearAlpha();
    if (scope.webglRenderer.webgl.setClearColor(scope._clearColor, 0), scope.webglRenderer.webgl.clear(!0, !1, !1), this.fsQuad.render(scope.webglRenderer.webgl), scope.webglRenderer.webgl.autoClear = h, scope.webglRenderer.webgl.setRenderTarget(d), scope.webglRenderer.webgl.setClearColor(scope._c0$3, p), (f = e == null ? void 0 : e.material) != null && f.uniforms) {
      const x = e.material.uniforms;
      for (let b = 0; b < l.textures.length; b++) {
        const T = x[`tTexture${b + 1}`];
        T && (T.value = l.textures[b]);
        const M = x[`tTexture${b + 1}Prev`];
        M && (M.value = c.textures[b]);
      }
    }
    (_ = this.afterCompute) == null || _.call(this, {
      mesh: e,
      camera: i
    });
  }
  dispose() {
    this.fsQuad.dispose(), this.computationMaterial.dispose(), this.rt1.dispose(), this.rt2.dispose();
  }
};
}
