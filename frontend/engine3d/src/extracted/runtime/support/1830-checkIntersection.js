/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1345180:1345428.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1830(scope) {
scope.checkIntersection = function checkIntersection(r, e, i, s, a, o, l, c) {
  let h;
  if (o === scope.BackSide ? h = r.intersectTriangle(s, i, e, !0, a) : h = r.intersectTriangle(e, i, s, o !== scope.DoubleSide, a), h === null) return null;
  const d = r.origin.distanceTo(a);
  return d < l || d > c ? null : {
    distance: d,
    point: a.clone()
  };
};
}
