/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 69936:73071.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0399(scope) {
scope.RenderTarget = class RenderTarget extends scope.EventDispatcher {
  constructor(e = 1, i = 1, s = {}) {
    super(), s = Object.assign({
      generateMipmaps: !1,
      internalFormat: null,
      minFilter: scope.LinearFilter,
      depthBuffer: !0,
      stencilBuffer: !1,
      resolveDepthBuffer: !0,
      resolveStencilBuffer: !0,
      depthTexture: null,
      samples: 0,
      count: 1,
      depth: 1,
      multiview: !1
    }, s), this.isRenderTarget = !0, this.width = e, this.height = i, this.depth = s.depth, this.scissor = new scope.Vector4(0, 0, e, i), this.scissorTest = !1, this.viewport = new scope.Vector4(0, 0, e, i);
    const a = {
        width: e,
        height: i,
        depth: s.depth
      },
      o = new scope.Texture(a);
    this.textures = [];
    const l = s.count;
    for (let c = 0; c < l; c++) this.textures[c] = o.clone(), this.textures[c].isRenderTargetTexture = !0, this.textures[c].renderTarget = this;
    this._setTextureOptions(s), this.depthBuffer = s.depthBuffer, this.stencilBuffer = s.stencilBuffer, this.resolveDepthBuffer = s.resolveDepthBuffer, this.resolveStencilBuffer = s.resolveStencilBuffer, this._depthTexture = null, this.depthTexture = s.depthTexture, this.samples = s.samples, this.multiview = s.multiview;
  }
  _setTextureOptions(e = {}) {
    const i = {
      minFilter: scope.LinearFilter,
      generateMipmaps: !1,
      flipY: !1,
      internalFormat: null
    };
    e.mapping !== void 0 && (i.mapping = e.mapping), e.wrapS !== void 0 && (i.wrapS = e.wrapS), e.wrapT !== void 0 && (i.wrapT = e.wrapT), e.wrapR !== void 0 && (i.wrapR = e.wrapR), e.magFilter !== void 0 && (i.magFilter = e.magFilter), e.minFilter !== void 0 && (i.minFilter = e.minFilter), e.format !== void 0 && (i.format = e.format), e.type !== void 0 && (i.type = e.type), e.anisotropy !== void 0 && (i.anisotropy = e.anisotropy), e.colorSpace !== void 0 && (i.colorSpace = e.colorSpace), e.flipY !== void 0 && (i.flipY = e.flipY), e.generateMipmaps !== void 0 && (i.generateMipmaps = e.generateMipmaps), e.internalFormat !== void 0 && (i.internalFormat = e.internalFormat);
    for (let s = 0; s < this.textures.length; s++) this.textures[s].setValues(i);
  }
  get texture() {
    return this.textures[0];
  }
  set texture(e) {
    this.textures[0] = e;
  }
  set depthTexture(e) {
    this._depthTexture !== null && (this._depthTexture.renderTarget = null), e !== null && (e.renderTarget = this), this._depthTexture = e;
  }
  get depthTexture() {
    return this._depthTexture;
  }
  setSize(e, i, s = 1) {
    if (this.width !== e || this.height !== i || this.depth !== s) {
      this.width = e, this.height = i, this.depth = s;
      for (let a = 0, o = this.textures.length; a < o; a++) this.textures[a].image.width = e, this.textures[a].image.height = i, this.textures[a].image.depth = s, this.textures[a].isArrayTexture = this.textures[a].image.depth > 1;
      this.dispose();
    }
    this.viewport.set(0, 0, e, i), this.scissor.set(0, 0, e, i);
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    this.width = e.width, this.height = e.height, this.depth = e.depth, this.scissor.copy(e.scissor), this.scissorTest = e.scissorTest, this.viewport.copy(e.viewport), this.textures.length = 0;
    for (let i = 0, s = e.textures.length; i < s; i++) {
      this.textures[i] = e.textures[i].clone(), this.textures[i].isRenderTargetTexture = !0, this.textures[i].renderTarget = this;
      const a = Object.assign({}, e.textures[i].image);
      this.textures[i].source = new scope.Source(a);
    }
    return this.depthBuffer = e.depthBuffer, this.stencilBuffer = e.stencilBuffer, this.resolveDepthBuffer = e.resolveDepthBuffer, this.resolveStencilBuffer = e.resolveStencilBuffer, e.depthTexture !== null && (this.depthTexture = e.depthTexture.clone()), this.samples = e.samples, this;
  }
  dispose() {
    this.dispatchEvent({
      type: "dispose"
    });
  }
};
}
