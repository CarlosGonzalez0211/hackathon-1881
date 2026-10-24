/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 979781:980260.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1603(scope) {
scope.ShaderPass = class extends scope.Pass {
  constructor(r, e = "inputBuffer") {
    super("ShaderPass"), this.fullscreenMaterial = r, this.input = e;
  }
  setInput(r) {
    this.input = r;
  }
  render(r, e, i, s, a) {
    const o = this.fullscreenMaterial.uniforms;
    e !== null && o !== void 0 && o[this.input] !== void 0 && (o[this.input].value = e.texture), r.setRenderTarget(this.renderToScreen ? null : i), r.render(this.scene, this.camera);
  }
  initialize(r, e, i) {
    i !== void 0 && i !== scope.UnsignedByteType && (this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1");
  }
};
}
