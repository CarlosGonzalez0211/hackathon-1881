/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 95229:97876.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0440(scope) {
scope.Euler = class Euler {
  constructor(e = 0, i = 0, s = 0, a = scope.Euler.DEFAULT_ORDER) {
    this.isEuler = !0, this._x = e, this._y = i, this._z = s, this._order = a;
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
  get order() {
    return this._order;
  }
  set order(e) {
    this._order = e, this._onChangeCallback();
  }
  set(e, i, s, a = this._order) {
    return this._x = e, this._y = i, this._z = s, this._order = a, this._onChangeCallback(), this;
  }
  clone() {
    return new this.constructor(this._x, this._y, this._z, this._order);
  }
  copy(e) {
    return this._x = e._x, this._y = e._y, this._z = e._z, this._order = e._order, this._onChangeCallback(), this;
  }
  setFromRotationMatrix(e, i = this._order, s = !0) {
    const a = e.elements,
      o = a[0],
      l = a[4],
      c = a[8],
      h = a[1],
      d = a[5],
      p = a[9],
      f = a[2],
      _ = a[6],
      x = a[10];
    switch (i) {
      case "XYZ":
        this._y = Math.asin(scope.clamp(c, -1, 1)), Math.abs(c) < .9999999 ? (this._x = Math.atan2(-p, x), this._z = Math.atan2(-l, o)) : (this._x = Math.atan2(_, d), this._z = 0);
        break;
      case "YXZ":
        this._x = Math.asin(-scope.clamp(p, -1, 1)), Math.abs(p) < .9999999 ? (this._y = Math.atan2(c, x), this._z = Math.atan2(h, d)) : (this._y = Math.atan2(-f, o), this._z = 0);
        break;
      case "ZXY":
        this._x = Math.asin(scope.clamp(_, -1, 1)), Math.abs(_) < .9999999 ? (this._y = Math.atan2(-f, x), this._z = Math.atan2(-l, d)) : (this._y = 0, this._z = Math.atan2(h, o));
        break;
      case "ZYX":
        this._y = Math.asin(-scope.clamp(f, -1, 1)), Math.abs(f) < .9999999 ? (this._x = Math.atan2(_, x), this._z = Math.atan2(h, o)) : (this._x = 0, this._z = Math.atan2(-l, d));
        break;
      case "YZX":
        this._z = Math.asin(scope.clamp(h, -1, 1)), Math.abs(h) < .9999999 ? (this._x = Math.atan2(-p, d), this._y = Math.atan2(-f, o)) : (this._x = 0, this._y = Math.atan2(c, x));
        break;
      case "XZY":
        this._z = Math.asin(-scope.clamp(l, -1, 1)), Math.abs(l) < .9999999 ? (this._x = Math.atan2(_, d), this._y = Math.atan2(c, o)) : (this._x = Math.atan2(-p, x), this._y = 0);
        break;
      default:
        console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: " + i);
    }
    return this._order = i, s === !0 && this._onChangeCallback(), this;
  }
  setFromQuaternion(e, i, s) {
    return scope._matrix$2.makeRotationFromQuaternion(e), this.setFromRotationMatrix(scope._matrix$2, i, s);
  }
  setFromVector3(e, i = this._order) {
    return this.set(e.x, e.y, e.z, i);
  }
  reorder(e) {
    return scope._quaternion$3.setFromEuler(this), this.setFromQuaternion(scope._quaternion$3, e);
  }
  equals(e) {
    return e._x === this._x && e._y === this._y && e._z === this._z && e._order === this._order;
  }
  fromArray(e) {
    return this._x = e[0], this._y = e[1], this._z = e[2], e[3] !== void 0 && (this._order = e[3]), this._onChangeCallback(), this;
  }
  toArray(e = [], i = 0) {
    return e[i] = this._x, e[i + 1] = this._y, e[i + 2] = this._z, e[i + 3] = this._order, e;
  }
  _onChange(e) {
    return this._onChangeCallback = e, this;
  }
  _onChangeCallback() {}
  *[Symbol.iterator]() {
    yield this._x, yield this._y, yield this._z, yield this._order;
  }
};
}
