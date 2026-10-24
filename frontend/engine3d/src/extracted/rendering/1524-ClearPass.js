/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 927545:928348.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1524(scope) {
scope.ClearPass = class extends scope.Pass {
  constructor(r = !0, e = !0, i = !1) {
    super("ClearPass", null, null), this.needsSwap = !1, this.color = r, this.depth = e, this.stencil = i, this.overrideClearColor = null, this.overrideClearAlpha = -1;
  }
  setClearFlags(r, e, i) {
    this.color = r, this.depth = e, this.stencil = i;
  }
  getOverrideClearColor() {
    return this.overrideClearColor;
  }
  setOverrideClearColor(r) {
    this.overrideClearColor = r;
  }
  getOverrideClearAlpha() {
    return this.overrideClearAlpha;
  }
  setOverrideClearAlpha(r) {
    this.overrideClearAlpha = r;
  }
  render(r, e, i, s, a) {
    const o = this.overrideClearColor,
      l = this.overrideClearAlpha,
      c = r.getClearAlpha(),
      h = o !== null,
      d = l >= 0;
    h ? (r.getClearColor(scope.color), r.setClearColor(o, d ? l : c)) : d && r.setClearAlpha(l), r.setRenderTarget(this.renderToScreen ? null : e), r.clear(this.color, this.depth, this.stencil), h ? r.setClearColor(scope.color, c) : d && r.setClearAlpha(c);
  }
};
}
