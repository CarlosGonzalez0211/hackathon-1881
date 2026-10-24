/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1347402:1347612.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1836(scope) {
scope.iterateOverTriangles = function iterateOverTriangles(r, e, i, s, a, o, l) {
  const {
      geometry: c
    } = i,
    {
      index: h
    } = c,
    d = c.attributes.position;
  for (let p = r, f = e + r; p < f; p++) {
    let _;
    if (_ = p, scope.setTriangle(l, _ * 3, h, d), l.needsUpdate = !0, s(l, _, a, o)) return !0;
  }
  return !1;
};
}
