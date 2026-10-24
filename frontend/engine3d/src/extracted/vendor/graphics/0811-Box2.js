/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 319692:321535.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0811(scope) {
scope.Box2 = class Box2 {
  constructor(e = new scope.Vector2(1 / 0, 1 / 0), i = new scope.Vector2(-1 / 0, -1 / 0)) {
    this.isBox2 = !0, this.min = e, this.max = i;
  }
  set(e, i) {
    return this.min.copy(e), this.max.copy(i), this;
  }
  setFromPoints(e) {
    this.makeEmpty();
    for (let i = 0, s = e.length; i < s; i++) this.expandByPoint(e[i]);
    return this;
  }
  setFromCenterAndSize(e, i) {
    const s = scope._vector$4.copy(i).multiplyScalar(.5);
    return this.min.copy(e).sub(s), this.max.copy(e).add(s), this;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    return this.min.copy(e.min), this.max.copy(e.max), this;
  }
  makeEmpty() {
    return this.min.x = this.min.y = 1 / 0, this.max.x = this.max.y = -1 / 0, this;
  }
  isEmpty() {
    return this.max.x < this.min.x || this.max.y < this.min.y;
  }
  getCenter(e) {
    return this.isEmpty() ? e.set(0, 0) : e.addVectors(this.min, this.max).multiplyScalar(.5);
  }
  getSize(e) {
    return this.isEmpty() ? e.set(0, 0) : e.subVectors(this.max, this.min);
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
  containsPoint(e) {
    return e.x >= this.min.x && e.x <= this.max.x && e.y >= this.min.y && e.y <= this.max.y;
  }
  containsBox(e) {
    return this.min.x <= e.min.x && e.max.x <= this.max.x && this.min.y <= e.min.y && e.max.y <= this.max.y;
  }
  getParameter(e, i) {
    return i.set((e.x - this.min.x) / (this.max.x - this.min.x), (e.y - this.min.y) / (this.max.y - this.min.y));
  }
  intersectsBox(e) {
    return e.max.x >= this.min.x && e.min.x <= this.max.x && e.max.y >= this.min.y && e.min.y <= this.max.y;
  }
  clampPoint(e, i) {
    return i.copy(e).clamp(this.min, this.max);
  }
  distanceToPoint(e) {
    return this.clampPoint(e, scope._vector$4).distanceTo(e);
  }
  intersect(e) {
    return this.min.max(e.min), this.max.min(e.max), this.isEmpty() && this.makeEmpty(), this;
  }
  union(e) {
    return this.min.min(e.min), this.max.max(e.max), this;
  }
  translate(e) {
    return this.min.add(e), this.max.add(e), this;
  }
  equals(e) {
    return e.min.equals(this.min) && e.max.equals(this.max);
  }
};
}
