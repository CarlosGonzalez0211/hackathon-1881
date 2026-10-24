/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 44201:50679.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0369(scope) {
scope.Vector3 = class Vector3 {
  constructor(e = 0, i = 0, s = 0) {
    scope.Vector3.prototype.isVector3 = !0, this.x = e, this.y = i, this.z = s;
  }
  set(e, i, s) {
    return s === void 0 && (s = this.z), this.x = e, this.y = i, this.z = s, this;
  }
  setScalar(e) {
    return this.x = e, this.y = e, this.z = e, this;
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
      default:
        throw new Error("index is out of range: " + e);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y, this.z);
  }
  copy(e) {
    return this.x = e.x, this.y = e.y, this.z = e.z, this;
  }
  add(e) {
    return this.x += e.x, this.y += e.y, this.z += e.z, this;
  }
  addScalar(e) {
    return this.x += e, this.y += e, this.z += e, this;
  }
  addVectors(e, i) {
    return this.x = e.x + i.x, this.y = e.y + i.y, this.z = e.z + i.z, this;
  }
  addScaledVector(e, i) {
    return this.x += e.x * i, this.y += e.y * i, this.z += e.z * i, this;
  }
  sub(e) {
    return this.x -= e.x, this.y -= e.y, this.z -= e.z, this;
  }
  subScalar(e) {
    return this.x -= e, this.y -= e, this.z -= e, this;
  }
  subVectors(e, i) {
    return this.x = e.x - i.x, this.y = e.y - i.y, this.z = e.z - i.z, this;
  }
  multiply(e) {
    return this.x *= e.x, this.y *= e.y, this.z *= e.z, this;
  }
  multiplyScalar(e) {
    return this.x *= e, this.y *= e, this.z *= e, this;
  }
  multiplyVectors(e, i) {
    return this.x = e.x * i.x, this.y = e.y * i.y, this.z = e.z * i.z, this;
  }
  applyEuler(e) {
    return this.applyQuaternion(scope._quaternion$4.setFromEuler(e));
  }
  applyAxisAngle(e, i) {
    return this.applyQuaternion(scope._quaternion$4.setFromAxisAngle(e, i));
  }
  applyMatrix3(e) {
    const i = this.x,
      s = this.y,
      a = this.z,
      o = e.elements;
    return this.x = o[0] * i + o[3] * s + o[6] * a, this.y = o[1] * i + o[4] * s + o[7] * a, this.z = o[2] * i + o[5] * s + o[8] * a, this;
  }
  applyNormalMatrix(e) {
    return this.applyMatrix3(e).normalize();
  }
  applyMatrix4(e) {
    const i = this.x,
      s = this.y,
      a = this.z,
      o = e.elements,
      l = 1 / (o[3] * i + o[7] * s + o[11] * a + o[15]);
    return this.x = (o[0] * i + o[4] * s + o[8] * a + o[12]) * l, this.y = (o[1] * i + o[5] * s + o[9] * a + o[13]) * l, this.z = (o[2] * i + o[6] * s + o[10] * a + o[14]) * l, this;
  }
  applyQuaternion(e) {
    const i = this.x,
      s = this.y,
      a = this.z,
      o = e.x,
      l = e.y,
      c = e.z,
      h = e.w,
      d = 2 * (l * a - c * s),
      p = 2 * (c * i - o * a),
      f = 2 * (o * s - l * i);
    return this.x = i + h * d + l * f - c * p, this.y = s + h * p + c * d - o * f, this.z = a + h * f + o * p - l * d, this;
  }
  project(e) {
    return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix);
  }
  unproject(e) {
    return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld);
  }
  transformDirection(e) {
    const i = this.x,
      s = this.y,
      a = this.z,
      o = e.elements;
    return this.x = o[0] * i + o[4] * s + o[8] * a, this.y = o[1] * i + o[5] * s + o[9] * a, this.z = o[2] * i + o[6] * s + o[10] * a, this.normalize();
  }
  divide(e) {
    return this.x /= e.x, this.y /= e.y, this.z /= e.z, this;
  }
  divideScalar(e) {
    return this.multiplyScalar(1 / e);
  }
  min(e) {
    return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this.z = Math.min(this.z, e.z), this;
  }
  max(e) {
    return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this.z = Math.max(this.z, e.z), this;
  }
  clamp(e, i) {
    return this.x = scope.clamp(this.x, e.x, i.x), this.y = scope.clamp(this.y, e.y, i.y), this.z = scope.clamp(this.z, e.z, i.z), this;
  }
  clampScalar(e, i) {
    return this.x = scope.clamp(this.x, e, i), this.y = scope.clamp(this.y, e, i), this.z = scope.clamp(this.z, e, i), this;
  }
  clampLength(e, i) {
    const s = this.length();
    return this.divideScalar(s || 1).multiplyScalar(scope.clamp(s, e, i));
  }
  floor() {
    return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this;
  }
  ceil() {
    return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this;
  }
  round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this;
  }
  roundToZero() {
    return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this;
  }
  negate() {
    return this.x = -this.x, this.y = -this.y, this.z = -this.z, this;
  }
  dot(e) {
    return this.x * e.x + this.y * e.y + this.z * e.z;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  setLength(e) {
    return this.normalize().multiplyScalar(e);
  }
  lerp(e, i) {
    return this.x += (e.x - this.x) * i, this.y += (e.y - this.y) * i, this.z += (e.z - this.z) * i, this;
  }
  lerpVectors(e, i, s) {
    return this.x = e.x + (i.x - e.x) * s, this.y = e.y + (i.y - e.y) * s, this.z = e.z + (i.z - e.z) * s, this;
  }
  cross(e) {
    return this.crossVectors(this, e);
  }
  crossVectors(e, i) {
    const s = e.x,
      a = e.y,
      o = e.z,
      l = i.x,
      c = i.y,
      h = i.z;
    return this.x = a * h - o * c, this.y = o * l - s * h, this.z = s * c - a * l, this;
  }
  projectOnVector(e) {
    const i = e.lengthSq();
    if (i === 0) return this.set(0, 0, 0);
    const s = e.dot(this) / i;
    return this.copy(e).multiplyScalar(s);
  }
  projectOnPlane(e) {
    return scope._vector$c.copy(this).projectOnVector(e), this.sub(scope._vector$c);
  }
  reflect(e) {
    return this.sub(scope._vector$c.copy(e).multiplyScalar(2 * this.dot(e)));
  }
  angleTo(e) {
    const i = Math.sqrt(this.lengthSq() * e.lengthSq());
    if (i === 0) return Math.PI / 2;
    const s = this.dot(e) / i;
    return Math.acos(scope.clamp(s, -1, 1));
  }
  distanceTo(e) {
    return Math.sqrt(this.distanceToSquared(e));
  }
  distanceToSquared(e) {
    const i = this.x - e.x,
      s = this.y - e.y,
      a = this.z - e.z;
    return i * i + s * s + a * a;
  }
  manhattanDistanceTo(e) {
    return Math.abs(this.x - e.x) + Math.abs(this.y - e.y) + Math.abs(this.z - e.z);
  }
  setFromSpherical(e) {
    return this.setFromSphericalCoords(e.radius, e.phi, e.theta);
  }
  setFromSphericalCoords(e, i, s) {
    const a = Math.sin(i) * e;
    return this.x = a * Math.sin(s), this.y = Math.cos(i) * e, this.z = a * Math.cos(s), this;
  }
  setFromCylindrical(e) {
    return this.setFromCylindricalCoords(e.radius, e.theta, e.y);
  }
  setFromCylindricalCoords(e, i, s) {
    return this.x = e * Math.sin(i), this.y = s, this.z = e * Math.cos(i), this;
  }
  setFromMatrixPosition(e) {
    const i = e.elements;
    return this.x = i[12], this.y = i[13], this.z = i[14], this;
  }
  setFromMatrixScale(e) {
    const i = this.setFromMatrixColumn(e, 0).length(),
      s = this.setFromMatrixColumn(e, 1).length(),
      a = this.setFromMatrixColumn(e, 2).length();
    return this.x = i, this.y = s, this.z = a, this;
  }
  setFromMatrixColumn(e, i) {
    return this.fromArray(e.elements, i * 4);
  }
  setFromMatrix3Column(e, i) {
    return this.fromArray(e.elements, i * 3);
  }
  setFromEuler(e) {
    return this.x = e._x, this.y = e._y, this.z = e._z, this;
  }
  setFromColor(e) {
    return this.x = e.r, this.y = e.g, this.z = e.b, this;
  }
  equals(e) {
    return e.x === this.x && e.y === this.y && e.z === this.z;
  }
  fromArray(e, i = 0) {
    return this.x = e[i], this.y = e[i + 1], this.z = e[i + 2], this;
  }
  toArray(e = [], i = 0) {
    return e[i] = this.x, e[i + 1] = this.y, e[i + 2] = this.z, e;
  }
  fromBufferAttribute(e, i) {
    return this.x = e.getX(i), this.y = e.getY(i), this.z = e.getZ(i), this;
  }
  random() {
    return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this;
  }
  randomDirection() {
    const e = Math.random() * Math.PI * 2,
      i = Math.random() * 2 - 1,
      s = Math.sqrt(1 - i * i);
    return this.x = s * Math.cos(e), this.y = i, this.z = s * Math.sin(e), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y, yield this.z;
  }
};
}
