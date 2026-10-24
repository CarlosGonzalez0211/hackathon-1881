/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1345428:1346532.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1831(scope) {
scope.checkBufferGeometryIntersection = function checkBufferGeometryIntersection(r, e, i, s, a, o, l, c, h, d, p) {
  scope._vA.fromBufferAttribute(e, o), scope._vB.fromBufferAttribute(e, l), scope._vC.fromBufferAttribute(e, c);
  const f = scope.checkIntersection(r, scope._vA, scope._vB, scope._vC, scope._intersectionPoint, h, d, p);
  if (f) {
    const _ = new scope.Vector3();
    scope.Triangle.getBarycoord(scope._intersectionPoint, scope._vA, scope._vB, scope._vC, _), s && (scope._uvA.fromBufferAttribute(s, o), scope._uvB.fromBufferAttribute(s, l), scope._uvC.fromBufferAttribute(s, c), f.uv = scope.Triangle.getInterpolation(scope._intersectionPoint, scope._vA, scope._vB, scope._vC, scope._uvA, scope._uvB, scope._uvC, new scope.Vector2())), a && (scope._uvA.fromBufferAttribute(a, o), scope._uvB.fromBufferAttribute(a, l), scope._uvC.fromBufferAttribute(a, c), f.uv1 = scope.Triangle.getInterpolation(scope._intersectionPoint, scope._vA, scope._vB, scope._vC, scope._uvA, scope._uvB, scope._uvC, new scope.Vector2())), i && (scope._normalA.fromBufferAttribute(i, o), scope._normalB.fromBufferAttribute(i, l), scope._normalC.fromBufferAttribute(i, c), f.normal = scope.Triangle.getInterpolation(scope._intersectionPoint, scope._vA, scope._vB, scope._vC, scope._normalA, scope._normalB, scope._normalC, new scope.Vector3()), f.normal.dot(r.direction) > 0 && f.normal.multiplyScalar(-1));
    const x = {
      a: o,
      b: l,
      c,
      normal: new scope.Vector3(),
      materialIndex: 0
    };
    scope.Triangle.getNormal(scope._vA, scope._vB, scope._vC, x.normal), f.face = x, f.faceIndex = o, scope.IS_GT_REVISION_169 && (f.barycoord = _);
  }
  return f;
};
}
