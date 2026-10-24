/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 60008:64450.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0394(scope) {
scope.Texture = class Texture extends scope.EventDispatcher {
  constructor(e = scope.Texture.DEFAULT_IMAGE, i = scope.Texture.DEFAULT_MAPPING, s = scope.ClampToEdgeWrapping, a = scope.ClampToEdgeWrapping, o = scope.LinearFilter, l = scope.LinearMipmapLinearFilter, c = scope.RGBAFormat, h = scope.UnsignedByteType, d = scope.Texture.DEFAULT_ANISOTROPY, p = scope.NoColorSpace) {
    super(), this.isTexture = !0, Object.defineProperty(this, "id", {
      value: scope._textureId++
    }), this.uuid = scope.generateUUID(), this.name = "", this.source = new scope.Source(e), this.mipmaps = [], this.mapping = i, this.channel = 0, this.wrapS = s, this.wrapT = a, this.magFilter = o, this.minFilter = l, this.anisotropy = d, this.format = c, this.internalFormat = null, this.type = h, this.offset = new scope.Vector2(0, 0), this.repeat = new scope.Vector2(1, 1), this.center = new scope.Vector2(0, 0), this.rotation = 0, this.matrixAutoUpdate = !0, this.matrix = new scope.Matrix3(), this.generateMipmaps = !0, this.premultiplyAlpha = !1, this.flipY = !0, this.unpackAlignment = 4, this.colorSpace = p, this.userData = {}, this.updateRanges = [], this.version = 0, this.onUpdate = null, this.renderTarget = null, this.isRenderTargetTexture = !1, this.isArrayTexture = !!(e && e.depth && e.depth > 1), this.pmremVersion = 0;
  }
  get width() {
    return this.source.getSize(scope._tempVec3).x;
  }
  get height() {
    return this.source.getSize(scope._tempVec3).y;
  }
  get depth() {
    return this.source.getSize(scope._tempVec3).z;
  }
  get image() {
    return this.source.data;
  }
  set image(e = null) {
    this.source.data = e;
  }
  updateMatrix() {
    this.matrix.setUvTransform(this.offset.x, this.offset.y, this.repeat.x, this.repeat.y, this.rotation, this.center.x, this.center.y);
  }
  addUpdateRange(e, i) {
    this.updateRanges.push({
      start: e,
      count: i
    });
  }
  clearUpdateRanges() {
    this.updateRanges.length = 0;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    return this.name = e.name, this.source = e.source, this.mipmaps = e.mipmaps.slice(0), this.mapping = e.mapping, this.channel = e.channel, this.wrapS = e.wrapS, this.wrapT = e.wrapT, this.magFilter = e.magFilter, this.minFilter = e.minFilter, this.anisotropy = e.anisotropy, this.format = e.format, this.internalFormat = e.internalFormat, this.type = e.type, this.offset.copy(e.offset), this.repeat.copy(e.repeat), this.center.copy(e.center), this.rotation = e.rotation, this.matrixAutoUpdate = e.matrixAutoUpdate, this.matrix.copy(e.matrix), this.generateMipmaps = e.generateMipmaps, this.premultiplyAlpha = e.premultiplyAlpha, this.flipY = e.flipY, this.unpackAlignment = e.unpackAlignment, this.colorSpace = e.colorSpace, this.renderTarget = e.renderTarget, this.isRenderTargetTexture = e.isRenderTargetTexture, this.isArrayTexture = e.isArrayTexture, this.userData = JSON.parse(JSON.stringify(e.userData)), this.needsUpdate = !0, this;
  }
  setValues(e) {
    for (const i in e) {
      const s = e[i];
      if (s === void 0) {
        console.warn(`THREE.Texture.setValues(): parameter '${i}' has value of undefined.`);
        continue;
      }
      const a = this[i];
      if (a === void 0) {
        console.warn(`THREE.Texture.setValues(): property '${i}' does not exist.`);
        continue;
      }
      a && s && a.isVector2 && s.isVector2 || a && s && a.isVector3 && s.isVector3 || a && s && a.isMatrix3 && s.isMatrix3 ? a.copy(s) : this[i] = s;
    }
  }
  toJSON(e) {
    const i = e === void 0 || typeof e == "string";
    if (!i && e.textures[this.uuid] !== void 0) return e.textures[this.uuid];
    const s = {
      metadata: {
        version: 4.7,
        type: "Texture",
        generator: "Texture.toJSON"
      },
      uuid: this.uuid,
      name: this.name,
      image: this.source.toJSON(e).uuid,
      mapping: this.mapping,
      channel: this.channel,
      repeat: [this.repeat.x, this.repeat.y],
      offset: [this.offset.x, this.offset.y],
      center: [this.center.x, this.center.y],
      rotation: this.rotation,
      wrap: [this.wrapS, this.wrapT],
      format: this.format,
      internalFormat: this.internalFormat,
      type: this.type,
      colorSpace: this.colorSpace,
      minFilter: this.minFilter,
      magFilter: this.magFilter,
      anisotropy: this.anisotropy,
      flipY: this.flipY,
      generateMipmaps: this.generateMipmaps,
      premultiplyAlpha: this.premultiplyAlpha,
      unpackAlignment: this.unpackAlignment
    };
    return Object.keys(this.userData).length > 0 && (s.userData = this.userData), i || (e.textures[this.uuid] = s), s;
  }
  dispose() {
    this.dispatchEvent({
      type: "dispose"
    });
  }
  transformUv(e) {
    if (this.mapping !== scope.UVMapping) return e;
    if (e.applyMatrix3(this.matrix), e.x < 0 || e.x > 1) switch (this.wrapS) {
      case scope.RepeatWrapping:
        e.x = e.x - Math.floor(e.x);
        break;
      case scope.ClampToEdgeWrapping:
        e.x = e.x < 0 ? 0 : 1;
        break;
      case scope.MirroredRepeatWrapping:
        Math.abs(Math.floor(e.x) % 2) === 1 ? e.x = Math.ceil(e.x) - e.x : e.x = e.x - Math.floor(e.x);
        break;
    }
    if (e.y < 0 || e.y > 1) switch (this.wrapT) {
      case scope.RepeatWrapping:
        e.y = e.y - Math.floor(e.y);
        break;
      case scope.ClampToEdgeWrapping:
        e.y = e.y < 0 ? 0 : 1;
        break;
      case scope.MirroredRepeatWrapping:
        Math.abs(Math.floor(e.y) % 2) === 1 ? e.y = Math.ceil(e.y) - e.y : e.y = e.y - Math.floor(e.y);
        break;
    }
    return this.flipY && (e.y = 1 - e.y), e;
  }
  set needsUpdate(e) {
    e === !0 && (this.version++, this.source.needsUpdate = !0);
  }
  set needsPMREMUpdate(e) {
    e === !0 && this.pmremVersion++;
  }
};
}
