/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 321662:323304.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0819(scope) {
scope.Line3 = class Line3 {
  constructor(e = new scope.Vector3(), i = new scope.Vector3()) {
    this.start = e, this.end = i;
  }
  set(e, i) {
    return this.start.copy(e), this.end.copy(i), this;
  }
  copy(e) {
    return this.start.copy(e.start), this.end.copy(e.end), this;
  }
  getCenter(e) {
    return e.addVectors(this.start, this.end).multiplyScalar(.5);
  }
  delta(e) {
    return e.subVectors(this.end, this.start);
  }
  distanceSq() {
    return this.start.distanceToSquared(this.end);
  }
  distance() {
    return this.start.distanceTo(this.end);
  }
  at(e, i) {
    return this.delta(i).multiplyScalar(e).add(this.start);
  }
  closestPointToPointParameter(e, i) {
    scope._startP.subVectors(e, this.start), scope._startEnd.subVectors(this.end, this.start);
    const s = scope._startEnd.dot(scope._startEnd);
    let o = scope._startEnd.dot(scope._startP) / s;
    return i && (o = scope.clamp(o, 0, 1)), o;
  }
  closestPointToPoint(e, i, s) {
    const a = this.closestPointToPointParameter(e, i);
    return this.delta(s).multiplyScalar(a).add(this.start);
  }
  distanceSqToLine3(e, i = scope._c1, s = scope._c2) {
    const a = 10000000000000001e-32;
    let o, l;
    const c = this.start,
      h = e.start,
      d = this.end,
      p = e.end;
    scope._d1.subVectors(d, c), scope._d2.subVectors(p, h), scope._r.subVectors(c, h);
    const f = scope._d1.dot(scope._d1),
      _ = scope._d2.dot(scope._d2),
      x = scope._d2.dot(scope._r);
    if (f <= a && _ <= a) return i.copy(c), s.copy(h), i.sub(s), i.dot(i);
    if (f <= a) o = 0, l = x / _, l = scope.clamp(l, 0, 1);else {
      const b = scope._d1.dot(scope._r);
      if (_ <= a) l = 0, o = scope.clamp(-b / f, 0, 1);else {
        const T = scope._d1.dot(scope._d2),
          M = f * _ - T * T;
        M !== 0 ? o = scope.clamp((T * x - b * _) / M, 0, 1) : o = 0, l = (T * o + x) / _, l < 0 ? (l = 0, o = scope.clamp(-b / f, 0, 1)) : l > 1 && (l = 1, o = scope.clamp((T - b) / f, 0, 1));
      }
    }
    return i.copy(c).add(scope._d1.multiplyScalar(o)), s.copy(h).add(scope._d2.multiplyScalar(l)), i.sub(s), i.dot(i);
  }
  applyMatrix4(e) {
    return this.start.applyMatrix4(e), this.end.applyMatrix4(e), this;
  }
  equals(e) {
    return e.start.equals(this.start) && e.end.equals(this.end);
  }
  clone() {
    return new this.constructor().copy(this);
  }
};
}
