/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 50736:53811.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0372(scope) {
scope.Matrix3 = class Matrix3 {
  constructor(e, i, s, a, o, l, c, h, d) {
    scope.Matrix3.prototype.isMatrix3 = !0, this.elements = [1, 0, 0, 0, 1, 0, 0, 0, 1], e !== void 0 && this.set(e, i, s, a, o, l, c, h, d);
  }
  set(e, i, s, a, o, l, c, h, d) {
    const p = this.elements;
    return p[0] = e, p[1] = a, p[2] = c, p[3] = i, p[4] = o, p[5] = h, p[6] = s, p[7] = l, p[8] = d, this;
  }
  identity() {
    return this.set(1, 0, 0, 0, 1, 0, 0, 0, 1), this;
  }
  copy(e) {
    const i = this.elements,
      s = e.elements;
    return i[0] = s[0], i[1] = s[1], i[2] = s[2], i[3] = s[3], i[4] = s[4], i[5] = s[5], i[6] = s[6], i[7] = s[7], i[8] = s[8], this;
  }
  extractBasis(e, i, s) {
    return e.setFromMatrix3Column(this, 0), i.setFromMatrix3Column(this, 1), s.setFromMatrix3Column(this, 2), this;
  }
  setFromMatrix4(e) {
    const i = e.elements;
    return this.set(i[0], i[4], i[8], i[1], i[5], i[9], i[2], i[6], i[10]), this;
  }
  multiply(e) {
    return this.multiplyMatrices(this, e);
  }
  premultiply(e) {
    return this.multiplyMatrices(e, this);
  }
  multiplyMatrices(e, i) {
    const s = e.elements,
      a = i.elements,
      o = this.elements,
      l = s[0],
      c = s[3],
      h = s[6],
      d = s[1],
      p = s[4],
      f = s[7],
      _ = s[2],
      x = s[5],
      b = s[8],
      T = a[0],
      M = a[3],
      w = a[6],
      D = a[1],
      R = a[4],
      P = a[7],
      U = a[2],
      O = a[5],
      N = a[8];
    return o[0] = l * T + c * D + h * U, o[3] = l * M + c * R + h * O, o[6] = l * w + c * P + h * N, o[1] = d * T + p * D + f * U, o[4] = d * M + p * R + f * O, o[7] = d * w + p * P + f * N, o[2] = _ * T + x * D + b * U, o[5] = _ * M + x * R + b * O, o[8] = _ * w + x * P + b * N, this;
  }
  multiplyScalar(e) {
    const i = this.elements;
    return i[0] *= e, i[3] *= e, i[6] *= e, i[1] *= e, i[4] *= e, i[7] *= e, i[2] *= e, i[5] *= e, i[8] *= e, this;
  }
  determinant() {
    const e = this.elements,
      i = e[0],
      s = e[1],
      a = e[2],
      o = e[3],
      l = e[4],
      c = e[5],
      h = e[6],
      d = e[7],
      p = e[8];
    return i * l * p - i * c * d - s * o * p + s * c * h + a * o * d - a * l * h;
  }
  invert() {
    const e = this.elements,
      i = e[0],
      s = e[1],
      a = e[2],
      o = e[3],
      l = e[4],
      c = e[5],
      h = e[6],
      d = e[7],
      p = e[8],
      f = p * l - c * d,
      _ = c * h - p * o,
      x = d * o - l * h,
      b = i * f + s * _ + a * x;
    if (b === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
    const T = 1 / b;
    return e[0] = f * T, e[1] = (a * d - p * s) * T, e[2] = (c * s - a * l) * T, e[3] = _ * T, e[4] = (p * i - a * h) * T, e[5] = (a * o - c * i) * T, e[6] = x * T, e[7] = (s * h - d * i) * T, e[8] = (l * i - s * o) * T, this;
  }
  transpose() {
    let e;
    const i = this.elements;
    return e = i[1], i[1] = i[3], i[3] = e, e = i[2], i[2] = i[6], i[6] = e, e = i[5], i[5] = i[7], i[7] = e, this;
  }
  getNormalMatrix(e) {
    return this.setFromMatrix4(e).invert().transpose();
  }
  transposeIntoArray(e) {
    const i = this.elements;
    return e[0] = i[0], e[1] = i[3], e[2] = i[6], e[3] = i[1], e[4] = i[4], e[5] = i[7], e[6] = i[2], e[7] = i[5], e[8] = i[8], this;
  }
  setUvTransform(e, i, s, a, o, l, c) {
    const h = Math.cos(o),
      d = Math.sin(o);
    return this.set(s * h, s * d, -s * (h * l + d * c) + l + e, -a * d, a * h, -a * (-d * l + h * c) + c + i, 0, 0, 1), this;
  }
  scale(e, i) {
    return this.premultiply(scope._m3.makeScale(e, i)), this;
  }
  rotate(e) {
    return this.premultiply(scope._m3.makeRotation(-e)), this;
  }
  translate(e, i) {
    return this.premultiply(scope._m3.makeTranslation(e, i)), this;
  }
  makeTranslation(e, i) {
    return e.isVector2 ? this.set(1, 0, e.x, 0, 1, e.y, 0, 0, 1) : this.set(1, 0, e, 0, 1, i, 0, 0, 1), this;
  }
  makeRotation(e) {
    const i = Math.cos(e),
      s = Math.sin(e);
    return this.set(i, -s, 0, s, i, 0, 0, 0, 1), this;
  }
  makeScale(e, i) {
    return this.set(e, 0, 0, 0, i, 0, 0, 0, 1), this;
  }
  equals(e) {
    const i = this.elements,
      s = e.elements;
    for (let a = 0; a < 9; a++) if (i[a] !== s[a]) return !1;
    return !0;
  }
  fromArray(e, i = 0) {
    for (let s = 0; s < 9; s++) this.elements[s] = e[s + i];
    return this;
  }
  toArray(e = [], i = 0) {
    const s = this.elements;
    return e[i] = s[0], e[i + 1] = s[1], e[i + 2] = s[2], e[i + 3] = s[3], e[i + 4] = s[4], e[i + 5] = s[5], e[i + 6] = s[6], e[i + 7] = s[7], e[i + 8] = s[8], e;
  }
  clone() {
    return new this.constructor().fromArray(this.elements);
  }
};
}
