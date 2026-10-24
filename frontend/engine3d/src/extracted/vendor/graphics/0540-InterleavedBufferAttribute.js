/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 173086:177173.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0540(scope) {
scope.InterleavedBufferAttribute = class InterleavedBufferAttribute {
  constructor(e, i, s, a = !1) {
    this.isInterleavedBufferAttribute = !0, this.name = "", this.data = e, this.itemSize = i, this.offset = s, this.normalized = a;
  }
  get count() {
    return this.data.count;
  }
  get array() {
    return this.data.array;
  }
  set needsUpdate(e) {
    this.data.needsUpdate = e;
  }
  applyMatrix4(e) {
    for (let i = 0, s = this.data.count; i < s; i++) scope._vector$7.fromBufferAttribute(this, i), scope._vector$7.applyMatrix4(e), this.setXYZ(i, scope._vector$7.x, scope._vector$7.y, scope._vector$7.z);
    return this;
  }
  applyNormalMatrix(e) {
    for (let i = 0, s = this.count; i < s; i++) scope._vector$7.fromBufferAttribute(this, i), scope._vector$7.applyNormalMatrix(e), this.setXYZ(i, scope._vector$7.x, scope._vector$7.y, scope._vector$7.z);
    return this;
  }
  transformDirection(e) {
    for (let i = 0, s = this.count; i < s; i++) scope._vector$7.fromBufferAttribute(this, i), scope._vector$7.transformDirection(e), this.setXYZ(i, scope._vector$7.x, scope._vector$7.y, scope._vector$7.z);
    return this;
  }
  getComponent(e, i) {
    let s = this.array[e * this.data.stride + this.offset + i];
    return this.normalized && (s = scope.denormalize(s, this.array)), s;
  }
  setComponent(e, i, s) {
    return this.normalized && (s = scope.normalize(s, this.array)), this.data.array[e * this.data.stride + this.offset + i] = s, this;
  }
  setX(e, i) {
    return this.normalized && (i = scope.normalize(i, this.array)), this.data.array[e * this.data.stride + this.offset] = i, this;
  }
  setY(e, i) {
    return this.normalized && (i = scope.normalize(i, this.array)), this.data.array[e * this.data.stride + this.offset + 1] = i, this;
  }
  setZ(e, i) {
    return this.normalized && (i = scope.normalize(i, this.array)), this.data.array[e * this.data.stride + this.offset + 2] = i, this;
  }
  setW(e, i) {
    return this.normalized && (i = scope.normalize(i, this.array)), this.data.array[e * this.data.stride + this.offset + 3] = i, this;
  }
  getX(e) {
    let i = this.data.array[e * this.data.stride + this.offset];
    return this.normalized && (i = scope.denormalize(i, this.array)), i;
  }
  getY(e) {
    let i = this.data.array[e * this.data.stride + this.offset + 1];
    return this.normalized && (i = scope.denormalize(i, this.array)), i;
  }
  getZ(e) {
    let i = this.data.array[e * this.data.stride + this.offset + 2];
    return this.normalized && (i = scope.denormalize(i, this.array)), i;
  }
  getW(e) {
    let i = this.data.array[e * this.data.stride + this.offset + 3];
    return this.normalized && (i = scope.denormalize(i, this.array)), i;
  }
  setXY(e, i, s) {
    return e = e * this.data.stride + this.offset, this.normalized && (i = scope.normalize(i, this.array), s = scope.normalize(s, this.array)), this.data.array[e + 0] = i, this.data.array[e + 1] = s, this;
  }
  setXYZ(e, i, s, a) {
    return e = e * this.data.stride + this.offset, this.normalized && (i = scope.normalize(i, this.array), s = scope.normalize(s, this.array), a = scope.normalize(a, this.array)), this.data.array[e + 0] = i, this.data.array[e + 1] = s, this.data.array[e + 2] = a, this;
  }
  setXYZW(e, i, s, a, o) {
    return e = e * this.data.stride + this.offset, this.normalized && (i = scope.normalize(i, this.array), s = scope.normalize(s, this.array), a = scope.normalize(a, this.array), o = scope.normalize(o, this.array)), this.data.array[e + 0] = i, this.data.array[e + 1] = s, this.data.array[e + 2] = a, this.data.array[e + 3] = o, this;
  }
  clone(e) {
    if (e === void 0) {
      console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");
      const i = [];
      for (let s = 0; s < this.count; s++) {
        const a = s * this.data.stride + this.offset;
        for (let o = 0; o < this.itemSize; o++) i.push(this.data.array[a + o]);
      }
      return new scope.BufferAttribute(new this.array.constructor(i), this.itemSize, this.normalized);
    } else return e.interleavedBuffers === void 0 && (e.interleavedBuffers = {}), e.interleavedBuffers[this.data.uuid] === void 0 && (e.interleavedBuffers[this.data.uuid] = this.data.clone(e)), new scope.InterleavedBufferAttribute(e.interleavedBuffers[this.data.uuid], this.itemSize, this.offset, this.normalized);
  }
  toJSON(e) {
    if (e === void 0) {
      console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");
      const i = [];
      for (let s = 0; s < this.count; s++) {
        const a = s * this.data.stride + this.offset;
        for (let o = 0; o < this.itemSize; o++) i.push(this.data.array[a + o]);
      }
      return {
        itemSize: this.itemSize,
        type: this.array.constructor.name,
        array: i,
        normalized: this.normalized
      };
    } else return e.interleavedBuffers === void 0 && (e.interleavedBuffers = {}), e.interleavedBuffers[this.data.uuid] === void 0 && (e.interleavedBuffers[this.data.uuid] = this.data.toJSON(e)), {
      isInterleavedBufferAttribute: !0,
      itemSize: this.itemSize,
      data: this.data.uuid,
      offset: this.offset,
      normalized: this.normalized
    };
  }
};
}
