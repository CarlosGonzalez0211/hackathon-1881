/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1338537:1339130.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1801(scope) {
scope.OrientedBox.prototype.update = function () {
  return function () {
    const e = this.matrix,
      i = this.min,
      s = this.max,
      a = this.points;
    for (let d = 0; d <= 1; d++) for (let p = 0; p <= 1; p++) for (let f = 0; f <= 1; f++) {
      const _ = 1 * d | 2 * p | 4 * f,
        x = a[_];
      x.x = d ? s.x : i.x, x.y = p ? s.y : i.y, x.z = f ? s.z : i.z, x.applyMatrix4(e);
    }
    const o = this.satBounds,
      l = this.satAxes,
      c = a[0];
    for (let d = 0; d < 3; d++) {
      const p = l[d],
        f = o[d],
        _ = 1 << d,
        x = a[_];
      p.subVectors(c, x), f.setFromPoints(p, a);
    }
    const h = this.alignedSatBounds;
    h[0].setFromPointsField(a, "x"), h[1].setFromPointsField(a, "y"), h[2].setFromPointsField(a, "z"), this.invMatrix.copy(this.matrix).invert(), this.needsUpdate = !1;
  };
}();
}
