/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 186775:188613.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0568(scope) {
scope.Plane = class Plane {
  constructor(e = new scope.Vector3(1, 0, 0), i = 0) {
    this.isPlane = !0, this.normal = e, this.constant = i;
  }
  set(e, i) {
    return this.normal.copy(e), this.constant = i, this;
  }
  setComponents(e, i, s, a) {
    return this.normal.set(e, i, s), this.constant = a, this;
  }
  setFromNormalAndCoplanarPoint(e, i) {
    return this.normal.copy(e), this.constant = -i.dot(this.normal), this;
  }
  setFromCoplanarPoints(e, i, s) {
    const a = scope._vector1.subVectors(s, i).cross(scope._vector2.subVectors(e, i)).normalize();
    return this.setFromNormalAndCoplanarPoint(a, e), this;
  }
  copy(e) {
    return this.normal.copy(e.normal), this.constant = e.constant, this;
  }
  normalize() {
    const e = 1 / this.normal.length();
    return this.normal.multiplyScalar(e), this.constant *= e, this;
  }
  negate() {
    return this.constant *= -1, this.normal.negate(), this;
  }
  distanceToPoint(e) {
    return this.normal.dot(e) + this.constant;
  }
  distanceToSphere(e) {
    return this.distanceToPoint(e.center) - e.radius;
  }
  projectPoint(e, i) {
    return i.copy(e).addScaledVector(this.normal, -this.distanceToPoint(e));
  }
  intersectLine(e, i) {
    const s = e.delta(scope._vector1),
      a = this.normal.dot(s);
    if (a === 0) return this.distanceToPoint(e.start) === 0 ? i.copy(e.start) : null;
    const o = -(e.start.dot(this.normal) + this.constant) / a;
    return o < 0 || o > 1 ? null : i.copy(e.start).addScaledVector(s, o);
  }
  intersectsLine(e) {
    const i = this.distanceToPoint(e.start),
      s = this.distanceToPoint(e.end);
    return i < 0 && s > 0 || s < 0 && i > 0;
  }
  intersectsBox(e) {
    return e.intersectsPlane(this);
  }
  intersectsSphere(e) {
    return e.intersectsPlane(this);
  }
  coplanarPoint(e) {
    return e.copy(this.normal).multiplyScalar(-this.constant);
  }
  applyMatrix4(e, i) {
    const s = i || scope._normalMatrix.getNormalMatrix(e),
      a = this.coplanarPoint(scope._vector1).applyMatrix4(e),
      o = this.normal.applyMatrix3(s).normalize();
    return this.constant = -a.dot(o), this;
  }
  translate(e) {
    return this.constant -= e.dot(this.normal), this;
  }
  equals(e) {
    return e.normal.equals(this.normal) && e.constant === this.constant;
  }
  clone() {
    return new this.constructor().copy(this);
  }
};
}
