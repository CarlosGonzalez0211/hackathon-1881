/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 918606:921299.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1511(scope) {
scope.EffectComposer$1 = class {
  constructor(e, i) {
    if (this.renderer = e, this._pixelRatio = e.getPixelRatio(), i === void 0) {
      const s = e.getSize(new scope.Vector2());
      this._width = s.width, this._height = s.height, i = new scope.WebGLRenderTarget(this._width * this._pixelRatio, this._height * this._pixelRatio, {
        type: scope.HalfFloatType
      }), i.texture.name = "EffectComposer.rt1";
    } else this._width = i.width, this._height = i.height;
    this.renderTarget1 = i, this.renderTarget2 = i.clone(), this.renderTarget2.texture.name = "EffectComposer.rt2", this.writeBuffer = this.renderTarget1, this.readBuffer = this.renderTarget2, this.renderToScreen = !0, this.passes = [], this.copyPass = new scope.ShaderPass$1(scope.CopyShader), this.copyPass.material.blending = scope.NoBlending, this.clock = new scope.Clock();
  }
  swapBuffers() {
    const e = this.readBuffer;
    this.readBuffer = this.writeBuffer, this.writeBuffer = e;
  }
  addPass(e) {
    this.passes.push(e), e.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
  }
  insertPass(e, i) {
    this.passes.splice(i, 0, e), e.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
  }
  removePass(e) {
    const i = this.passes.indexOf(e);
    i !== -1 && this.passes.splice(i, 1);
  }
  isLastEnabledPass(e) {
    for (let i = e + 1; i < this.passes.length; i++) if (this.passes[i].enabled) return !1;
    return !0;
  }
  render(e) {
    e === void 0 && (e = this.clock.getDelta());
    const i = this.renderer.getRenderTarget();
    let s = !1;
    for (let a = 0, o = this.passes.length; a < o; a++) {
      const l = this.passes[a];
      if (l.enabled !== !1) {
        if (l.renderToScreen = this.renderToScreen && this.isLastEnabledPass(a), l.render(this.renderer, this.writeBuffer, this.readBuffer, e, s), l.needsSwap) {
          if (s) {
            const c = this.renderer.getContext(),
              h = this.renderer.state.buffers.stencil;
            h.setFunc(c.NOTEQUAL, 1, 4294967295), this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, e), h.setFunc(c.EQUAL, 1, 4294967295);
          }
          this.swapBuffers();
        }
        scope.MaskPass$1 !== void 0 && (l instanceof scope.MaskPass$1 ? s = !0 : l instanceof scope.ClearMaskPass$1 && (s = !1));
      }
    }
    this.renderer.setRenderTarget(i);
  }
  reset(e) {
    if (e === void 0) {
      const i = this.renderer.getSize(new scope.Vector2());
      this._pixelRatio = this.renderer.getPixelRatio(), this._width = i.width, this._height = i.height, e = this.renderTarget1.clone(), e.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
    }
    this.renderTarget1.dispose(), this.renderTarget2.dispose(), this.renderTarget1 = e, this.renderTarget2 = e.clone(), this.writeBuffer = this.renderTarget1, this.readBuffer = this.renderTarget2;
  }
  setSize(e, i) {
    this._width = e, this._height = i;
    const s = this._width * this._pixelRatio,
      a = this._height * this._pixelRatio;
    this.renderTarget1.setSize(s, a), this.renderTarget2.setSize(s, a);
    for (let o = 0; o < this.passes.length; o++) this.passes[o].setSize(s, a);
  }
  setPixelRatio(e) {
    this._pixelRatio = e, this.setSize(this._width, this._height);
  }
  dispose() {
    this.renderTarget1.dispose(), this.renderTarget2.dispose(), this.copyPass.dispose();
  }
};
}
