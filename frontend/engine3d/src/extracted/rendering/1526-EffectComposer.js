/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 929565:934449.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1526(scope) {
scope.EffectComposer = class {
  constructor(r = null, {
    depthBuffer: e = !0,
    stencilBuffer: i = !1,
    multisampling: s = 0,
    frameBufferType: a
  } = {}) {
    this.renderer = null, this.inputBuffer = this.createBuffer(e, i, a, s), this.outputBuffer = this.inputBuffer.clone(), this.copyPass = new scope.CopyPass(), this.depthTexture = null, this.passes = [], this.timer = new scope.Timer(), this.autoRenderToScreen = !0, this.setRenderer(r);
  }
  get multisampling() {
    return this.inputBuffer.samples || 0;
  }
  set multisampling(r) {
    const e = this.inputBuffer,
      i = this.multisampling;
    i > 0 && r > 0 ? (this.inputBuffer.samples = r, this.outputBuffer.samples = r, this.inputBuffer.dispose(), this.outputBuffer.dispose()) : i !== r && (this.inputBuffer.dispose(), this.outputBuffer.dispose(), this.inputBuffer = this.createBuffer(e.depthBuffer, e.stencilBuffer, e.texture.type, r), this.inputBuffer.depthTexture = this.depthTexture, this.outputBuffer = this.inputBuffer.clone());
  }
  getTimer() {
    return this.timer;
  }
  getRenderer() {
    return this.renderer;
  }
  setRenderer(r) {
    if (this.renderer = r, r !== null) {
      const e = r.getSize(new scope.Vector2()),
        i = r.getContext().getContextAttributes().alpha,
        s = this.inputBuffer.texture.type;
      s === scope.UnsignedByteType && r.outputColorSpace === scope.SRGBColorSpace && (this.inputBuffer.texture.colorSpace = scope.SRGBColorSpace, this.outputBuffer.texture.colorSpace = scope.SRGBColorSpace, this.inputBuffer.dispose(), this.outputBuffer.dispose()), r.autoClear = !1, this.setSize(e.width, e.height);
      for (const a of this.passes) a.initialize(r, i, s);
    }
  }
  replaceRenderer(r, e = !0) {
    const i = this.renderer,
      s = i.domElement.parentNode;
    return this.setRenderer(r), e && s !== null && (s.removeChild(i.domElement), s.appendChild(r.domElement)), i;
  }
  createDepthTexture() {
    const r = this.depthTexture = new scope.DepthTexture();
    return this.inputBuffer.depthTexture = r, this.inputBuffer.dispose(), this.inputBuffer.stencilBuffer ? (r.format = scope.DepthStencilFormat, r.type = scope.UnsignedInt248Type) : r.type = scope.UnsignedIntType, r;
  }
  deleteDepthTexture() {
    if (this.depthTexture !== null) {
      this.depthTexture.dispose(), this.depthTexture = null, this.inputBuffer.depthTexture = null, this.inputBuffer.dispose();
      for (const r of this.passes) r.setDepthTexture(null);
    }
  }
  createBuffer(r, e, i, s) {
    const a = this.renderer,
      o = a === null ? new scope.Vector2() : a.getDrawingBufferSize(new scope.Vector2()),
      l = {
        minFilter: scope.LinearFilter,
        magFilter: scope.LinearFilter,
        stencilBuffer: e,
        depthBuffer: r,
        type: i
      },
      c = new scope.WebGLRenderTarget(o.width, o.height, l);
    return s > 0 && (c.ignoreDepthForMultisampleCopy = !1, c.samples = s), i === scope.UnsignedByteType && a !== null && a.outputColorSpace === scope.SRGBColorSpace && (c.texture.colorSpace = scope.SRGBColorSpace), c.texture.name = "EffectComposer.Buffer", c.texture.generateMipmaps = !1, c;
  }
  setMainScene(r) {
    for (const e of this.passes) e.mainScene = r;
  }
  setMainCamera(r) {
    for (const e of this.passes) e.mainCamera = r;
  }
  addPass(r, e) {
    const i = this.passes,
      s = this.renderer,
      a = s.getDrawingBufferSize(new scope.Vector2()),
      o = s.getContext().getContextAttributes().alpha,
      l = this.inputBuffer.texture.type;
    if (r.setRenderer(s), r.setSize(a.width, a.height), r.initialize(s, o, l), this.autoRenderToScreen && (i.length > 0 && (i[i.length - 1].renderToScreen = !1), r.renderToScreen && (this.autoRenderToScreen = !1)), e !== void 0 ? i.splice(e, 0, r) : i.push(r), this.autoRenderToScreen && (i[i.length - 1].renderToScreen = !0), r.needsDepthTexture || this.depthTexture !== null) if (this.depthTexture === null) {
      const c = this.createDepthTexture();
      for (r of i) r.setDepthTexture(c);
    } else r.setDepthTexture(this.depthTexture);
  }
  removePass(r) {
    const e = this.passes,
      i = e.indexOf(r);
    if (i !== -1 && e.splice(i, 1).length > 0) {
      if (this.depthTexture !== null) {
        const o = (c, h) => c || h.needsDepthTexture;
        e.reduce(o, !1) || (r.getDepthTexture() === this.depthTexture && r.setDepthTexture(null), this.deleteDepthTexture());
      }
      this.autoRenderToScreen && i === e.length && (r.renderToScreen = !1, e.length > 0 && (e[e.length - 1].renderToScreen = !0));
    }
  }
  removeAllPasses() {
    const r = this.passes;
    this.deleteDepthTexture(), r.length > 0 && (this.autoRenderToScreen && (r[r.length - 1].renderToScreen = !1), this.passes = []);
  }
  render(r) {
    const e = this.renderer,
      i = this.copyPass;
    let s = this.inputBuffer,
      a = this.outputBuffer,
      o = !1,
      l,
      c,
      h;
    r === void 0 && (this.timer.update(), r = this.timer.getDelta());
    for (const d of this.passes) d.enabled && (d.render(e, s, a, r, o), d.needsSwap && (o && (i.renderToScreen = d.renderToScreen, l = e.getContext(), c = e.state.buffers.stencil, c.setFunc(l.NOTEQUAL, 1, 4294967295), i.render(e, s, a, r, o), c.setFunc(l.EQUAL, 1, 4294967295)), h = s, s = a, a = h), d instanceof scope.MaskPass ? o = !0 : d instanceof scope.ClearMaskPass && (o = !1));
  }
  setSize(r, e, i) {
    const s = this.renderer,
      a = s.getSize(new scope.Vector2());
    (r === void 0 || e === void 0) && (r = a.width, e = a.height), (a.width !== r || a.height !== e) && s.setSize(r, e, i);
    const o = s.getDrawingBufferSize(new scope.Vector2());
    this.inputBuffer.setSize(o.width, o.height), this.outputBuffer.setSize(o.width, o.height);
    for (const l of this.passes) l.setSize(o.width, o.height);
  }
  reset() {
    this.dispose(), this.autoRenderToScreen = !0;
  }
  dispose() {
    for (const r of this.passes) r.dispose();
    this.passes = [], this.inputBuffer !== null && this.inputBuffer.dispose(), this.outputBuffer !== null && this.outputBuffer.dispose(), this.deleteDepthTexture(), this.copyPass.dispose(), this.timer.dispose(), scope.Pass.fullscreenGeometry.dispose();
  }
};
}
