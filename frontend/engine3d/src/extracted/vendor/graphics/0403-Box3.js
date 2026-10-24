/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 73905:79084.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0403(scope) {
scope.Box3 = class Box3 {
  constructor(e = new scope.Vector3(1 / 0, 1 / 0, 1 / 0), i = new scope.Vector3(-1 / 0, -1 / 0, -1 / 0)) {
    this.isBox3 = !0, this.min = e, this.max = i;
  }
  set(e, i) {
    return this.min.copy(e), this.max.copy(i), this;
  }
  setFromArray(e) {
    this.makeEmpty();
    for (let i = 0, s = e.length; i < s; i += 3) this.expandByPoint(scope._vector$b.fromArray(e, i));
    return this;
  }
  setFromBufferAttribute(e) {
    this.makeEmpty();
    for (let i = 0, s = e.count; i < s; i++) this.expandByPoint(scope._vector$b.fromBufferAttribute(e, i));
    return this;
  }
  setFromPoints(e) {
    this.makeEmpty();
    for (let i = 0, s = e.length; i < s; i++) this.expandByPoint(e[i]);
    return this;
  }
  setFromCenterAndSize(e, i) {
    const s = scope._vector$b.copy(i).multiplyScalar(.5);
    return this.min.copy(e).sub(s), this.max.copy(e).add(s), this;
  }
  setFromObject(e, i = !1) {
    return this.makeEmpty(), this.expandByObject(e, i);
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    return this.min.copy(e.min), this.max.copy(e.max), this;
  }
  makeEmpty() {
    return this.min.x = this.min.y = this.min.z = 1 / 0, this.max.x = this.max.y = this.max.z = -1 / 0, this;
  }
  isEmpty() {
    return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
  }
  getCenter(e) {
    return this.isEmpty() ? e.set(0, 0, 0) : e.addVectors(this.min, this.max).multiplyScalar(.5);
  }
  getSize(e) {
    return this.isEmpty() ? e.set(0, 0, 0) : e.subVectors(this.max, this.min);
  }
  expandByPoint(e) {
    return this.min.min(e), this.max.max(e), this;
  }
  expandByVector(e) {
    return this.min.sub(e), this.max.add(e), this;
  }
  expandByScalar(e) {
    return this.min.addScalar(-e), this.max.addScalar(e), this;
  }
  expandByObject(e, i = !1) {
    e.updateWorldMatrix(!1, !1);
    const s = e.geometry;
    if (s !== void 0) {
      const o = s.getAttribute("position");
      if (i === !0 && o !== void 0 && e.isInstancedMesh !== !0) for (let l = 0, c = o.count; l < c; l++) e.isMesh === !0 ? e.getVertexPosition(l, scope._vector$b) : scope._vector$b.fromBufferAttribute(o, l), scope._vector$b.applyMatrix4(e.matrixWorld), this.expandByPoint(scope._vector$b);else e.boundingBox !== void 0 ? (e.boundingBox === null && e.computeBoundingBox(), scope._box$4.copy(e.boundingBox)) : (s.boundingBox === null && s.computeBoundingBox(), scope._box$4.copy(s.boundingBox)), scope._box$4.applyMatrix4(e.matrixWorld), this.union(scope._box$4);
    }
    const a = e.children;
    for (let o = 0, l = a.length; o < l; o++) this.expandByObject(a[o], i);
    return this;
  }
  containsPoint(e) {
    return e.x >= this.min.x && e.x <= this.max.x && e.y >= this.min.y && e.y <= this.max.y && e.z >= this.min.z && e.z <= this.max.z;
  }
  containsBox(e) {
    return this.min.x <= e.min.x && e.max.x <= this.max.x && this.min.y <= e.min.y && e.max.y <= this.max.y && this.min.z <= e.min.z && e.max.z <= this.max.z;
  }
  getParameter(e, i) {
    return i.set((e.x - this.min.x) / (this.max.x - this.min.x), (e.y - this.min.y) / (this.max.y - this.min.y), (e.z - this.min.z) / (this.max.z - this.min.z));
  }
  intersectsBox(e) {
    return e.max.x >= this.min.x && e.min.x <= this.max.x && e.max.y >= this.min.y && e.min.y <= this.max.y && e.max.z >= this.min.z && e.min.z <= this.max.z;
  }
  intersectsSphere(e) {
    return this.clampPoint(e.center, scope._vector$b), scope._vector$b.distanceToSquared(e.center) <= e.radius * e.radius;
  }
  intersectsPlane(e) {
    let i, s;
    return e.normal.x > 0 ? (i = e.normal.x * this.min.x, s = e.normal.x * this.max.x) : (i = e.normal.x * this.max.x, s = e.normal.x * this.min.x), e.normal.y > 0 ? (i += e.normal.y * this.min.y, s += e.normal.y * this.max.y) : (i += e.normal.y * this.max.y, s += e.normal.y * this.min.y), e.normal.z > 0 ? (i += e.normal.z * this.min.z, s += e.normal.z * this.max.z) : (i += e.normal.z * this.max.z, s += e.normal.z * this.min.z), i <= -e.constant && s >= -e.constant;
  }
  intersectsTriangle(e) {
    if (this.isEmpty()) return !1;
    this.getCenter(scope._center), scope._extents.subVectors(this.max, scope._center), scope._v0$2$1.subVectors(e.a, scope._center), scope._v1$7$1.subVectors(e.b, scope._center), scope._v2$4$1.subVectors(e.c, scope._center), scope._f0.subVectors(scope._v1$7$1, scope._v0$2$1), scope._f1.subVectors(scope._v2$4$1, scope._v1$7$1), scope._f2.subVectors(scope._v0$2$1, scope._v2$4$1);
    let i = [0, -scope._f0.z, scope._f0.y, 0, -scope._f1.z, scope._f1.y, 0, -scope._f2.z, scope._f2.y, scope._f0.z, 0, -scope._f0.x, scope._f1.z, 0, -scope._f1.x, scope._f2.z, 0, -scope._f2.x, -scope._f0.y, scope._f0.x, 0, -scope._f1.y, scope._f1.x, 0, -scope._f2.y, scope._f2.x, 0];
    return !scope.satForAxes(i, scope._v0$2$1, scope._v1$7$1, scope._v2$4$1, scope._extents) || (i = [1, 0, 0, 0, 1, 0, 0, 0, 1], !scope.satForAxes(i, scope._v0$2$1, scope._v1$7$1, scope._v2$4$1, scope._extents)) ? !1 : (scope._triangleNormal.crossVectors(scope._f0, scope._f1), i = [scope._triangleNormal.x, scope._triangleNormal.y, scope._triangleNormal.z], scope.satForAxes(i, scope._v0$2$1, scope._v1$7$1, scope._v2$4$1, scope._extents));
  }
  clampPoint(e, i) {
    return i.copy(e).clamp(this.min, this.max);
  }
  distanceToPoint(e) {
    return this.clampPoint(e, scope._vector$b).distanceTo(e);
  }
  getBoundingSphere(e) {
    return this.isEmpty() ? e.makeEmpty() : (this.getCenter(e.center), e.radius = this.getSize(scope._vector$b).length() * .5), e;
  }
  intersect(e) {
    return this.min.max(e.min), this.max.min(e.max), this.isEmpty() && this.makeEmpty(), this;
  }
  union(e) {
    return this.min.min(e.min), this.max.max(e.max), this;
  }
  applyMatrix4(e) {
    return this.isEmpty() ? this : (scope._points[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(e), scope._points[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(e), scope._points[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(e), scope._points[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(e), scope._points[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(e), scope._points[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(e), scope._points[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(e), scope._points[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(e), this.setFromPoints(scope._points), this);
  }
  translate(e) {
    return this.min.add(e), this.max.add(e), this;
  }
  equals(e) {
    return e.min.equals(this.min) && e.max.equals(this.max);
  }
  toJSON() {
    return {
      min: this.min.toArray(),
      max: this.max.toArray()
    };
  }
  fromJSON(e) {
    return this.min.fromArray(e.min), this.max.fromArray(e.max), this;
  }
};
}
