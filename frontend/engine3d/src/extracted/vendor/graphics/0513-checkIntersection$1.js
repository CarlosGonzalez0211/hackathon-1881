/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 153404:153813.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0513(scope) {
scope.checkIntersection$1 = function checkIntersection$1(r, e, i, s, a, o, l, c) {
  let h;
  if (e.side === scope.BackSide ? h = s.intersectTriangle(l, o, a, !0, c) : h = s.intersectTriangle(a, o, l, e.side === scope.FrontSide, c), h === null) return null;
  scope._intersectionPointWorld.copy(c), scope._intersectionPointWorld.applyMatrix4(r.matrixWorld);
  const d = i.ray.origin.distanceTo(scope._intersectionPointWorld);
  return d < i.near || d > i.far ? null : {
    distance: d,
    point: scope._intersectionPointWorld.clone(),
    object: r
  };
};
}
