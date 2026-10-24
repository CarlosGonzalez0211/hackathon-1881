/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 38370:44201.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0368(scope) {
scope.Quaternion = class Quaternion {
  constructor(e = 0, i = 0, s = 0, a = 1) {
    this.isQuaternion = !0, this._x = e, this._y = i, this._z = s, this._w = a;
  }
  static slerpFlat(e, i, s, a, o, l, c) {
    let h = s[a + 0],
      d = s[a + 1],
      p = s[a + 2],
      f = s[a + 3];
    const _ = o[l + 0],
      x = o[l + 1],
      b = o[l + 2],
      T = o[l + 3];
    if (c === 0) {
      e[i + 0] = h, e[i + 1] = d, e[i + 2] = p, e[i + 3] = f;
      return;
    }
    if (c === 1) {
      e[i + 0] = _, e[i + 1] = x, e[i + 2] = b, e[i + 3] = T;
      return;
    }
    if (f !== T || h !== _ || d !== x || p !== b) {
      let M = 1 - c;
      const w = h * _ + d * x + p * b + f * T,
        D = w >= 0 ? 1 : -1,
        R = 1 - w * w;
      if (R > Number.EPSILON) {
        const U = Math.sqrt(R),
          O = Math.atan2(U, w * D);
        M = Math.sin(M * O) / U, c = Math.sin(c * O) / U;
      }
      const P = c * D;
      if (h = h * M + _ * P, d = d * M + x * P, p = p * M + b * P, f = f * M + T * P, M === 1 - c) {
        const U = 1 / Math.sqrt(h * h + d * d + p * p + f * f);
        h *= U, d *= U, p *= U, f *= U;
      }
    }
    e[i] = h, e[i + 1] = d, e[i + 2] = p, e[i + 3] = f;
  }
  static multiplyQuaternionsFlat(e, i, s, a, o, l) {
    const c = s[a],
      h = s[a + 1],
      d = s[a + 2],
      p = s[a + 3],
      f = o[l],
      _ = o[l + 1],
      x = o[l + 2],
      b = o[l + 3];
    return e[i] = c * b + p * f + h * x - d * _, e[i + 1] = h * b + p * _ + d * f - c * x, e[i + 2] = d * b + p * x + c * _ - h * f, e[i + 3] = p * b - c * f - h * _ - d * x, e;
  }
  get x() {
    return this._x;
  }
  set x(e) {
    this._x = e, this._onChangeCallback();
  }
  get y() {
    return this._y;
  }
  set y(e) {
    this._y = e, this._onChangeCallback();
  }
  get z() {
    return this._z;
  }
  set z(e) {
    this._z = e, this._onChangeCallback();
  }
  get w() {
    return this._w;
  }
  set w(e) {
    this._w = e, this._onChangeCallback();
  }
  set(e, i, s, a) {
    return this._x = e, this._y = i, this._z = s, this._w = a, this._onChangeCallback(), this;
  }
  clone() {
    return new this.constructor(this._x, this._y, this._z, this._w);
  }
  copy(e) {
    return this._x = e.x, this._y = e.y, this._z = e.z, this._w = e.w, this._onChangeCallback(), this;
  }
  setFromEuler(e, i = !0) {
    const s = e._x,
      a = e._y,
      o = e._z,
      l = e._order,
      c = Math.cos,
      h = Math.sin,
      d = c(s / 2),
      p = c(a / 2),
      f = c(o / 2),
      _ = h(s / 2),
      x = h(a / 2),
      b = h(o / 2);
    switch (l) {
      case "XYZ":
        this._x = _ * p * f + d * x * b, this._y = d * x * f - _ * p * b, this._z = d * p * b + _ * x * f, this._w = d * p * f - _ * x * b;
        break;
      case "YXZ":
        this._x = _ * p * f + d * x * b, this._y = d * x * f - _ * p * b, this._z = d * p * b - _ * x * f, this._w = d * p * f + _ * x * b;
        break;
      case "ZXY":
        this._x = _ * p * f - d * x * b, this._y = d * x * f + _ * p * b, this._z = d * p * b + _ * x * f, this._w = d * p * f - _ * x * b;
        break;
      case "ZYX":
        this._x = _ * p * f - d * x * b, this._y = d * x * f + _ * p * b, this._z = d * p * b - _ * x * f, this._w = d * p * f + _ * x * b;
        break;
      case "YZX":
        this._x = _ * p * f + d * x * b, this._y = d * x * f + _ * p * b, this._z = d * p * b - _ * x * f, this._w = d * p * f - _ * x * b;
        break;
      case "XZY":
        this._x = _ * p * f - d * x * b, this._y = d * x * f - _ * p * b, this._z = d * p * b + _ * x * f, this._w = d * p * f + _ * x * b;
        break;
      default:
        console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: " + l);
    }
    return i === !0 && this._onChangeCallback(), this;
  }
  setFromAxisAngle(e, i) {
    const s = i / 2,
      a = Math.sin(s);
    return this._x = e.x * a, this._y = e.y * a, this._z = e.z * a, this._w = Math.cos(s), this._onChangeCallback(), this;
  }
  setFromRotationMatrix(e) {
    const i = e.elements,
      s = i[0],
      a = i[4],
      o = i[8],
      l = i[1],
      c = i[5],
      h = i[9],
      d = i[2],
      p = i[6],
      f = i[10],
      _ = s + c + f;
    if (_ > 0) {
      const x = .5 / Math.sqrt(_ + 1);
      this._w = .25 / x, this._x = (p - h) * x, this._y = (o - d) * x, this._z = (l - a) * x;
    } else if (s > c && s > f) {
      const x = 2 * Math.sqrt(1 + s - c - f);
      this._w = (p - h) / x, this._x = .25 * x, this._y = (a + l) / x, this._z = (o + d) / x;
    } else if (c > f) {
      const x = 2 * Math.sqrt(1 + c - s - f);
      this._w = (o - d) / x, this._x = (a + l) / x, this._y = .25 * x, this._z = (h + p) / x;
    } else {
      const x = 2 * Math.sqrt(1 + f - s - c);
      this._w = (l - a) / x, this._x = (o + d) / x, this._y = (h + p) / x, this._z = .25 * x;
    }
    return this._onChangeCallback(), this;
  }
  setFromUnitVectors(e, i) {
    let s = e.dot(i) + 1;
    return s < 1e-8 ? (s = 0, Math.abs(e.x) > Math.abs(e.z) ? (this._x = -e.y, this._y = e.x, this._z = 0, this._w = s) : (this._x = 0, this._y = -e.z, this._z = e.y, this._w = s)) : (this._x = e.y * i.z - e.z * i.y, this._y = e.z * i.x - e.x * i.z, this._z = e.x * i.y - e.y * i.x, this._w = s), this.normalize();
  }
  angleTo(e) {
    return 2 * Math.acos(Math.abs(scope.clamp(this.dot(e), -1, 1)));
  }
  rotateTowards(e, i) {
    const s = this.angleTo(e);
    if (s === 0) return this;
    const a = Math.min(1, i / s);
    return this.slerp(e, a), this;
  }
  identity() {
    return this.set(0, 0, 0, 1);
  }
  invert() {
    return this.conjugate();
  }
  conjugate() {
    return this._x *= -1, this._y *= -1, this._z *= -1, this._onChangeCallback(), this;
  }
  dot(e) {
    return this._x * e._x + this._y * e._y + this._z * e._z + this._w * e._w;
  }
  lengthSq() {
    return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
  }
  length() {
    return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
  }
  normalize() {
    let e = this.length();
    return e === 0 ? (this._x = 0, this._y = 0, this._z = 0, this._w = 1) : (e = 1 / e, this._x = this._x * e, this._y = this._y * e, this._z = this._z * e, this._w = this._w * e), this._onChangeCallback(), this;
  }
  multiply(e) {
    return this.multiplyQuaternions(this, e);
  }
  premultiply(e) {
    return this.multiplyQuaternions(e, this);
  }
  multiplyQuaternions(e, i) {
    const s = e._x,
      a = e._y,
      o = e._z,
      l = e._w,
      c = i._x,
      h = i._y,
      d = i._z,
      p = i._w;
    return this._x = s * p + l * c + a * d - o * h, this._y = a * p + l * h + o * c - s * d, this._z = o * p + l * d + s * h - a * c, this._w = l * p - s * c - a * h - o * d, this._onChangeCallback(), this;
  }
  slerp(e, i) {
    if (i === 0) return this;
    if (i === 1) return this.copy(e);
    const s = this._x,
      a = this._y,
      o = this._z,
      l = this._w;
    let c = l * e._w + s * e._x + a * e._y + o * e._z;
    if (c < 0 ? (this._w = -e._w, this._x = -e._x, this._y = -e._y, this._z = -e._z, c = -c) : this.copy(e), c >= 1) return this._w = l, this._x = s, this._y = a, this._z = o, this;
    const h = 1 - c * c;
    if (h <= Number.EPSILON) {
      const x = 1 - i;
      return this._w = x * l + i * this._w, this._x = x * s + i * this._x, this._y = x * a + i * this._y, this._z = x * o + i * this._z, this.normalize(), this;
    }
    const d = Math.sqrt(h),
      p = Math.atan2(d, c),
      f = Math.sin((1 - i) * p) / d,
      _ = Math.sin(i * p) / d;
    return this._w = l * f + this._w * _, this._x = s * f + this._x * _, this._y = a * f + this._y * _, this._z = o * f + this._z * _, this._onChangeCallback(), this;
  }
  slerpQuaternions(e, i, s) {
    return this.copy(e).slerp(i, s);
  }
  random() {
    const e = 2 * Math.PI * Math.random(),
      i = 2 * Math.PI * Math.random(),
      s = Math.random(),
      a = Math.sqrt(1 - s),
      o = Math.sqrt(s);
    return this.set(a * Math.sin(e), a * Math.cos(e), o * Math.sin(i), o * Math.cos(i));
  }
  equals(e) {
    return e._x === this._x && e._y === this._y && e._z === this._z && e._w === this._w;
  }
  fromArray(e, i = 0) {
    return this._x = e[i], this._y = e[i + 1], this._z = e[i + 2], this._w = e[i + 3], this._onChangeCallback(), this;
  }
  toArray(e = [], i = 0) {
    return e[i] = this._x, e[i + 1] = this._y, e[i + 2] = this._z, e[i + 3] = this._w, e;
  }
  fromBufferAttribute(e, i) {
    return this._x = e.getX(i), this._y = e.getY(i), this._z = e.getZ(i), this._w = e.getW(i), this._onChangeCallback(), this;
  }
  toJSON() {
    return this.toArray();
  }
  _onChange(e) {
    return this._onChangeCallback = e, this;
  }
  _onChangeCallback() {}
  *[Symbol.iterator]() {
    yield this._x, yield this._y, yield this._z, yield this._w;
  }
};
}
