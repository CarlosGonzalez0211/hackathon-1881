/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 229831:230523.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0646(scope) {
scope.QuadraticBezierCurve3 = class QuadraticBezierCurve3 extends scope.Curve {
  constructor(e = new scope.Vector3(), i = new scope.Vector3(), s = new scope.Vector3()) {
    super(), this.isQuadraticBezierCurve3 = !0, this.type = "QuadraticBezierCurve3", this.v0 = e, this.v1 = i, this.v2 = s;
  }
  getPoint(e, i = new scope.Vector3()) {
    const s = i,
      a = this.v0,
      o = this.v1,
      l = this.v2;
    return s.set(scope.QuadraticBezier(e, a.x, o.x, l.x), scope.QuadraticBezier(e, a.y, o.y, l.y), scope.QuadraticBezier(e, a.z, o.z, l.z)), s;
  }
  copy(e) {
    return super.copy(e), this.v0.copy(e.v0), this.v1.copy(e.v1), this.v2.copy(e.v2), this;
  }
  toJSON() {
    const e = super.toJSON();
    return e.v0 = this.v0.toArray(), e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e;
  }
  fromJSON(e) {
    return super.fromJSON(e), this.v0.fromArray(e.v0), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this;
  }
};
}
