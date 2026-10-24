/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 153813:154521.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0514(scope) {
scope.checkGeometryIntersection = function checkGeometryIntersection(r, e, i, s, a, o, l, c, h, d) {
  r.getVertexPosition(c, scope._vA$1), r.getVertexPosition(h, scope._vB$1), r.getVertexPosition(d, scope._vC$1);
  const p = scope.checkIntersection$1(r, e, i, s, scope._vA$1, scope._vB$1, scope._vC$1, scope._intersectionPoint$1);
  if (p) {
    const f = new scope.Vector3();
    scope.Triangle.getBarycoord(scope._intersectionPoint$1, scope._vA$1, scope._vB$1, scope._vC$1, f), a && (p.uv = scope.Triangle.getInterpolatedAttribute(a, c, h, d, f, new scope.Vector2())), o && (p.uv1 = scope.Triangle.getInterpolatedAttribute(o, c, h, d, f, new scope.Vector2())), l && (p.normal = scope.Triangle.getInterpolatedAttribute(l, c, h, d, f, new scope.Vector3()), p.normal.dot(s.direction) > 0 && p.normal.multiplyScalar(-1));
    const _ = {
      a: c,
      b: h,
      c: d,
      normal: new scope.Vector3(),
      materialIndex: 0
    };
    scope.Triangle.getNormal(scope._vA$1, scope._vB$1, scope._vC$1, _.normal), p.face = _, p.barycoord = f;
  }
  return p;
};
}
