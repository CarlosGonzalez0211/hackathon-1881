/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 228483:229173.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0644(scope) {
scope.LineCurve3 = class LineCurve3 extends scope.Curve {
  constructor(e = new scope.Vector3(), i = new scope.Vector3()) {
    super(), this.isLineCurve3 = !0, this.type = "LineCurve3", this.v1 = e, this.v2 = i;
  }
  getPoint(e, i = new scope.Vector3()) {
    const s = i;
    return e === 1 ? s.copy(this.v2) : (s.copy(this.v2).sub(this.v1), s.multiplyScalar(e).add(this.v1)), s;
  }
  getPointAt(e, i) {
    return this.getPoint(e, i);
  }
  getTangent(e, i = new scope.Vector3()) {
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
