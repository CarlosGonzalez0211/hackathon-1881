/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1358834:1360716.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1884(scope) {
scope.closestPointToGeometry_indirect = function closestPointToGeometry_indirect(r, e, i, s = {}, a = {}, o = 0, l = 1 / 0) {
  e.boundingBox || e.computeBoundingBox(), scope.obb$1.set(e.boundingBox.min, e.boundingBox.max, i), scope.obb$1.needsUpdate = !0;
  const c = r.geometry,
    h = c.attributes.position,
    d = c.index,
    p = e.attributes.position,
    f = e.index,
    _ = scope.ExtendedTrianglePool.getPrimitive(),
    x = scope.ExtendedTrianglePool.getPrimitive();
  let b = scope.temp1,
    T = scope.temp2,
    M = null,
    w = null;
  a && (M = scope.temp3, w = scope.temp4);
  let D = 1 / 0,
    R = null,
    P = null;
  return scope.tempMatrix.copy(i).invert(), scope.obb2.matrix.copy(scope.tempMatrix), r.shapecast({
    boundsTraverseOrder: U => scope.obb$1.distanceToBox(U),
    intersectsBounds: (U, O, N) => N < D && N < l ? (O && (scope.obb2.min.copy(U.min), scope.obb2.max.copy(U.max), scope.obb2.needsUpdate = !0), !0) : !1,
    intersectsRange: (U, O) => {
      if (e.boundsTree) {
        const N = e.boundsTree;
        return N.shapecast({
          boundsTraverseOrder: H => scope.obb2.distanceToBox(H),
          intersectsBounds: (H, F, k) => k < D && k < l,
          intersectsRange: (H, F) => {
            for (let k = H, W = H + F; k < W; k++) {
              const $ = N.resolveTriangleIndex(k);
              scope.setTriangle(x, 3 * $, f, p), x.a.applyMatrix4(i), x.b.applyMatrix4(i), x.c.applyMatrix4(i), x.needsUpdate = !0;
              for (let Z = U, J = U + O; Z < J; Z++) {
                const se = r.resolveTriangleIndex(Z);
                scope.setTriangle(_, 3 * se, d, h), _.needsUpdate = !0;
                const re = _.distanceToTriangle(x, b, M);
                if (re < D && (T.copy(b), w && w.copy(M), D = re, R = Z, P = k), re < o) return !0;
              }
            }
          }
        });
      } else {
        const N = scope.getTriCount(e);
        for (let H = 0, F = N; H < F; H++) {
          scope.setTriangle(x, 3 * H, f, p), x.a.applyMatrix4(i), x.b.applyMatrix4(i), x.c.applyMatrix4(i), x.needsUpdate = !0;
          for (let k = U, W = U + O; k < W; k++) {
            const $ = r.resolveTriangleIndex(k);
            scope.setTriangle(_, 3 * $, d, h), _.needsUpdate = !0;
            const Z = _.distanceToTriangle(x, b, M);
            if (Z < D && (T.copy(b), w && w.copy(M), D = Z, R = k, P = H), Z < o) return !0;
          }
        }
      }
    }
  }), scope.ExtendedTrianglePool.releasePrimitive(_), scope.ExtendedTrianglePool.releasePrimitive(x), D === 1 / 0 ? null : (s.point ? s.point.copy(T) : s.point = T.clone(), s.distance = D, s.faceIndex = R, a && (a.point ? a.point.copy(w) : a.point = w.clone(), a.point.applyMatrix4(scope.tempMatrix), T.applyMatrix4(scope.tempMatrix), a.distance = T.sub(a.point).length(), a.faceIndex = P), s);
};
}
