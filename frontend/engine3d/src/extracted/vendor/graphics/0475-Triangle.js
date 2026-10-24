/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 109986:113334.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0475(scope) {
scope.Triangle = class Triangle {
  constructor(e = new scope.Vector3(), i = new scope.Vector3(), s = new scope.Vector3()) {
    this.a = e, this.b = i, this.c = s;
  }
  static getNormal(e, i, s, a) {
    a.subVectors(s, i), scope._v0$1$1.subVectors(e, i), a.cross(scope._v0$1$1);
    const o = a.lengthSq();
    return o > 0 ? a.multiplyScalar(1 / Math.sqrt(o)) : a.set(0, 0, 0);
  }
  static getBarycoord(e, i, s, a, o) {
    scope._v0$1$1.subVectors(a, i), scope._v1$3$1.subVectors(s, i), scope._v2$2$1.subVectors(e, i);
    const l = scope._v0$1$1.dot(scope._v0$1$1),
      c = scope._v0$1$1.dot(scope._v1$3$1),
      h = scope._v0$1$1.dot(scope._v2$2$1),
      d = scope._v1$3$1.dot(scope._v1$3$1),
      p = scope._v1$3$1.dot(scope._v2$2$1),
      f = l * d - c * c;
    if (f === 0) return o.set(0, 0, 0), null;
    const _ = 1 / f,
      x = (d * h - c * p) * _,
      b = (l * p - c * h) * _;
    return o.set(1 - x - b, b, x);
  }
  static containsPoint(e, i, s, a) {
    return this.getBarycoord(e, i, s, a, scope._v3$2) === null ? !1 : scope._v3$2.x >= 0 && scope._v3$2.y >= 0 && scope._v3$2.x + scope._v3$2.y <= 1;
  }
  static getInterpolation(e, i, s, a, o, l, c, h) {
    return this.getBarycoord(e, i, s, a, scope._v3$2) === null ? (h.x = 0, h.y = 0, "z" in h && (h.z = 0), "w" in h && (h.w = 0), null) : (h.setScalar(0), h.addScaledVector(o, scope._v3$2.x), h.addScaledVector(l, scope._v3$2.y), h.addScaledVector(c, scope._v3$2.z), h);
  }
  static getInterpolatedAttribute(e, i, s, a, o, l) {
    return scope._v40.setScalar(0), scope._v41.setScalar(0), scope._v42.setScalar(0), scope._v40.fromBufferAttribute(e, i), scope._v41.fromBufferAttribute(e, s), scope._v42.fromBufferAttribute(e, a), l.setScalar(0), l.addScaledVector(scope._v40, o.x), l.addScaledVector(scope._v41, o.y), l.addScaledVector(scope._v42, o.z), l;
  }
  static isFrontFacing(e, i, s, a) {
    return scope._v0$1$1.subVectors(s, i), scope._v1$3$1.subVectors(e, i), scope._v0$1$1.cross(scope._v1$3$1).dot(a) < 0;
  }
  set(e, i, s) {
    return this.a.copy(e), this.b.copy(i), this.c.copy(s), this;
  }
  setFromPointsAndIndices(e, i, s, a) {
    return this.a.copy(e[i]), this.b.copy(e[s]), this.c.copy(e[a]), this;
  }
  setFromAttributeAndIndices(e, i, s, a) {
    return this.a.fromBufferAttribute(e, i), this.b.fromBufferAttribute(e, s), this.c.fromBufferAttribute(e, a), this;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    return this.a.copy(e.a), this.b.copy(e.b), this.c.copy(e.c), this;
  }
  getArea() {
    return scope._v0$1$1.subVectors(this.c, this.b), scope._v1$3$1.subVectors(this.a, this.b), scope._v0$1$1.cross(scope._v1$3$1).length() * .5;
  }
  getMidpoint(e) {
    return e.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3);
  }
  getNormal(e) {
    return scope.Triangle.getNormal(this.a, this.b, this.c, e);
  }
  getPlane(e) {
    return e.setFromCoplanarPoints(this.a, this.b, this.c);
  }
  getBarycoord(e, i) {
    return scope.Triangle.getBarycoord(e, this.a, this.b, this.c, i);
  }
  getInterpolation(e, i, s, a, o) {
    return scope.Triangle.getInterpolation(e, this.a, this.b, this.c, i, s, a, o);
  }
  containsPoint(e) {
    return scope.Triangle.containsPoint(e, this.a, this.b, this.c);
  }
  isFrontFacing(e) {
    return scope.Triangle.isFrontFacing(this.a, this.b, this.c, e);
  }
  intersectsBox(e) {
    return e.intersectsTriangle(this);
  }
  closestPointToPoint(e, i) {
    const s = this.a,
      a = this.b,
      o = this.c;
    let l, c;
    scope._vab.subVectors(a, s), scope._vac.subVectors(o, s), scope._vap.subVectors(e, s);
    const h = scope._vab.dot(scope._vap),
      d = scope._vac.dot(scope._vap);
    if (h <= 0 && d <= 0) return i.copy(s);
    scope._vbp.subVectors(e, a);
    const p = scope._vab.dot(scope._vbp),
      f = scope._vac.dot(scope._vbp);
    if (p >= 0 && f <= p) return i.copy(a);
    const _ = h * f - p * d;
    if (_ <= 0 && h >= 0 && p <= 0) return l = h / (h - p), i.copy(s).addScaledVector(scope._vab, l);
    scope._vcp.subVectors(e, o);
    const x = scope._vab.dot(scope._vcp),
      b = scope._vac.dot(scope._vcp);
    if (b >= 0 && x <= b) return i.copy(o);
    const T = x * d - h * b;
    if (T <= 0 && d >= 0 && b <= 0) return c = d / (d - b), i.copy(s).addScaledVector(scope._vac, c);
    const M = p * b - x * f;
    if (M <= 0 && f - p >= 0 && x - b >= 0) return scope._vbc.subVectors(o, a), c = (f - p) / (f - p + (x - b)), i.copy(a).addScaledVector(scope._vbc, c);
    const w = 1 / (M + T + _);
    return l = T * w, c = _ * w, i.copy(s).addScaledVector(scope._vab, l).addScaledVector(scope._vac, c);
  }
  equals(e) {
    return e.a.equals(this.a) && e.b.equals(this.b) && e.c.equals(this.c);
  }
};
}
