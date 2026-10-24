/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 230523:231339.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0647(scope) {
scope.SplineCurve = class SplineCurve extends scope.Curve {
  constructor(e = []) {
    super(), this.isSplineCurve = !0, this.type = "SplineCurve", this.points = e;
  }
  getPoint(e, i = new scope.Vector2()) {
    const s = i,
      a = this.points,
      o = (a.length - 1) * e,
      l = Math.floor(o),
      c = o - l,
      h = a[l === 0 ? l : l - 1],
      d = a[l],
      p = a[l > a.length - 2 ? a.length - 1 : l + 1],
      f = a[l > a.length - 3 ? a.length - 1 : l + 2];
    return s.set(scope.CatmullRom(c, h.x, d.x, p.x, f.x), scope.CatmullRom(c, h.y, d.y, p.y, f.y)), s;
  }
  copy(e) {
    super.copy(e), this.points = [];
    for (let i = 0, s = e.points.length; i < s; i++) {
      const a = e.points[i];
      this.points.push(a.clone());
    }
    return this;
  }
  toJSON() {
    const e = super.toJSON();
    e.points = [];
    for (let i = 0, s = this.points.length; i < s; i++) {
      const a = this.points[i];
      e.points.push(a.toArray());
    }
    return e;
  }
  fromJSON(e) {
    super.fromJSON(e), this.points = [];
    for (let i = 0, s = e.points.length; i < s; i++) {
      const a = e.points[i];
      this.points.push(new scope.Vector2().fromArray(a));
    }
    return this;
  }
};
}
