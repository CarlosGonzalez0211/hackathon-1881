/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 134612:138480.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0489(scope) {
scope.BufferAttribute = class BufferAttribute {
  constructor(e, i, s = !1) {
    if (Array.isArray(e)) throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");
    this.isBufferAttribute = !0, Object.defineProperty(this, "id", {
      value: scope._id$2++
    }), this.name = "", this.array = e, this.itemSize = i, this.count = e !== void 0 ? e.length / i : 0, this.normalized = s, this.usage = scope.StaticDrawUsage, this.updateRanges = [], this.gpuType = scope.FloatType, this.version = 0;
  }
  onUploadCallback() {}
  set needsUpdate(e) {
    e === !0 && this.version++;
  }
  setUsage(e) {
    return this.usage = e, this;
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
  copy(e) {
    return this.name = e.name, this.array = new e.array.constructor(e.array), this.itemSize = e.itemSize, this.count = e.count, this.normalized = e.normalized, this.usage = e.usage, this.gpuType = e.gpuType, this;
  }
  copyAt(e, i, s) {
    e *= this.itemSize, s *= i.itemSize;
    for (let a = 0, o = this.itemSize; a < o; a++) this.array[e + a] = i.array[s + a];
    return this;
  }
  copyArray(e) {
    return this.array.set(e), this;
  }
  applyMatrix3(e) {
    if (this.itemSize === 2) for (let i = 0, s = this.count; i < s; i++) scope._vector2$1.fromBufferAttribute(this, i), scope._vector2$1.applyMatrix3(e), this.setXY(i, scope._vector2$1.x, scope._vector2$1.y);else if (this.itemSize === 3) for (let i = 0, s = this.count; i < s; i++) scope._vector$9.fromBufferAttribute(this, i), scope._vector$9.applyMatrix3(e), this.setXYZ(i, scope._vector$9.x, scope._vector$9.y, scope._vector$9.z);
    return this;
  }
  applyMatrix4(e) {
    for (let i = 0, s = this.count; i < s; i++) scope._vector$9.fromBufferAttribute(this, i), scope._vector$9.applyMatrix4(e), this.setXYZ(i, scope._vector$9.x, scope._vector$9.y, scope._vector$9.z);
    return this;
  }
  applyNormalMatrix(e) {
    for (let i = 0, s = this.count; i < s; i++) scope._vector$9.fromBufferAttribute(this, i), scope._vector$9.applyNormalMatrix(e), this.setXYZ(i, scope._vector$9.x, scope._vector$9.y, scope._vector$9.z);
    return this;
  }
  transformDirection(e) {
    for (let i = 0, s = this.count; i < s; i++) scope._vector$9.fromBufferAttribute(this, i), scope._vector$9.transformDirection(e), this.setXYZ(i, scope._vector$9.x, scope._vector$9.y, scope._vector$9.z);
    return this;
  }
  set(e, i = 0) {
    return this.array.set(e, i), this;
  }
  getComponent(e, i) {
    let s = this.array[e * this.itemSize + i];
    return this.normalized && (s = scope.denormalize(s, this.array)), s;
  }
  setComponent(e, i, s) {
    return this.normalized && (s = scope.normalize(s, this.array)), this.array[e * this.itemSize + i] = s, this;
  }
  getX(e) {
    let i = this.array[e * this.itemSize];
    return this.normalized && (i = scope.denormalize(i, this.array)), i;
  }
  setX(e, i) {
    return this.normalized && (i = scope.normalize(i, this.array)), this.array[e * this.itemSize] = i, this;
  }
  getY(e) {
    let i = this.array[e * this.itemSize + 1];
    return this.normalized && (i = scope.denormalize(i, this.array)), i;
  }
  setY(e, i) {
    return this.normalized && (i = scope.normalize(i, this.array)), this.array[e * this.itemSize + 1] = i, this;
  }
  getZ(e) {
    let i = this.array[e * this.itemSize + 2];
    return this.normalized && (i = scope.denormalize(i, this.array)), i;
  }
  setZ(e, i) {
    return this.normalized && (i = scope.normalize(i, this.array)), this.array[e * this.itemSize + 2] = i, this;
  }
  getW(e) {
    let i = this.array[e * this.itemSize + 3];
    return this.normalized && (i = scope.denormalize(i, this.array)), i;
  }
  setW(e, i) {
    return this.normalized && (i = scope.normalize(i, this.array)), this.array[e * this.itemSize + 3] = i, this;
  }
  setXY(e, i, s) {
    return e *= this.itemSize, this.normalized && (i = scope.normalize(i, this.array), s = scope.normalize(s, this.array)), this.array[e + 0] = i, this.array[e + 1] = s, this;
  }
  setXYZ(e, i, s, a) {
    return e *= this.itemSize, this.normalized && (i = scope.normalize(i, this.array), s = scope.normalize(s, this.array), a = scope.normalize(a, this.array)), this.array[e + 0] = i, this.array[e + 1] = s, this.array[e + 2] = a, this;
  }
  setXYZW(e, i, s, a, o) {
    return e *= this.itemSize, this.normalized && (i = scope.normalize(i, this.array), s = scope.normalize(s, this.array), a = scope.normalize(a, this.array), o = scope.normalize(o, this.array)), this.array[e + 0] = i, this.array[e + 1] = s, this.array[e + 2] = a, this.array[e + 3] = o, this;
  }
  onUpload(e) {
    return this.onUploadCallback = e, this;
  }
  clone() {
    return new this.constructor(this.array, this.itemSize).copy(this);
  }
  toJSON() {
    const e = {
      itemSize: this.itemSize,
      type: this.array.constructor.name,
      array: Array.from(this.array),
      normalized: this.normalized
    };
    return this.name !== "" && (e.name = this.name), this.usage !== scope.StaticDrawUsage && (e.usage = this.usage), e;
  }
};
}
