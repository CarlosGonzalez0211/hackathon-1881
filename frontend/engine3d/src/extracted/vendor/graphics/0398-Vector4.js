/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 64540:69936.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0398(scope) {
scope.Vector4 = class Vector4 {
  constructor(e = 0, i = 0, s = 0, a = 1) {
    scope.Vector4.prototype.isVector4 = !0, this.x = e, this.y = i, this.z = s, this.w = a;
  }
  get width() {
    return this.z;
  }
  set width(e) {
    this.z = e;
  }
  get height() {
    return this.w;
  }
  set height(e) {
    this.w = e;
  }
  set(e, i, s, a) {
    return this.x = e, this.y = i, this.z = s, this.w = a, this;
  }
  setScalar(e) {
    return this.x = e, this.y = e, this.z = e, this.w = e, this;
  }
  setX(e) {
    return this.x = e, this;
  }
  setY(e) {
    return this.y = e, this;
  }
  setZ(e) {
    return this.z = e, this;
  }
  setW(e) {
    return this.w = e, this;
  }
  setComponent(e, i) {
    switch (e) {
      case 0:
        this.x = i;
        break;
      case 1:
        this.y = i;
        break;
      case 2:
        this.z = i;
        break;
      case 3:
        this.w = i;
        break;
      default:
        throw new Error("index is out of range: " + e);
    }
    return this;
  }
  getComponent(e) {
    switch (e) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      case 3:
        return this.w;
      default:
        throw new Error("index is out of range: " + e);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y, this.z, this.w);
  }
  copy(e) {
    return this.x = e.x, this.y = e.y, this.z = e.z, this.w = e.w !== void 0 ? e.w : 1, this;
  }
  add(e) {
    return this.x += e.x, this.y += e.y, this.z += e.z, this.w += e.w, this;
  }
  addScalar(e) {
    return this.x += e, this.y += e, this.z += e, this.w += e, this;
  }
  addVectors(e, i) {
    return this.x = e.x + i.x, this.y = e.y + i.y, this.z = e.z + i.z, this.w = e.w + i.w, this;
  }
  addScaledVector(e, i) {
    return this.x += e.x * i, this.y += e.y * i, this.z += e.z * i, this.w += e.w * i, this;
  }
  sub(e) {
    return this.x -= e.x, this.y -= e.y, this.z -= e.z, this.w -= e.w, this;
  }
  subScalar(e) {
    return this.x -= e, this.y -= e, this.z -= e, this.w -= e, this;
  }
  subVectors(e, i) {
    return this.x = e.x - i.x, this.y = e.y - i.y, this.z = e.z - i.z, this.w = e.w - i.w, this;
  }
  multiply(e) {
    return this.x *= e.x, this.y *= e.y, this.z *= e.z, this.w *= e.w, this;
  }
  multiplyScalar(e) {
    return this.x *= e, this.y *= e, this.z *= e, this.w *= e, this;
  }
  applyMatrix4(e) {
    const i = this.x,
      s = this.y,
      a = this.z,
      o = this.w,
      l = e.elements;
    return this.x = l[0] * i + l[4] * s + l[8] * a + l[12] * o, this.y = l[1] * i + l[5] * s + l[9] * a + l[13] * o, this.z = l[2] * i + l[6] * s + l[10] * a + l[14] * o, this.w = l[3] * i + l[7] * s + l[11] * a + l[15] * o, this;
  }
  divide(e) {
    return this.x /= e.x, this.y /= e.y, this.z /= e.z, this.w /= e.w, this;
  }
  divideScalar(e) {
    return this.multiplyScalar(1 / e);
  }
  setAxisAngleFromQuaternion(e) {
    this.w = 2 * Math.acos(e.w);
    const i = Math.sqrt(1 - e.w * e.w);
    return i < 1e-4 ? (this.x = 1, this.y = 0, this.z = 0) : (this.x = e.x / i, this.y = e.y / i, this.z = e.z / i), this;
  }
  setAxisAngleFromRotationMatrix(e) {
    let i, s, a, o;
    const h = e.elements,
      d = h[0],
      p = h[4],
      f = h[8],
      _ = h[1],
      x = h[5],
      b = h[9],
      T = h[2],
      M = h[6],
      w = h[10];
    if (Math.abs(p - _) < .01 && Math.abs(f - T) < .01 && Math.abs(b - M) < .01) {
      if (Math.abs(p + _) < .1 && Math.abs(f + T) < .1 && Math.abs(b + M) < .1 && Math.abs(d + x + w - 3) < .1) return this.set(1, 0, 0, 0), this;
      i = Math.PI;
      const R = (d + 1) / 2,
        P = (x + 1) / 2,
        U = (w + 1) / 2,
        O = (p + _) / 4,
        N = (f + T) / 4,
        H = (b + M) / 4;
      return R > P && R > U ? R < .01 ? (s = 0, a = .707106781, o = .707106781) : (s = Math.sqrt(R), a = O / s, o = N / s) : P > U ? P < .01 ? (s = .707106781, a = 0, o = .707106781) : (a = Math.sqrt(P), s = O / a, o = H / a) : U < .01 ? (s = .707106781, a = .707106781, o = 0) : (o = Math.sqrt(U), s = N / o, a = H / o), this.set(s, a, o, i), this;
    }
    let D = Math.sqrt((M - b) * (M - b) + (f - T) * (f - T) + (_ - p) * (_ - p));
    return Math.abs(D) < .001 && (D = 1), this.x = (M - b) / D, this.y = (f - T) / D, this.z = (_ - p) / D, this.w = Math.acos((d + x + w - 1) / 2), this;
  }
  setFromMatrixPosition(e) {
    const i = e.elements;
    return this.x = i[12], this.y = i[13], this.z = i[14], this.w = i[15], this;
  }
  min(e) {
    return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this.z = Math.min(this.z, e.z), this.w = Math.min(this.w, e.w), this;
  }
  max(e) {
    return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this.z = Math.max(this.z, e.z), this.w = Math.max(this.w, e.w), this;
  }
  clamp(e, i) {
    return this.x = scope.clamp(this.x, e.x, i.x), this.y = scope.clamp(this.y, e.y, i.y), this.z = scope.clamp(this.z, e.z, i.z), this.w = scope.clamp(this.w, e.w, i.w), this;
  }
  clampScalar(e, i) {
    return this.x = scope.clamp(this.x, e, i), this.y = scope.clamp(this.y, e, i), this.z = scope.clamp(this.z, e, i), this.w = scope.clamp(this.w, e, i), this;
  }
  clampLength(e, i) {
    const s = this.length();
    return this.divideScalar(s || 1).multiplyScalar(scope.clamp(s, e, i));
  }
  floor() {
    return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this.w = Math.floor(this.w), this;
  }
  ceil() {
    return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this.w = Math.ceil(this.w), this;
  }
  round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this.w = Math.round(this.w), this;
  }
  roundToZero() {
    return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this.w = Math.trunc(this.w), this;
  }
  negate() {
    return this.x = -this.x, this.y = -this.y, this.z = -this.z, this.w = -this.w, this;
  }
  dot(e) {
    return this.x * e.x + this.y * e.y + this.z * e.z + this.w * e.w;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  setLength(e) {
    return this.normalize().multiplyScalar(e);
  }
  lerp(e, i) {
    return this.x += (e.x - this.x) * i, this.y += (e.y - this.y) * i, this.z += (e.z - this.z) * i, this.w += (e.w - this.w) * i, this;
  }
  lerpVectors(e, i, s) {
    return this.x = e.x + (i.x - e.x) * s, this.y = e.y + (i.y - e.y) * s, this.z = e.z + (i.z - e.z) * s, this.w = e.w + (i.w - e.w) * s, this;
  }
  equals(e) {
    return e.x === this.x && e.y === this.y && e.z === this.z && e.w === this.w;
  }
  fromArray(e, i = 0) {
    return this.x = e[i], this.y = e[i + 1], this.z = e[i + 2], this.w = e[i + 3], this;
  }
  toArray(e = [], i = 0) {
    return e[i] = this.x, e[i + 1] = this.y, e[i + 2] = this.z, e[i + 3] = this.w, e;
  }
  fromBufferAttribute(e, i) {
    return this.x = e.getX(i), this.y = e.getY(i), this.z = e.getZ(i), this.w = e.getW(i), this;
  }
  random() {
    return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this.w = Math.random(), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y, yield this.z, yield this.w;
  }
};
}
