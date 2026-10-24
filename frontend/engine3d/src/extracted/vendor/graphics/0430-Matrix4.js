/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 85961:95040.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0430(scope) {
scope.Matrix4 = class Matrix4 {
  constructor(e, i, s, a, o, l, c, h, d, p, f, _, x, b, T, M) {
    scope.Matrix4.prototype.isMatrix4 = !0, this.elements = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], e !== void 0 && this.set(e, i, s, a, o, l, c, h, d, p, f, _, x, b, T, M);
  }
  set(e, i, s, a, o, l, c, h, d, p, f, _, x, b, T, M) {
    const w = this.elements;
    return w[0] = e, w[4] = i, w[8] = s, w[12] = a, w[1] = o, w[5] = l, w[9] = c, w[13] = h, w[2] = d, w[6] = p, w[10] = f, w[14] = _, w[3] = x, w[7] = b, w[11] = T, w[15] = M, this;
  }
  identity() {
    return this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this;
  }
  clone() {
    return new scope.Matrix4().fromArray(this.elements);
  }
  copy(e) {
    const i = this.elements,
      s = e.elements;
    return i[0] = s[0], i[1] = s[1], i[2] = s[2], i[3] = s[3], i[4] = s[4], i[5] = s[5], i[6] = s[6], i[7] = s[7], i[8] = s[8], i[9] = s[9], i[10] = s[10], i[11] = s[11], i[12] = s[12], i[13] = s[13], i[14] = s[14], i[15] = s[15], this;
  }
  copyPosition(e) {
    const i = this.elements,
      s = e.elements;
    return i[12] = s[12], i[13] = s[13], i[14] = s[14], this;
  }
  setFromMatrix3(e) {
    const i = e.elements;
    return this.set(i[0], i[3], i[6], 0, i[1], i[4], i[7], 0, i[2], i[5], i[8], 0, 0, 0, 0, 1), this;
  }
  extractBasis(e, i, s) {
    return e.setFromMatrixColumn(this, 0), i.setFromMatrixColumn(this, 1), s.setFromMatrixColumn(this, 2), this;
  }
  makeBasis(e, i, s) {
    return this.set(e.x, i.x, s.x, 0, e.y, i.y, s.y, 0, e.z, i.z, s.z, 0, 0, 0, 0, 1), this;
  }
  extractRotation(e) {
    const i = this.elements,
      s = e.elements,
      a = 1 / scope._v1$5$1.setFromMatrixColumn(e, 0).length(),
      o = 1 / scope._v1$5$1.setFromMatrixColumn(e, 1).length(),
      l = 1 / scope._v1$5$1.setFromMatrixColumn(e, 2).length();
    return i[0] = s[0] * a, i[1] = s[1] * a, i[2] = s[2] * a, i[3] = 0, i[4] = s[4] * o, i[5] = s[5] * o, i[6] = s[6] * o, i[7] = 0, i[8] = s[8] * l, i[9] = s[9] * l, i[10] = s[10] * l, i[11] = 0, i[12] = 0, i[13] = 0, i[14] = 0, i[15] = 1, this;
  }
  makeRotationFromEuler(e) {
    const i = this.elements,
      s = e.x,
      a = e.y,
      o = e.z,
      l = Math.cos(s),
      c = Math.sin(s),
      h = Math.cos(a),
      d = Math.sin(a),
      p = Math.cos(o),
      f = Math.sin(o);
    if (e.order === "XYZ") {
      const _ = l * p,
        x = l * f,
        b = c * p,
        T = c * f;
      i[0] = h * p, i[4] = -h * f, i[8] = d, i[1] = x + b * d, i[5] = _ - T * d, i[9] = -c * h, i[2] = T - _ * d, i[6] = b + x * d, i[10] = l * h;
    } else if (e.order === "YXZ") {
      const _ = h * p,
        x = h * f,
        b = d * p,
        T = d * f;
      i[0] = _ + T * c, i[4] = b * c - x, i[8] = l * d, i[1] = l * f, i[5] = l * p, i[9] = -c, i[2] = x * c - b, i[6] = T + _ * c, i[10] = l * h;
    } else if (e.order === "ZXY") {
      const _ = h * p,
        x = h * f,
        b = d * p,
        T = d * f;
      i[0] = _ - T * c, i[4] = -l * f, i[8] = b + x * c, i[1] = x + b * c, i[5] = l * p, i[9] = T - _ * c, i[2] = -l * d, i[6] = c, i[10] = l * h;
    } else if (e.order === "ZYX") {
      const _ = l * p,
        x = l * f,
        b = c * p,
        T = c * f;
      i[0] = h * p, i[4] = b * d - x, i[8] = _ * d + T, i[1] = h * f, i[5] = T * d + _, i[9] = x * d - b, i[2] = -d, i[6] = c * h, i[10] = l * h;
    } else if (e.order === "YZX") {
      const _ = l * h,
        x = l * d,
        b = c * h,
        T = c * d;
      i[0] = h * p, i[4] = T - _ * f, i[8] = b * f + x, i[1] = f, i[5] = l * p, i[9] = -c * p, i[2] = -d * p, i[6] = x * f + b, i[10] = _ - T * f;
    } else if (e.order === "XZY") {
      const _ = l * h,
        x = l * d,
        b = c * h,
        T = c * d;
      i[0] = h * p, i[4] = -f, i[8] = d * p, i[1] = _ * f + T, i[5] = l * p, i[9] = x * f - b, i[2] = b * f - x, i[6] = c * p, i[10] = T * f + _;
    }
    return i[3] = 0, i[7] = 0, i[11] = 0, i[12] = 0, i[13] = 0, i[14] = 0, i[15] = 1, this;
  }
  makeRotationFromQuaternion(e) {
    return this.compose(scope._zero, e, scope._one);
  }
  lookAt(e, i, s) {
    const a = this.elements;
    return scope._z.subVectors(e, i), scope._z.lengthSq() === 0 && (scope._z.z = 1), scope._z.normalize(), scope._x.crossVectors(s, scope._z), scope._x.lengthSq() === 0 && (Math.abs(s.z) === 1 ? scope._z.x += 1e-4 : scope._z.z += 1e-4, scope._z.normalize(), scope._x.crossVectors(s, scope._z)), scope._x.normalize(), scope._y.crossVectors(scope._z, scope._x), a[0] = scope._x.x, a[4] = scope._y.x, a[8] = scope._z.x, a[1] = scope._x.y, a[5] = scope._y.y, a[9] = scope._z.y, a[2] = scope._x.z, a[6] = scope._y.z, a[10] = scope._z.z, this;
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
      c = s[4],
      h = s[8],
      d = s[12],
      p = s[1],
      f = s[5],
      _ = s[9],
      x = s[13],
      b = s[2],
      T = s[6],
      M = s[10],
      w = s[14],
      D = s[3],
      R = s[7],
      P = s[11],
      U = s[15],
      O = a[0],
      N = a[4],
      H = a[8],
      F = a[12],
      k = a[1],
      W = a[5],
      $ = a[9],
      Z = a[13],
      J = a[2],
      se = a[6],
      re = a[10],
      he = a[14],
      ee = a[3],
      Ie = a[7],
      Te = a[11],
      Ue = a[15];
    return o[0] = l * O + c * k + h * J + d * ee, o[4] = l * N + c * W + h * se + d * Ie, o[8] = l * H + c * $ + h * re + d * Te, o[12] = l * F + c * Z + h * he + d * Ue, o[1] = p * O + f * k + _ * J + x * ee, o[5] = p * N + f * W + _ * se + x * Ie, o[9] = p * H + f * $ + _ * re + x * Te, o[13] = p * F + f * Z + _ * he + x * Ue, o[2] = b * O + T * k + M * J + w * ee, o[6] = b * N + T * W + M * se + w * Ie, o[10] = b * H + T * $ + M * re + w * Te, o[14] = b * F + T * Z + M * he + w * Ue, o[3] = D * O + R * k + P * J + U * ee, o[7] = D * N + R * W + P * se + U * Ie, o[11] = D * H + R * $ + P * re + U * Te, o[15] = D * F + R * Z + P * he + U * Ue, this;
  }
  multiplyScalar(e) {
    const i = this.elements;
    return i[0] *= e, i[4] *= e, i[8] *= e, i[12] *= e, i[1] *= e, i[5] *= e, i[9] *= e, i[13] *= e, i[2] *= e, i[6] *= e, i[10] *= e, i[14] *= e, i[3] *= e, i[7] *= e, i[11] *= e, i[15] *= e, this;
  }
  determinant() {
    const e = this.elements,
      i = e[0],
      s = e[4],
      a = e[8],
      o = e[12],
      l = e[1],
      c = e[5],
      h = e[9],
      d = e[13],
      p = e[2],
      f = e[6],
      _ = e[10],
      x = e[14],
      b = e[3],
      T = e[7],
      M = e[11],
      w = e[15];
    return b * (+o * h * f - a * d * f - o * c * _ + s * d * _ + a * c * x - s * h * x) + T * (+i * h * x - i * d * _ + o * l * _ - a * l * x + a * d * p - o * h * p) + M * (+i * d * f - i * c * x - o * l * f + s * l * x + o * c * p - s * d * p) + w * (-a * c * p - i * h * f + i * c * _ + a * l * f - s * l * _ + s * h * p);
  }
  transpose() {
    const e = this.elements;
    let i;
    return i = e[1], e[1] = e[4], e[4] = i, i = e[2], e[2] = e[8], e[8] = i, i = e[6], e[6] = e[9], e[9] = i, i = e[3], e[3] = e[12], e[12] = i, i = e[7], e[7] = e[13], e[13] = i, i = e[11], e[11] = e[14], e[14] = i, this;
  }
  setPosition(e, i, s) {
    const a = this.elements;
    return e.isVector3 ? (a[12] = e.x, a[13] = e.y, a[14] = e.z) : (a[12] = e, a[13] = i, a[14] = s), this;
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
      f = e[9],
      _ = e[10],
      x = e[11],
      b = e[12],
      T = e[13],
      M = e[14],
      w = e[15],
      D = f * M * d - T * _ * d + T * h * x - c * M * x - f * h * w + c * _ * w,
      R = b * _ * d - p * M * d - b * h * x + l * M * x + p * h * w - l * _ * w,
      P = p * T * d - b * f * d + b * c * x - l * T * x - p * c * w + l * f * w,
      U = b * f * h - p * T * h - b * c * _ + l * T * _ + p * c * M - l * f * M,
      O = i * D + s * R + a * P + o * U;
    if (O === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    const N = 1 / O;
    return e[0] = D * N, e[1] = (T * _ * o - f * M * o - T * a * x + s * M * x + f * a * w - s * _ * w) * N, e[2] = (c * M * o - T * h * o + T * a * d - s * M * d - c * a * w + s * h * w) * N, e[3] = (f * h * o - c * _ * o - f * a * d + s * _ * d + c * a * x - s * h * x) * N, e[4] = R * N, e[5] = (p * M * o - b * _ * o + b * a * x - i * M * x - p * a * w + i * _ * w) * N, e[6] = (b * h * o - l * M * o - b * a * d + i * M * d + l * a * w - i * h * w) * N, e[7] = (l * _ * o - p * h * o + p * a * d - i * _ * d - l * a * x + i * h * x) * N, e[8] = P * N, e[9] = (b * f * o - p * T * o - b * s * x + i * T * x + p * s * w - i * f * w) * N, e[10] = (l * T * o - b * c * o + b * s * d - i * T * d - l * s * w + i * c * w) * N, e[11] = (p * c * o - l * f * o - p * s * d + i * f * d + l * s * x - i * c * x) * N, e[12] = U * N, e[13] = (p * T * a - b * f * a + b * s * _ - i * T * _ - p * s * M + i * f * M) * N, e[14] = (b * c * a - l * T * a - b * s * h + i * T * h + l * s * M - i * c * M) * N, e[15] = (l * f * a - p * c * a + p * s * h - i * f * h - l * s * _ + i * c * _) * N, this;
  }
  scale(e) {
    const i = this.elements,
      s = e.x,
      a = e.y,
      o = e.z;
    return i[0] *= s, i[4] *= a, i[8] *= o, i[1] *= s, i[5] *= a, i[9] *= o, i[2] *= s, i[6] *= a, i[10] *= o, i[3] *= s, i[7] *= a, i[11] *= o, this;
  }
  getMaxScaleOnAxis() {
    const e = this.elements,
      i = e[0] * e[0] + e[1] * e[1] + e[2] * e[2],
      s = e[4] * e[4] + e[5] * e[5] + e[6] * e[6],
      a = e[8] * e[8] + e[9] * e[9] + e[10] * e[10];
    return Math.sqrt(Math.max(i, s, a));
  }
  makeTranslation(e, i, s) {
    return e.isVector3 ? this.set(1, 0, 0, e.x, 0, 1, 0, e.y, 0, 0, 1, e.z, 0, 0, 0, 1) : this.set(1, 0, 0, e, 0, 1, 0, i, 0, 0, 1, s, 0, 0, 0, 1), this;
  }
  makeRotationX(e) {
    const i = Math.cos(e),
      s = Math.sin(e);
    return this.set(1, 0, 0, 0, 0, i, -s, 0, 0, s, i, 0, 0, 0, 0, 1), this;
  }
  makeRotationY(e) {
    const i = Math.cos(e),
      s = Math.sin(e);
    return this.set(i, 0, s, 0, 0, 1, 0, 0, -s, 0, i, 0, 0, 0, 0, 1), this;
  }
  makeRotationZ(e) {
    const i = Math.cos(e),
      s = Math.sin(e);
    return this.set(i, -s, 0, 0, s, i, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this;
  }
  makeRotationAxis(e, i) {
    const s = Math.cos(i),
      a = Math.sin(i),
      o = 1 - s,
      l = e.x,
      c = e.y,
      h = e.z,
      d = o * l,
      p = o * c;
    return this.set(d * l + s, d * c - a * h, d * h + a * c, 0, d * c + a * h, p * c + s, p * h - a * l, 0, d * h - a * c, p * h + a * l, o * h * h + s, 0, 0, 0, 0, 1), this;
  }
  makeScale(e, i, s) {
    return this.set(e, 0, 0, 0, 0, i, 0, 0, 0, 0, s, 0, 0, 0, 0, 1), this;
  }
  makeShear(e, i, s, a, o, l) {
    return this.set(1, s, o, 0, e, 1, l, 0, i, a, 1, 0, 0, 0, 0, 1), this;
  }
  compose(e, i, s) {
    const a = this.elements,
      o = i._x,
      l = i._y,
      c = i._z,
      h = i._w,
      d = o + o,
      p = l + l,
      f = c + c,
      _ = o * d,
      x = o * p,
      b = o * f,
      T = l * p,
      M = l * f,
      w = c * f,
      D = h * d,
      R = h * p,
      P = h * f,
      U = s.x,
      O = s.y,
      N = s.z;
    return a[0] = (1 - (T + w)) * U, a[1] = (x + P) * U, a[2] = (b - R) * U, a[3] = 0, a[4] = (x - P) * O, a[5] = (1 - (_ + w)) * O, a[6] = (M + D) * O, a[7] = 0, a[8] = (b + R) * N, a[9] = (M - D) * N, a[10] = (1 - (_ + T)) * N, a[11] = 0, a[12] = e.x, a[13] = e.y, a[14] = e.z, a[15] = 1, this;
  }
  decompose(e, i, s) {
    const a = this.elements;
    let o = scope._v1$5$1.set(a[0], a[1], a[2]).length();
    const l = scope._v1$5$1.set(a[4], a[5], a[6]).length(),
      c = scope._v1$5$1.set(a[8], a[9], a[10]).length();
    this.determinant() < 0 && (o = -o), e.x = a[12], e.y = a[13], e.z = a[14], scope._m1$2.copy(this);
    const d = 1 / o,
      p = 1 / l,
      f = 1 / c;
    return scope._m1$2.elements[0] *= d, scope._m1$2.elements[1] *= d, scope._m1$2.elements[2] *= d, scope._m1$2.elements[4] *= p, scope._m1$2.elements[5] *= p, scope._m1$2.elements[6] *= p, scope._m1$2.elements[8] *= f, scope._m1$2.elements[9] *= f, scope._m1$2.elements[10] *= f, i.setFromRotationMatrix(scope._m1$2), s.x = o, s.y = l, s.z = c, this;
  }
  makePerspective(e, i, s, a, o, l, c = scope.WebGLCoordinateSystem, h = !1) {
    const d = this.elements,
      p = 2 * o / (i - e),
      f = 2 * o / (s - a),
      _ = (i + e) / (i - e),
      x = (s + a) / (s - a);
    let b, T;
    if (h) b = o / (l - o), T = l * o / (l - o);else if (c === scope.WebGLCoordinateSystem) b = -(l + o) / (l - o), T = -2 * l * o / (l - o);else if (c === scope.WebGPUCoordinateSystem) b = -l / (l - o), T = -l * o / (l - o);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + c);
    return d[0] = p, d[4] = 0, d[8] = _, d[12] = 0, d[1] = 0, d[5] = f, d[9] = x, d[13] = 0, d[2] = 0, d[6] = 0, d[10] = b, d[14] = T, d[3] = 0, d[7] = 0, d[11] = -1, d[15] = 0, this;
  }
  makeOrthographic(e, i, s, a, o, l, c = scope.WebGLCoordinateSystem, h = !1) {
    const d = this.elements,
      p = 2 / (i - e),
      f = 2 / (s - a),
      _ = -(i + e) / (i - e),
      x = -(s + a) / (s - a);
    let b, T;
    if (h) b = 1 / (l - o), T = l / (l - o);else if (c === scope.WebGLCoordinateSystem) b = -2 / (l - o), T = -(l + o) / (l - o);else if (c === scope.WebGPUCoordinateSystem) b = -1 / (l - o), T = -o / (l - o);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + c);
    return d[0] = p, d[4] = 0, d[8] = 0, d[12] = _, d[1] = 0, d[5] = f, d[9] = 0, d[13] = x, d[2] = 0, d[6] = 0, d[10] = b, d[14] = T, d[3] = 0, d[7] = 0, d[11] = 0, d[15] = 1, this;
  }
  equals(e) {
    const i = this.elements,
      s = e.elements;
    for (let a = 0; a < 16; a++) if (i[a] !== s[a]) return !1;
    return !0;
  }
  fromArray(e, i = 0) {
    for (let s = 0; s < 16; s++) this.elements[s] = e[s + i];
    return this;
  }
  toArray(e = [], i = 0) {
    const s = this.elements;
    return e[i] = s[0], e[i + 1] = s[1], e[i + 2] = s[2], e[i + 3] = s[3], e[i + 4] = s[4], e[i + 5] = s[5], e[i + 6] = s[6], e[i + 7] = s[7], e[i + 8] = s[8], e[i + 9] = s[9], e[i + 10] = s[10], e[i + 11] = s[11], e[i + 12] = s[12], e[i + 13] = s[13], e[i + 14] = s[14], e[i + 15] = s[15], e;
  }
};
}
