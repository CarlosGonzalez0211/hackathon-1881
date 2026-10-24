/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 218995:221692.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0622(scope) {
scope.Curve = class Curve {
  constructor() {
    this.type = "Curve", this.arcLengthDivisions = 200, this.needsUpdate = !1, this.cacheArcLengths = null;
  }
  getPoint() {
    console.warn("THREE.Curve: .getPoint() not implemented.");
  }
  getPointAt(e, i) {
    const s = this.getUtoTmapping(e);
    return this.getPoint(s, i);
  }
  getPoints(e = 5) {
    const i = [];
    for (let s = 0; s <= e; s++) i.push(this.getPoint(s / e));
    return i;
  }
  getSpacedPoints(e = 5) {
    const i = [];
    for (let s = 0; s <= e; s++) i.push(this.getPointAt(s / e));
    return i;
  }
  getLength() {
    const e = this.getLengths();
    return e[e.length - 1];
  }
  getLengths(e = this.arcLengthDivisions) {
    if (this.cacheArcLengths && this.cacheArcLengths.length === e + 1 && !this.needsUpdate) return this.cacheArcLengths;
    this.needsUpdate = !1;
    const i = [];
    let s,
      a = this.getPoint(0),
      o = 0;
    i.push(0);
    for (let l = 1; l <= e; l++) s = this.getPoint(l / e), o += s.distanceTo(a), i.push(o), a = s;
    return this.cacheArcLengths = i, i;
  }
  updateArcLengths() {
    this.needsUpdate = !0, this.getLengths();
  }
  getUtoTmapping(e, i = null) {
    const s = this.getLengths();
    let a = 0;
    const o = s.length;
    let l;
    i ? l = i : l = e * s[o - 1];
    let c = 0,
      h = o - 1,
      d;
    for (; c <= h;) if (a = Math.floor(c + (h - c) / 2), d = s[a] - l, d < 0) c = a + 1;else if (d > 0) h = a - 1;else {
      h = a;
      break;
    }
    if (a = h, s[a] === l) return a / (o - 1);
    const p = s[a],
      _ = s[a + 1] - p,
      x = (l - p) / _;
    return (a + x) / (o - 1);
  }
  getTangent(e, i) {
    let a = e - 1e-4,
      o = e + 1e-4;
    a < 0 && (a = 0), o > 1 && (o = 1);
    const l = this.getPoint(a),
      c = this.getPoint(o),
      h = i || (l.isVector2 ? new scope.Vector2() : new scope.Vector3());
    return h.copy(c).sub(l).normalize(), h;
  }
  getTangentAt(e, i) {
    const s = this.getUtoTmapping(e);
    return this.getTangent(s, i);
  }
  computeFrenetFrames(e, i = !1) {
    const s = new scope.Vector3(),
      a = [],
      o = [],
      l = [],
      c = new scope.Vector3(),
      h = new scope.Matrix4();
    for (let x = 0; x <= e; x++) {
      const b = x / e;
      a[x] = this.getTangentAt(b, new scope.Vector3());
    }
    o[0] = new scope.Vector3(), l[0] = new scope.Vector3();
    let d = Number.MAX_VALUE;
    const p = Math.abs(a[0].x),
      f = Math.abs(a[0].y),
      _ = Math.abs(a[0].z);
    p <= d && (d = p, s.set(1, 0, 0)), f <= d && (d = f, s.set(0, 1, 0)), _ <= d && s.set(0, 0, 1), c.crossVectors(a[0], s).normalize(), o[0].crossVectors(a[0], c), l[0].crossVectors(a[0], o[0]);
    for (let x = 1; x <= e; x++) {
      if (o[x] = o[x - 1].clone(), l[x] = l[x - 1].clone(), c.crossVectors(a[x - 1], a[x]), c.length() > Number.EPSILON) {
        c.normalize();
        const b = Math.acos(scope.clamp(a[x - 1].dot(a[x]), -1, 1));
        o[x].applyMatrix4(h.makeRotationAxis(c, b));
      }
      l[x].crossVectors(a[x], o[x]);
    }
    if (i === !0) {
      let x = Math.acos(scope.clamp(o[0].dot(o[e]), -1, 1));
      x /= e, a[0].dot(c.crossVectors(o[0], o[e])) > 0 && (x = -x);
      for (let b = 1; b <= e; b++) o[b].applyMatrix4(h.makeRotationAxis(a[b], x * b)), l[b].crossVectors(a[b], o[b]);
    }
    return {
      tangents: a,
      normals: o,
      binormals: l
    };
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    return this.arcLengthDivisions = e.arcLengthDivisions, this;
  }
  toJSON() {
    const e = {
      metadata: {
        version: 4.7,
        type: "Curve",
        generator: "Curve.toJSON"
      }
    };
    return e.arcLengthDivisions = this.arcLengthDivisions, e.type = this.type, e;
  }
  fromJSON(e) {
    return this.arcLengthDivisions = e.arcLengthDivisions, this;
  }
};
}
