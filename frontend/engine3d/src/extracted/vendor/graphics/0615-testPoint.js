/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 216387:216708.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0615(scope) {
scope.testPoint = function testPoint(r, e, i, s, a, o, l) {
  const c = scope._ray.distanceSqToPoint(r);
  if (c < i) {
    const h = new scope.Vector3();
    scope._ray.closestPointToPoint(r, h), h.applyMatrix4(s);
    const d = a.ray.origin.distanceTo(h);
    if (d < a.near || d > a.far) return;
    o.push({
      distance: d,
      distanceToRay: Math.sqrt(c),
      point: h,
      index: e,
      face: null,
      faceIndex: null,
      barycoord: null,
      object: l
    });
  }
};
}
