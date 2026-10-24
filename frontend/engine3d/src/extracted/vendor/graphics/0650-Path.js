/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 233472:235207.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0650(scope) {
scope.Path = class Path extends scope.CurvePath {
  constructor(e) {
    super(), this.type = "Path", this.currentPoint = new scope.Vector2(), e && this.setFromPoints(e);
  }
  setFromPoints(e) {
    this.moveTo(e[0].x, e[0].y);
    for (let i = 1, s = e.length; i < s; i++) this.lineTo(e[i].x, e[i].y);
    return this;
  }
  moveTo(e, i) {
    return this.currentPoint.set(e, i), this;
  }
  lineTo(e, i) {
    const s = new scope.LineCurve(this.currentPoint.clone(), new scope.Vector2(e, i));
    return this.curves.push(s), this.currentPoint.set(e, i), this;
  }
  quadraticCurveTo(e, i, s, a) {
    const o = new scope.QuadraticBezierCurve(this.currentPoint.clone(), new scope.Vector2(e, i), new scope.Vector2(s, a));
    return this.curves.push(o), this.currentPoint.set(s, a), this;
  }
  bezierCurveTo(e, i, s, a, o, l) {
    const c = new scope.CubicBezierCurve(this.currentPoint.clone(), new scope.Vector2(e, i), new scope.Vector2(s, a), new scope.Vector2(o, l));
    return this.curves.push(c), this.currentPoint.set(o, l), this;
  }
  splineThru(e) {
    const i = [this.currentPoint.clone()].concat(e),
      s = new scope.SplineCurve(i);
    return this.curves.push(s), this.currentPoint.copy(e[e.length - 1]), this;
  }
  arc(e, i, s, a, o, l) {
    const c = this.currentPoint.x,
      h = this.currentPoint.y;
    return this.absarc(e + c, i + h, s, a, o, l), this;
  }
  absarc(e, i, s, a, o, l) {
    return this.absellipse(e, i, s, s, a, o, l), this;
  }
  ellipse(e, i, s, a, o, l, c, h) {
    const d = this.currentPoint.x,
      p = this.currentPoint.y;
    return this.absellipse(e + d, i + p, s, a, o, l, c, h), this;
  }
  absellipse(e, i, s, a, o, l, c, h) {
    const d = new scope.EllipseCurve(e, i, s, a, o, l, c, h);
    if (this.curves.length > 0) {
      const f = d.getPoint(0);
      f.equals(this.currentPoint) || this.lineTo(f.x, f.y);
    }
    this.curves.push(d);
    const p = d.getPoint(1);
    return this.currentPoint.copy(p), this;
  }
  copy(e) {
    return super.copy(e), this.currentPoint.copy(e.currentPoint), this;
  }
  toJSON() {
    const e = super.toJSON();
    return e.currentPoint = this.currentPoint.toArray(), e;
  }
  fromJSON(e) {
    return super.fromJSON(e), this.currentPoint.fromArray(e.currentPoint), this;
  }
};
}
