/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 916615:917482.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1508(scope) {
scope.ShaderPass$1 = class extends scope.Pass$1 {
  constructor(e, i = "tDiffuse") {
    super(), this.textureID = i, this.uniforms = null, this.material = null, e instanceof scope.ShaderMaterial ? (this.uniforms = e.uniforms, this.material = e) : e && (this.uniforms = scope.UniformsUtils.clone(e.uniforms), this.material = new scope.ShaderMaterial({
      name: e.name !== void 0 ? e.name : "unspecified",
      defines: Object.assign({}, e.defines),
      uniforms: this.uniforms,
      vertexShader: e.vertexShader,
      fragmentShader: e.fragmentShader
    })), this._fsQuad = new scope.FullScreenQuad(this.material);
  }
  render(e, i, s) {
    this.uniforms[this.textureID] && (this.uniforms[this.textureID].value = s.texture), this._fsQuad.material = this.material, this.renderToScreen ? (e.setRenderTarget(null), this._fsQuad.render(e)) : (e.setRenderTarget(i), this.clear && e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil), this._fsQuad.render(e));
  }
  dispose() {
    this.material.dispose(), this._fsQuad.dispose();
  }
};
}
