/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 82163:85961.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0429(scope) {
scope.Ray = class Ray {
  constructor(e = new scope.Vector3(), i = new scope.Vector3(0, 0, -1)) {
    this.origin = e, this.direction = i;
  }
  set(e, i) {
    return this.origin.copy(e), this.direction.copy(i), this;
  }
  copy(e) {
    return this.origin.copy(e.origin), this.direction.copy(e.direction), this;
  }
  at(e, i) {
    return i.copy(this.origin).addScaledVector(this.direction, e);
  }
  lookAt(e) {
    return this.direction.copy(e).sub(this.origin).normalize(), this;
  }
  recast(e) {
    return this.origin.copy(this.at(e, scope._vector$a)), this;
  }
  closestPointToPoint(e, i) {
    i.subVectors(e, this.origin);
    const s = i.dot(this.direction);
    return s < 0 ? i.copy(this.origin) : i.copy(this.origin).addScaledVector(this.direction, s);
  }
  distanceToPoint(e) {
    return Math.sqrt(this.distanceSqToPoint(e));
  }
  distanceSqToPoint(e) {
    const i = scope._vector$a.subVectors(e, this.origin).dot(this.direction);
    return i < 0 ? this.origin.distanceToSquared(e) : (scope._vector$a.copy(this.origin).addScaledVector(this.direction, i), scope._vector$a.distanceToSquared(e));
  }
  distanceSqToSegment(e, i, s, a) {
    scope._segCenter.copy(e).add(i).multiplyScalar(.5), scope._segDir.copy(i).sub(e).normalize(), scope._diff.copy(this.origin).sub(scope._segCenter);
    const o = e.distanceTo(i) * .5,
      l = -this.direction.dot(scope._segDir),
      c = scope._diff.dot(this.direction),
      h = -scope._diff.dot(scope._segDir),
      d = scope._diff.lengthSq(),
      p = Math.abs(1 - l * l);
    let f, _, x, b;
    if (p > 0) {
      if (f = l * h - c, _ = l * c - h, b = o * p, f >= 0) {
        if (_ >= -b) {
          if (_ <= b) {
            const T = 1 / p;
            f *= T, _ *= T, x = f * (f + l * _ + 2 * c) + _ * (l * f + _ + 2 * h) + d;
          } else _ = o, f = Math.max(0, -(l * _ + c)), x = -f * f + _ * (_ + 2 * h) + d;
        } else _ = -o, f = Math.max(0, -(l * _ + c)), x = -f * f + _ * (_ + 2 * h) + d;
      } else _ <= -b ? (f = Math.max(0, -(-l * o + c)), _ = f > 0 ? -o : Math.min(Math.max(-o, -h), o), x = -f * f + _ * (_ + 2 * h) + d) : _ <= b ? (f = 0, _ = Math.min(Math.max(-o, -h), o), x = _ * (_ + 2 * h) + d) : (f = Math.max(0, -(l * o + c)), _ = f > 0 ? o : Math.min(Math.max(-o, -h), o), x = -f * f + _ * (_ + 2 * h) + d);
    } else _ = l > 0 ? -o : o, f = Math.max(0, -(l * _ + c)), x = -f * f + _ * (_ + 2 * h) + d;
    return s && s.copy(this.origin).addScaledVector(this.direction, f), a && a.copy(scope._segCenter).addScaledVector(scope._segDir, _), x;
  }
  intersectSphere(e, i) {
    scope._vector$a.subVectors(e.center, this.origin);
    const s = scope._vector$a.dot(this.direction),
      a = scope._vector$a.dot(scope._vector$a) - s * s,
      o = e.radius * e.radius;
    if (a > o) return null;
    const l = Math.sqrt(o - a),
      c = s - l,
      h = s + l;
    return h < 0 ? null : c < 0 ? this.at(h, i) : this.at(c, i);
  }
  intersectsSphere(e) {
    return e.radius < 0 ? !1 : this.distanceSqToPoint(e.center) <= e.radius * e.radius;
  }
  distanceToPlane(e) {
    const i = e.normal.dot(this.direction);
    if (i === 0) return e.distanceToPoint(this.origin) === 0 ? 0 : null;
    const s = -(this.origin.dot(e.normal) + e.constant) / i;
    return s >= 0 ? s : null;
  }
  intersectPlane(e, i) {
    const s = this.distanceToPlane(e);
    return s === null ? null : this.at(s, i);
  }
  intersectsPlane(e) {
    const i = e.distanceToPoint(this.origin);
    return i === 0 || e.normal.dot(this.direction) * i < 0;
  }
  intersectBox(e, i) {
    let s, a, o, l, c, h;
    const d = 1 / this.direction.x,
      p = 1 / this.direction.y,
      f = 1 / this.direction.z,
      _ = this.origin;
    return d >= 0 ? (s = (e.min.x - _.x) * d, a = (e.max.x - _.x) * d) : (s = (e.max.x - _.x) * d, a = (e.min.x - _.x) * d), p >= 0 ? (o = (e.min.y - _.y) * p, l = (e.max.y - _.y) * p) : (o = (e.max.y - _.y) * p, l = (e.min.y - _.y) * p), s > l || o > a || ((o > s || isNaN(s)) && (s = o), (l < a || isNaN(a)) && (a = l), f >= 0 ? (c = (e.min.z - _.z) * f, h = (e.max.z - _.z) * f) : (c = (e.max.z - _.z) * f, h = (e.min.z - _.z) * f), s > h || c > a) || ((c > s || s !== s) && (s = c), (h < a || a !== a) && (a = h), a < 0) ? null : this.at(s >= 0 ? s : a, i);
  }
  intersectsBox(e) {
    return this.intersectBox(e, scope._vector$a) !== null;
  }
  intersectTriangle(e, i, s, a, o) {
    scope._edge1.subVectors(i, e), scope._edge2.subVectors(s, e), scope._normal$1.crossVectors(scope._edge1, scope._edge2);
    let l = this.direction.dot(scope._normal$1),
      c;
    if (l > 0) {
      if (a) return null;
      c = 1;
    } else if (l < 0) c = -1, l = -l;else return null;
    scope._diff.subVectors(this.origin, e);
    const h = c * this.direction.dot(scope._edge2.crossVectors(scope._diff, scope._edge2));
    if (h < 0) return null;
    const d = c * this.direction.dot(scope._edge1.cross(scope._diff));
    if (d < 0 || h + d > l) return null;
    const p = -c * scope._diff.dot(scope._normal$1);
    return p < 0 ? null : this.at(p / l, o);
  }
  applyMatrix4(e) {
    return this.origin.applyMatrix4(e), this.direction.transformDirection(e), this;
  }
  equals(e) {
    return e.origin.equals(this.origin) && e.direction.equals(this.direction);
  }
  clone() {
    return new this.constructor().copy(this);
  }
};
}
