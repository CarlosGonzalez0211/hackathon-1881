/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 213159:213671.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0604(scope) {
scope.checkIntersection$2 = function checkIntersection$2(r, e, i, s, a, o, l) {
  const c = r.geometry.attributes.position;
  if (scope._vStart.fromBufferAttribute(c, a), scope._vEnd.fromBufferAttribute(c, o), i.distanceSqToSegment(scope._vStart, scope._vEnd, scope._intersectPointOnRay, scope._intersectPointOnSegment) > s) return;
  scope._intersectPointOnRay.applyMatrix4(r.matrixWorld);
  const d = e.ray.origin.distanceTo(scope._intersectPointOnRay);
  if (!(d < e.near || d > e.far)) return {
    distance: d,
    point: scope._intersectPointOnSegment.clone().applyMatrix4(r.matrixWorld),
    index: l,
    face: null,
    faceIndex: null,
    barycoord: null,
    object: r
  };
};
}
