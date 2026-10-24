/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 79433:79734.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0417(scope) {
scope.satForAxes = function satForAxes(r, e, i, s, a) {
  for (let o = 0, l = r.length - 3; o <= l; o += 3) {
    scope._testAxis.fromArray(r, o);
    const c = a.x * Math.abs(scope._testAxis.x) + a.y * Math.abs(scope._testAxis.y) + a.z * Math.abs(scope._testAxis.z),
      h = e.dot(scope._testAxis),
      d = i.dot(scope._testAxis),
      p = s.dot(scope._testAxis);
    if (Math.max(-Math.max(h, d, p), Math.min(h, d, p)) > c) return !1;
  }
  return !0;
};
}
