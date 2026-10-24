/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 34944:38370.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0367(scope) {
scope.Vector2 = class Vector2 {
  constructor(e = 0, i = 0) {
    scope.Vector2.prototype.isVector2 = !0, this.x = e, this.y = i;
  }
  get width() {
    return this.x;
  }
  set width(e) {
    this.x = e;
  }
  get height() {
    return this.y;
  }
  set height(e) {
    this.y = e;
  }
  set(e, i) {
    return this.x = e, this.y = i, this;
  }
  setScalar(e) {
    return this.x = e, this.y = e, this;
  }
  setX(e) {
    return this.x = e, this;
  }
  setY(e) {
    return this.y = e, this;
  }
  setComponent(e, i) {
    switch (e) {
      case 0:
        this.x = i;
        break;
      case 1:
        this.y = i;
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
      default:
        throw new Error("index is out of range: " + e);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y);
  }
  copy(e) {
    return this.x = e.x, this.y = e.y, this;
  }
  add(e) {
    return this.x += e.x, this.y += e.y, this;
  }
  addScalar(e) {
    return this.x += e, this.y += e, this;
  }
  addVectors(e, i) {
    return this.x = e.x + i.x, this.y = e.y + i.y, this;
  }
  addScaledVector(e, i) {
    return this.x += e.x * i, this.y += e.y * i, this;
  }
  sub(e) {
    return this.x -= e.x, this.y -= e.y, this;
  }
  subScalar(e) {
    return this.x -= e, this.y -= e, this;
  }
  subVectors(e, i) {
    return this.x = e.x - i.x, this.y = e.y - i.y, this;
  }
  multiply(e) {
    return this.x *= e.x, this.y *= e.y, this;
  }
  multiplyScalar(e) {
    return this.x *= e, this.y *= e, this;
  }
  divide(e) {
    return this.x /= e.x, this.y /= e.y, this;
  }
  divideScalar(e) {
    return this.multiplyScalar(1 / e);
  }
  applyMatrix3(e) {
    const i = this.x,
      s = this.y,
      a = e.elements;
    return this.x = a[0] * i + a[3] * s + a[6], this.y = a[1] * i + a[4] * s + a[7], this;
  }
  min(e) {
    return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this;
  }
  max(e) {
    return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this;
  }
  clamp(e, i) {
    return this.x = scope.clamp(this.x, e.x, i.x), this.y = scope.clamp(this.y, e.y, i.y), this;
  }
  clampScalar(e, i) {
    return this.x = scope.clamp(this.x, e, i), this.y = scope.clamp(this.y, e, i), this;
  }
  clampLength(e, i) {
    const s = this.length();
    return this.divideScalar(s || 1).multiplyScalar(scope.clamp(s, e, i));
  }
  floor() {
    return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this;
  }
  ceil() {
    return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this;
  }
  round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this;
  }
  roundToZero() {
    return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this;
  }
  negate() {
    return this.x = -this.x, this.y = -this.y, this;
  }
  dot(e) {
    return this.x * e.x + this.y * e.y;
  }
  cross(e) {
    return this.x * e.y - this.y * e.x;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  angle() {
    return Math.atan2(-this.y, -this.x) + Math.PI;
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
      s = this.y - e.y;
    return i * i + s * s;
  }
  manhattanDistanceTo(e) {
    return Math.abs(this.x - e.x) + Math.abs(this.y - e.y);
  }
  setLength(e) {
    return this.normalize().multiplyScalar(e);
  }
  lerp(e, i) {
    return this.x += (e.x - this.x) * i, this.y += (e.y - this.y) * i, this;
  }
  lerpVectors(e, i, s) {
    return this.x = e.x + (i.x - e.x) * s, this.y = e.y + (i.y - e.y) * s, this;
  }
  equals(e) {
    return e.x === this.x && e.y === this.y;
  }
  fromArray(e, i = 0) {
    return this.x = e[i], this.y = e[i + 1], this;
  }
  toArray(e = [], i = 0) {
    return e[i] = this.x, e[i + 1] = this.y, e;
  }
  fromBufferAttribute(e, i) {
    return this.x = e.getX(i), this.y = e.getY(i), this;
  }
  rotateAround(e, i) {
    const s = Math.cos(i),
      a = Math.sin(i),
      o = this.x - e.x,
      l = this.y - e.y;
    return this.x = o * s - l * a + e.x, this.y = o * a + l * s + e.y, this;
  }
  random() {
    return this.x = Math.random(), this.y = Math.random(), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y;
  }
};
}
