/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 171530:173058.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0538(scope) {
scope.InterleavedBuffer = class InterleavedBuffer {
  constructor(e, i) {
    this.isInterleavedBuffer = !0, this.array = e, this.stride = i, this.count = e !== void 0 ? e.length / i : 0, this.usage = scope.StaticDrawUsage, this.updateRanges = [], this.version = 0, this.uuid = scope.generateUUID();
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
    return this.array = new e.array.constructor(e.array), this.count = e.count, this.stride = e.stride, this.usage = e.usage, this;
  }
  copyAt(e, i, s) {
    e *= this.stride, s *= i.stride;
    for (let a = 0, o = this.stride; a < o; a++) this.array[e + a] = i.array[s + a];
    return this;
  }
  set(e, i = 0) {
    return this.array.set(e, i), this;
  }
  clone(e) {
    e.arrayBuffers === void 0 && (e.arrayBuffers = {}), this.array.buffer._uuid === void 0 && (this.array.buffer._uuid = scope.generateUUID()), e.arrayBuffers[this.array.buffer._uuid] === void 0 && (e.arrayBuffers[this.array.buffer._uuid] = this.array.slice(0).buffer);
    const i = new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),
      s = new this.constructor(i, this.stride);
    return s.setUsage(this.usage), s;
  }
  onUpload(e) {
    return this.onUploadCallback = e, this;
  }
  toJSON(e) {
    return e.arrayBuffers === void 0 && (e.arrayBuffers = {}), this.array.buffer._uuid === void 0 && (this.array.buffer._uuid = scope.generateUUID()), e.arrayBuffers[this.array.buffer._uuid] === void 0 && (e.arrayBuffers[this.array.buffer._uuid] = Array.from(new Uint32Array(this.array.buffer))), {
      uuid: this.uuid,
      buffer: this.array.buffer._uuid,
      type: this.array.constructor.name,
      stride: this.stride
    };
  }
};
}
