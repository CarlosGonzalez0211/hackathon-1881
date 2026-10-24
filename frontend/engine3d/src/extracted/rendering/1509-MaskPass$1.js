/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 917483:918442.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1509(scope) {
scope.MaskPass$1 = class extends scope.Pass$1 {
  constructor(e, i) {
    super(), this.scene = e, this.camera = i, this.clear = !0, this.needsSwap = !1, this.inverse = !1;
  }
  render(e, i, s) {
    const a = e.getContext(),
      o = e.state;
    o.buffers.color.setMask(!1), o.buffers.depth.setMask(!1), o.buffers.color.setLocked(!0), o.buffers.depth.setLocked(!0);
    let l, c;
    this.inverse ? (l = 0, c = 1) : (l = 1, c = 0), o.buffers.stencil.setTest(!0), o.buffers.stencil.setOp(a.REPLACE, a.REPLACE, a.REPLACE), o.buffers.stencil.setFunc(a.ALWAYS, l, 4294967295), o.buffers.stencil.setClear(c), o.buffers.stencil.setLocked(!0), e.setRenderTarget(s), this.clear && e.clear(), e.render(this.scene, this.camera), e.setRenderTarget(i), this.clear && e.clear(), e.render(this.scene, this.camera), o.buffers.color.setLocked(!1), o.buffers.depth.setLocked(!1), o.buffers.color.setMask(!0), o.buffers.depth.setMask(!0), o.buffers.stencil.setLocked(!1), o.buffers.stencil.setFunc(a.EQUAL, 1, 4294967295), o.buffers.stencil.setOp(a.KEEP, a.KEEP, a.KEEP), o.buffers.stencil.setLocked(!0);
  }
};
}
