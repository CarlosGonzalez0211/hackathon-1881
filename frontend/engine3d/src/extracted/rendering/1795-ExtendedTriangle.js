/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1333318:1334120.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1795(scope) {
scope.ExtendedTriangle = class ExtendedTriangle extends scope.Triangle {
  constructor(...e) {
    super(...e), this.isExtendedTriangle = !0, this.satAxes = new Array(4).fill().map(() => new scope.Vector3()), this.satBounds = new Array(4).fill().map(() => new scope.SeparatingAxisBounds()), this.points = [this.a, this.b, this.c], this.sphere = new scope.Sphere(), this.plane = new scope.Plane(), this.needsUpdate = !0;
  }
  intersectsSphere(e) {
    return scope.sphereIntersectTriangle(e, this);
  }
  update() {
    const e = this.a,
      i = this.b,
      s = this.c,
      a = this.points,
      o = this.satAxes,
      l = this.satBounds,
      c = o[0],
      h = l[0];
    this.getNormal(c), h.setFromPoints(c, a);
    const d = o[1],
      p = l[1];
    d.subVectors(e, i), p.setFromPoints(d, a);
    const f = o[2],
      _ = l[2];
    f.subVectors(i, s), _.setFromPoints(f, a);
    const x = o[3],
      b = l[3];
    x.subVectors(s, e), b.setFromPoints(x, a), this.sphere.setFromPoints(this.points), this.plane.setFromNormalAndCoplanarPoint(c, e), this.needsUpdate = !1;
  }
};
}
