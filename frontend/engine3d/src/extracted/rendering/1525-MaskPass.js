/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 928349:929564.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1525(scope) {
scope.MaskPass = class extends scope.Pass {
  constructor(r, e) {
    super("MaskPass", r, e), this.needsSwap = !1, this.clearPass = new scope.ClearPass(!1, !1, !0), this.inverse = !1;
  }
  set mainScene(r) {
    this.scene = r;
  }
  set mainCamera(r) {
    this.camera = r;
  }
  get inverted() {
    return this.inverse;
  }
  set inverted(r) {
    this.inverse = r;
  }
  get clear() {
    return this.clearPass.enabled;
  }
  set clear(r) {
    this.clearPass.enabled = r;
  }
  getClearPass() {
    return this.clearPass;
  }
  isInverted() {
    return this.inverted;
  }
  setInverted(r) {
    this.inverted = r;
  }
  render(r, e, i, s, a) {
    const o = r.getContext(),
      l = r.state.buffers,
      c = this.scene,
      h = this.camera,
      d = this.clearPass,
      p = this.inverted ? 0 : 1,
      f = 1 - p;
    l.color.setMask(!1), l.depth.setMask(!1), l.color.setLocked(!0), l.depth.setLocked(!0), l.stencil.setTest(!0), l.stencil.setOp(o.REPLACE, o.REPLACE, o.REPLACE), l.stencil.setFunc(o.ALWAYS, p, 4294967295), l.stencil.setClear(f), l.stencil.setLocked(!0), this.clearPass.enabled && (this.renderToScreen ? d.render(r, null) : (d.render(r, e), d.render(r, i))), this.renderToScreen ? (r.setRenderTarget(null), r.render(c, h)) : (r.setRenderTarget(e), r.render(c, h), r.setRenderTarget(i), r.render(c, h)), l.color.setLocked(!1), l.depth.setLocked(!1), l.stencil.setLocked(!1), l.stencil.setFunc(o.EQUAL, 1, 4294967295), l.stencil.setOp(o.KEEP, o.KEEP, o.KEEP), l.stencil.setLocked(!0);
  }
};
}
