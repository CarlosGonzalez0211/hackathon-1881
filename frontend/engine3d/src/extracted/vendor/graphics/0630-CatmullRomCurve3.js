/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 223677:225570.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0630(scope) {
scope.CatmullRomCurve3 = class CatmullRomCurve3 extends scope.Curve {
  constructor(e = [], i = !1, s = "centripetal", a = .5) {
    super(), this.isCatmullRomCurve3 = !0, this.type = "CatmullRomCurve3", this.points = e, this.closed = i, this.curveType = s, this.tension = a;
  }
  getPoint(e, i = new scope.Vector3()) {
    const s = i,
      a = this.points,
      o = a.length,
      l = (o - (this.closed ? 0 : 1)) * e;
    let c = Math.floor(l),
      h = l - c;
    this.closed ? c += c > 0 ? 0 : (Math.floor(Math.abs(c) / o) + 1) * o : h === 0 && c === o - 1 && (c = o - 2, h = 1);
    let d, p;
    this.closed || c > 0 ? d = a[(c - 1) % o] : (scope.tmp.subVectors(a[0], a[1]).add(a[0]), d = scope.tmp);
    const f = a[c % o],
      _ = a[(c + 1) % o];
    if (this.closed || c + 2 < o ? p = a[(c + 2) % o] : (scope.tmp.subVectors(a[o - 1], a[o - 2]).add(a[o - 1]), p = scope.tmp), this.curveType === "centripetal" || this.curveType === "chordal") {
      const x = this.curveType === "chordal" ? .5 : .25;
      let b = Math.pow(d.distanceToSquared(f), x),
        T = Math.pow(f.distanceToSquared(_), x),
        M = Math.pow(_.distanceToSquared(p), x);
      T < 1e-4 && (T = 1), b < 1e-4 && (b = T), M < 1e-4 && (M = T), scope.px.initNonuniformCatmullRom(d.x, f.x, _.x, p.x, b, T, M), scope.py.initNonuniformCatmullRom(d.y, f.y, _.y, p.y, b, T, M), scope.pz.initNonuniformCatmullRom(d.z, f.z, _.z, p.z, b, T, M);
    } else this.curveType === "catmullrom" && (scope.px.initCatmullRom(d.x, f.x, _.x, p.x, this.tension), scope.py.initCatmullRom(d.y, f.y, _.y, p.y, this.tension), scope.pz.initCatmullRom(d.z, f.z, _.z, p.z, this.tension));
    return s.set(scope.px.calc(h), scope.py.calc(h), scope.pz.calc(h)), s;
  }
  copy(e) {
    super.copy(e), this.points = [];
    for (let i = 0, s = e.points.length; i < s; i++) {
      const a = e.points[i];
      this.points.push(a.clone());
    }
    return this.closed = e.closed, this.curveType = e.curveType, this.tension = e.tension, this;
  }
  toJSON() {
    const e = super.toJSON();
    e.points = [];
    for (let i = 0, s = this.points.length; i < s; i++) {
      const a = this.points[i];
      e.points.push(a.toArray());
    }
    return e.closed = this.closed, e.curveType = this.curveType, e.tension = this.tension, e;
  }
  fromJSON(e) {
    super.fromJSON(e), this.points = [];
    for (let i = 0, s = e.points.length; i < s; i++) {
      const a = e.points[i];
      this.points.push(new scope.Vector3().fromArray(a));
    }
    return this.closed = e.closed, this.curveType = e.curveType, this.tension = e.tension, this;
  }
};
}
