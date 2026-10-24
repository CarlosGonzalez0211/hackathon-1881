/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 226270:227016.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0641(scope) {
scope.CubicBezierCurve = class CubicBezierCurve extends scope.Curve {
  constructor(e = new scope.Vector2(), i = new scope.Vector2(), s = new scope.Vector2(), a = new scope.Vector2()) {
    super(), this.isCubicBezierCurve = !0, this.type = "CubicBezierCurve", this.v0 = e, this.v1 = i, this.v2 = s, this.v3 = a;
  }
  getPoint(e, i = new scope.Vector2()) {
    const s = i,
      a = this.v0,
      o = this.v1,
      l = this.v2,
      c = this.v3;
    return s.set(scope.CubicBezier(e, a.x, o.x, l.x, c.x), scope.CubicBezier(e, a.y, o.y, l.y, c.y)), s;
  }
  copy(e) {
    return super.copy(e), this.v0.copy(e.v0), this.v1.copy(e.v1), this.v2.copy(e.v2), this.v3.copy(e.v3), this;
  }
  toJSON() {
    const e = super.toJSON();
    return e.v0 = this.v0.toArray(), e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e.v3 = this.v3.toArray(), e;
  }
  fromJSON(e) {
    return super.fromJSON(e), this.v0.fromArray(e.v0), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this.v3.fromArray(e.v3), this;
  }
};
}
