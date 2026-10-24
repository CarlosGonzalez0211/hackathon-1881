/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 79796:82014.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0421(scope) {
scope.Sphere = class Sphere {
  constructor(e = new scope.Vector3(), i = -1) {
    this.isSphere = !0, this.center = e, this.radius = i;
  }
  set(e, i) {
    return this.center.copy(e), this.radius = i, this;
  }
  setFromPoints(e, i) {
    const s = this.center;
    i !== void 0 ? s.copy(i) : scope._box$3.setFromPoints(e).getCenter(s);
    let a = 0;
    for (let o = 0, l = e.length; o < l; o++) a = Math.max(a, s.distanceToSquared(e[o]));
    return this.radius = Math.sqrt(a), this;
  }
  copy(e) {
    return this.center.copy(e.center), this.radius = e.radius, this;
  }
  isEmpty() {
    return this.radius < 0;
  }
  makeEmpty() {
    return this.center.set(0, 0, 0), this.radius = -1, this;
  }
  containsPoint(e) {
    return e.distanceToSquared(this.center) <= this.radius * this.radius;
  }
  distanceToPoint(e) {
    return e.distanceTo(this.center) - this.radius;
  }
  intersectsSphere(e) {
    const i = this.radius + e.radius;
    return e.center.distanceToSquared(this.center) <= i * i;
  }
  intersectsBox(e) {
    return e.intersectsSphere(this);
  }
  intersectsPlane(e) {
    return Math.abs(e.distanceToPoint(this.center)) <= this.radius;
  }
  clampPoint(e, i) {
    const s = this.center.distanceToSquared(e);
    return i.copy(e), s > this.radius * this.radius && (i.sub(this.center).normalize(), i.multiplyScalar(this.radius).add(this.center)), i;
  }
  getBoundingBox(e) {
    return this.isEmpty() ? (e.makeEmpty(), e) : (e.set(this.center, this.center), e.expandByScalar(this.radius), e);
  }
  applyMatrix4(e) {
    return this.center.applyMatrix4(e), this.radius = this.radius * e.getMaxScaleOnAxis(), this;
  }
  translate(e) {
    return this.center.add(e), this;
  }
  expandByPoint(e) {
    if (this.isEmpty()) return this.center.copy(e), this.radius = 0, this;
    scope._v1$6$1.subVectors(e, this.center);
    const i = scope._v1$6$1.lengthSq();
    if (i > this.radius * this.radius) {
      const s = Math.sqrt(i),
        a = (s - this.radius) * .5;
      this.center.addScaledVector(scope._v1$6$1, a / s), this.radius += a;
    }
    return this;
  }
  union(e) {
    return e.isEmpty() ? this : this.isEmpty() ? (this.copy(e), this) : (this.center.equals(e.center) === !0 ? this.radius = Math.max(this.radius, e.radius) : (scope._v2$3$1.subVectors(e.center, this.center).setLength(e.radius), this.expandByPoint(scope._v1$6$1.copy(e.center).add(scope._v2$3$1)), this.expandByPoint(scope._v1$6$1.copy(e.center).sub(scope._v2$3$1))), this);
  }
  equals(e) {
    return e.center.equals(this.center) && e.radius === this.radius;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  toJSON() {
    return {
      radius: this.radius,
      center: this.center.toArray()
    };
  }
  fromJSON(e) {
    return this.radius = e.radius, this.center.fromArray(e.center), this;
  }
};
}
