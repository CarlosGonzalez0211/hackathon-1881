/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1609752:1610969.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step2040(scope) {
scope.waterPass = class waterPass {
  constructor({
    scene: e
  } = {}) {
    this.originalScene = e, this.scene = new scope.Scene(), this.camera = new scope.PerspectiveCamera(), this.rt = new scope.WebGLRenderTarget(2, 2, {
      type: scope.HalfFloatType
    }), scope.global$1.renderer.webgl.initRenderTarget(this.rt), this.multiplePass = null, this.resize(), scope.events$1.on("resize", this.resize, this);
  }
  resize() {
    const e = scope.global$1.uniforms.resolution.value;
    this.rt.setSize(e.x, e.y);
  }
  render() {
    const e = scope.global$1.renderer.webgl,
      i = this.multiplePass.renderTarget.depthTexture;
    this.scene.traverse(s => {
      var a, o, l, c;
      s !== this.scene && ((o = (a = s == null ? void 0 : s.material) == null ? void 0 : a.uniforms) != null && o.tScene && (s.material.uniforms.tScene.value = this.multiplePass.renderTarget.textures[0]), (c = (l = s == null ? void 0 : s.material) == null ? void 0 : l.uniforms) != null && c.tSceneInfo && (s.material.uniforms.tSceneInfo.value = this.multiplePass.renderTarget.textures[1]));
    }), this.rt.depthTexture = null, e.setRenderTarget(this.rt), e.setClearAlpha(0), e.clear(), e.setRenderTarget(null), this.rt.depthTexture = i, e.setRenderTarget(this.rt), this.camera.copy(this.originalScene.camera), this.camera.updateProjectionMatrix(), this.camera.updateMatrixWorld(), e.render(this.scene, this.camera, this.rt), this.rt.depthTexture = null, this.multiplePass.renderTarget.depthTexture = i;
  }
};
}
