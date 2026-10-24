/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 227796:228483.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0643(scope) {
scope.LineCurve = class LineCurve extends scope.Curve {
  constructor(e = new scope.Vector2(), i = new scope.Vector2()) {
    super(), this.isLineCurve = !0, this.type = "LineCurve", this.v1 = e, this.v2 = i;
  }
  getPoint(e, i = new scope.Vector2()) {
    const s = i;
    return e === 1 ? s.copy(this.v2) : (s.copy(this.v2).sub(this.v1), s.multiplyScalar(e).add(this.v1)), s;
  }
  getPointAt(e, i) {
    return this.getPoint(e, i);
  }
  getTangent(e, i = new scope.Vector2()) {
    return i.subVectors(this.v2, this.v1).normalize();
  }
  getTangentAt(e, i) {
    return this.getTangent(e, i);
  }
  copy(e) {
    return super.copy(e), this.v1.copy(e.v1), this.v2.copy(e.v2), this;
  }
  toJSON() {
    const e = super.toJSON();
    return e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e;
  }
  fromJSON(e) {
    return super.fromJSON(e), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this;
  }
};
}
