/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1331437:1331769.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1789(scope) {
scope.SeparatingAxisBounds.prototype.setFromBox = function () {
  const r = new scope.Vector3();
  return function (i, s) {
    const a = s.min,
      o = s.max;
    let l = 1 / 0,
      c = -1 / 0;
    for (let h = 0; h <= 1; h++) for (let d = 0; d <= 1; d++) for (let p = 0; p <= 1; p++) {
      r.x = a.x * h + o.x * (1 - h), r.y = a.y * d + o.y * (1 - d), r.z = a.z * p + o.z * (1 - p);
      const f = i.dot(r);
      l = Math.min(f, l), c = Math.max(f, c);
    }
    this.min = l, this.max = c;
  };
}();
}
