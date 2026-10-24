/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 188702:190921.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0572(scope) {
scope.Frustum = class Frustum {
  constructor(e = new scope.Plane(), i = new scope.Plane(), s = new scope.Plane(), a = new scope.Plane(), o = new scope.Plane(), l = new scope.Plane()) {
    this.planes = [e, i, s, a, o, l];
  }
  set(e, i, s, a, o, l) {
    const c = this.planes;
    return c[0].copy(e), c[1].copy(i), c[2].copy(s), c[3].copy(a), c[4].copy(o), c[5].copy(l), this;
  }
  copy(e) {
    const i = this.planes;
    for (let s = 0; s < 6; s++) i[s].copy(e.planes[s]);
    return this;
  }
  setFromProjectionMatrix(e, i = scope.WebGLCoordinateSystem, s = !1) {
    const a = this.planes,
      o = e.elements,
      l = o[0],
      c = o[1],
      h = o[2],
      d = o[3],
      p = o[4],
      f = o[5],
      _ = o[6],
      x = o[7],
      b = o[8],
      T = o[9],
      M = o[10],
      w = o[11],
      D = o[12],
      R = o[13],
      P = o[14],
      U = o[15];
    if (a[0].setComponents(d - l, x - p, w - b, U - D).normalize(), a[1].setComponents(d + l, x + p, w + b, U + D).normalize(), a[2].setComponents(d + c, x + f, w + T, U + R).normalize(), a[3].setComponents(d - c, x - f, w - T, U - R).normalize(), s) a[4].setComponents(h, _, M, P).normalize(), a[5].setComponents(d - h, x - _, w - M, U - P).normalize();else if (a[4].setComponents(d - h, x - _, w - M, U - P).normalize(), i === scope.WebGLCoordinateSystem) a[5].setComponents(d + h, x + _, w + M, U + P).normalize();else if (i === scope.WebGPUCoordinateSystem) a[5].setComponents(h, _, M, P).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: " + i);
    return this;
  }
  intersectsObject(e) {
    if (e.boundingSphere !== void 0) e.boundingSphere === null && e.computeBoundingSphere(), scope._sphere$3.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else {
      const i = e.geometry;
      i.boundingSphere === null && i.computeBoundingSphere(), scope._sphere$3.copy(i.boundingSphere).applyMatrix4(e.matrixWorld);
    }
    return this.intersectsSphere(scope._sphere$3);
  }
  intersectsSprite(e) {
    scope._sphere$3.center.set(0, 0, 0);
    const i = scope._defaultSpriteCenter.distanceTo(e.center);
    return scope._sphere$3.radius = .7071067811865476 + i, scope._sphere$3.applyMatrix4(e.matrixWorld), this.intersectsSphere(scope._sphere$3);
  }
  intersectsSphere(e) {
    const i = this.planes,
      s = e.center,
      a = -e.radius;
    for (let o = 0; o < 6; o++) if (i[o].distanceToPoint(s) < a) return !1;
    return !0;
  }
  intersectsBox(e) {
    const i = this.planes;
    for (let s = 0; s < 6; s++) {
      const a = i[s];
      if (scope._vector$6.x = a.normal.x > 0 ? e.max.x : e.min.x, scope._vector$6.y = a.normal.y > 0 ? e.max.y : e.min.y, scope._vector$6.z = a.normal.z > 0 ? e.max.z : e.min.z, a.distanceToPoint(scope._vector$6) < 0) return !1;
    }
    return !0;
  }
  containsPoint(e) {
    const i = this.planes;
    for (let s = 0; s < 6; s++) if (i[s].distanceToPoint(e) < 0) return !1;
    return !0;
  }
  clone() {
    return new this.constructor().copy(this);
  }
};
}
