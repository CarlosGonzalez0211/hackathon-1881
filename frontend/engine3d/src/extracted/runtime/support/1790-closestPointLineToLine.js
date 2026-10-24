/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1331775:1332114.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1790(scope) {
scope.closestPointLineToLine = function () {
  const r = new scope.Vector3(),
    e = new scope.Vector3(),
    i = new scope.Vector3();
  return function (a, o, l) {
    const c = a.start,
      h = r,
      d = o.start,
      p = e;
    i.subVectors(c, d), r.subVectors(a.end, a.start), e.subVectors(o.end, o.start);
    const f = i.dot(p),
      _ = p.dot(h),
      x = p.dot(p),
      b = i.dot(h),
      M = h.dot(h) * x - _ * _;
    let w, D;
    M !== 0 ? w = (f * _ - b * x) / M : w = 0, D = (f + w * _) / x, l.x = w, l.y = D;
  };
}();
}
