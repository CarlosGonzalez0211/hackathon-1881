/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 966036:968339.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1590(scope) {
scope.MipmapBlurPass = class extends scope.Pass {
  constructor() {
    super("MipmapBlurPass"), this.needsSwap = !1, this.renderTarget = new scope.WebGLRenderTarget(1, 1, {
      depthBuffer: !1
    }), this.renderTarget.texture.name = "Upsampling.Mipmap0", this.downsamplingMipmaps = [], this.upsamplingMipmaps = [], this.downsamplingMaterial = new scope.DownsamplingMaterial(), this.upsamplingMaterial = new scope.UpsamplingMaterial(), this.resolution = new scope.Vector2();
  }
  get texture() {
    return this.renderTarget.texture;
  }
  get levels() {
    return this.downsamplingMipmaps.length;
  }
  set levels(r) {
    if (this.levels !== r) {
      const e = this.renderTarget;
      this.dispose(), this.downsamplingMipmaps = [], this.upsamplingMipmaps = [];
      for (let i = 0; i < r; ++i) {
        const s = e.clone();
        s.texture.name = "Downsampling.Mipmap" + i, this.downsamplingMipmaps.push(s);
      }
      this.upsamplingMipmaps.push(e);
      for (let i = 1, s = r - 1; i < s; ++i) {
        const a = e.clone();
        a.texture.name = "Upsampling.Mipmap" + i, this.upsamplingMipmaps.push(a);
      }
      this.setSize(this.resolution.x, this.resolution.y);
    }
  }
  get radius() {
    return this.upsamplingMaterial.radius;
  }
  set radius(r) {
    this.upsamplingMaterial.radius = r;
  }
  render(r, e, i, s, a) {
    const {
        scene: o,
        camera: l
      } = this,
      {
        downsamplingMaterial: c,
        upsamplingMaterial: h
      } = this,
      {
        downsamplingMipmaps: d,
        upsamplingMipmaps: p
      } = this;
    let f = e;
    this.fullscreenMaterial = c;
    for (let _ = 0, x = d.length; _ < x; ++_) {
      const b = d[_];
      c.setSize(f.width, f.height), c.inputBuffer = f.texture, r.setRenderTarget(b), r.render(o, l), f = b;
    }
    this.fullscreenMaterial = h;
    for (let _ = p.length - 1; _ >= 0; --_) {
      const x = p[_];
      h.setSize(f.width, f.height), h.inputBuffer = f.texture, h.supportBuffer = d[_].texture, r.setRenderTarget(x), r.render(o, l), f = x;
    }
  }
  setSize(r, e) {
    const i = this.resolution;
    i.set(r, e);
    let s = i.width,
      a = i.height;
    for (let o = 0, l = this.downsamplingMipmaps.length; o < l; ++o) s = Math.round(s * .5), a = Math.round(a * .5), this.downsamplingMipmaps[o].setSize(s, a), o < this.upsamplingMipmaps.length && this.upsamplingMipmaps[o].setSize(s, a);
  }
  initialize(r, e, i) {
    if (i !== void 0) {
      const s = this.downsamplingMipmaps.concat(this.upsamplingMipmaps);
      for (const a of s) a.texture.type = i;
      if (i !== scope.UnsignedByteType) this.downsamplingMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1", this.upsamplingMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";else if (r !== null && r.outputColorSpace === scope.SRGBColorSpace) for (const a of s) a.texture.colorSpace = scope.SRGBColorSpace;
    }
  }
  dispose() {
    super.dispose();
    for (const r of this.downsamplingMipmaps.concat(this.upsamplingMipmaps)) r.dispose();
  }
};
}
