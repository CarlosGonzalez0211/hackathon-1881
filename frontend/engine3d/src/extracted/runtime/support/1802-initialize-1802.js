/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1339130:1339578.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1802(scope) {
scope.OrientedBox.prototype.intersectsBox = function () {
  const r = new scope.SeparatingAxisBounds();
  return function (i) {
    this.needsUpdate && this.update();
    const s = i.min,
      a = i.max,
      o = this.satBounds,
      l = this.satAxes,
      c = this.alignedSatBounds;
    if (r.min = s.x, r.max = a.x, c[0].isSeparated(r) || (r.min = s.y, r.max = a.y, c[1].isSeparated(r)) || (r.min = s.z, r.max = a.z, c[2].isSeparated(r))) return !1;
    for (let h = 0; h < 3; h++) {
      const d = l[h],
        p = o[h];
      if (r.setFromBox(d, i), p.isSeparated(r)) return !1;
    }
    return !0;
  };
}();
}
