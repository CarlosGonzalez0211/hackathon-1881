/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 221692:223122.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0623(scope) {
scope.EllipseCurve = class EllipseCurve extends scope.Curve {
  constructor(e = 0, i = 0, s = 1, a = 1, o = 0, l = Math.PI * 2, c = !1, h = 0) {
    super(), this.isEllipseCurve = !0, this.type = "EllipseCurve", this.aX = e, this.aY = i, this.xRadius = s, this.yRadius = a, this.aStartAngle = o, this.aEndAngle = l, this.aClockwise = c, this.aRotation = h;
  }
  getPoint(e, i = new scope.Vector2()) {
    const s = i,
      a = Math.PI * 2;
    let o = this.aEndAngle - this.aStartAngle;
    const l = Math.abs(o) < Number.EPSILON;
    for (; o < 0;) o += a;
    for (; o > a;) o -= a;
    o < Number.EPSILON && (l ? o = 0 : o = a), this.aClockwise === !0 && !l && (o === a ? o = -a : o = o - a);
    const c = this.aStartAngle + e * o;
    let h = this.aX + this.xRadius * Math.cos(c),
      d = this.aY + this.yRadius * Math.sin(c);
    if (this.aRotation !== 0) {
      const p = Math.cos(this.aRotation),
        f = Math.sin(this.aRotation),
        _ = h - this.aX,
        x = d - this.aY;
      h = _ * p - x * f + this.aX, d = _ * f + x * p + this.aY;
    }
    return s.set(h, d);
  }
  copy(e) {
    return super.copy(e), this.aX = e.aX, this.aY = e.aY, this.xRadius = e.xRadius, this.yRadius = e.yRadius, this.aStartAngle = e.aStartAngle, this.aEndAngle = e.aEndAngle, this.aClockwise = e.aClockwise, this.aRotation = e.aRotation, this;
  }
  toJSON() {
    const e = super.toJSON();
    return e.aX = this.aX, e.aY = this.aY, e.xRadius = this.xRadius, e.yRadius = this.yRadius, e.aStartAngle = this.aStartAngle, e.aEndAngle = this.aEndAngle, e.aClockwise = this.aClockwise, e.aRotation = this.aRotation, e;
  }
  fromJSON(e) {
    return super.fromJSON(e), this.aX = e.aX, this.aY = e.aY, this.xRadius = e.xRadius, this.yRadius = e.yRadius, this.aStartAngle = e.aStartAngle, this.aEndAngle = e.aEndAngle, this.aClockwise = e.aClockwise, this.aRotation = e.aRotation, this;
  }
};
}
