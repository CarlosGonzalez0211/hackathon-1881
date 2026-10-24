/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 231532:233472.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0649(scope) {
scope.CurvePath = class CurvePath extends scope.Curve {
  constructor() {
    super(), this.type = "CurvePath", this.curves = [], this.autoClose = !1;
  }
  add(e) {
    this.curves.push(e);
  }
  closePath() {
    const e = this.curves[0].getPoint(0),
      i = this.curves[this.curves.length - 1].getPoint(1);
    if (!e.equals(i)) {
      const s = e.isVector2 === !0 ? "LineCurve" : "LineCurve3";
      this.curves.push(new scope.Curves[s](i, e));
    }
    return this;
  }
  getPoint(e, i) {
    const s = e * this.getLength(),
      a = this.getCurveLengths();
    let o = 0;
    for (; o < a.length;) {
      if (a[o] >= s) {
        const l = a[o] - s,
          c = this.curves[o],
          h = c.getLength(),
          d = h === 0 ? 0 : 1 - l / h;
        return c.getPointAt(d, i);
      }
      o++;
    }
    return null;
  }
  getLength() {
    const e = this.getCurveLengths();
    return e[e.length - 1];
  }
  updateArcLengths() {
    this.needsUpdate = !0, this.cacheLengths = null, this.getCurveLengths();
  }
  getCurveLengths() {
    if (this.cacheLengths && this.cacheLengths.length === this.curves.length) return this.cacheLengths;
    const e = [];
    let i = 0;
    for (let s = 0, a = this.curves.length; s < a; s++) i += this.curves[s].getLength(), e.push(i);
    return this.cacheLengths = e, e;
  }
  getSpacedPoints(e = 40) {
    const i = [];
    for (let s = 0; s <= e; s++) i.push(this.getPoint(s / e));
    return this.autoClose && i.push(i[0]), i;
  }
  getPoints(e = 12) {
    const i = [];
    let s;
    for (let a = 0, o = this.curves; a < o.length; a++) {
      const l = o[a],
        c = l.isEllipseCurve ? e * 2 : l.isLineCurve || l.isLineCurve3 ? 1 : l.isSplineCurve ? e * l.points.length : e,
        h = l.getPoints(c);
      for (let d = 0; d < h.length; d++) {
        const p = h[d];
        s && s.equals(p) || (i.push(p), s = p);
      }
    }
    return this.autoClose && i.length > 1 && !i[i.length - 1].equals(i[0]) && i.push(i[0]), i;
  }
  copy(e) {
    super.copy(e), this.curves = [];
    for (let i = 0, s = e.curves.length; i < s; i++) {
      const a = e.curves[i];
      this.curves.push(a.clone());
    }
    return this.autoClose = e.autoClose, this;
  }
  toJSON() {
    const e = super.toJSON();
    e.autoClose = this.autoClose, e.curves = [];
    for (let i = 0, s = this.curves.length; i < s; i++) {
      const a = this.curves[i];
      e.curves.push(a.toJSON());
    }
    return e;
  }
  fromJSON(e) {
    super.fromJSON(e), this.autoClose = e.autoClose, this.curves = [];
    for (let i = 0, s = e.curves.length; i < s; i++) {
      const a = e.curves[i];
      this.curves.push(new scope.Curves[a.type]().fromJSON(a));
    }
    return this;
  }
};
}
