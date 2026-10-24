/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1352849:1354625.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1862(scope) {
scope.closestPointToGeometry = function closestPointToGeometry(r, e, i, s = {}, a = {}, o = 0, l = 1 / 0) {
  e.boundingBox || e.computeBoundingBox(), scope.obb$3.set(e.boundingBox.min, e.boundingBox.max, i), scope.obb$3.needsUpdate = !0;
  const c = r.geometry,
    h = c.attributes.position,
    d = c.index,
    p = e.attributes.position,
    f = e.index,
    _ = scope.ExtendedTrianglePool.getPrimitive(),
    x = scope.ExtendedTrianglePool.getPrimitive();
  let b = scope.temp1$1,
    T = scope.temp2$1,
    M = null,
    w = null;
  a && (M = scope.temp3$1, w = scope.temp4$1);
  let D = 1 / 0,
    R = null,
    P = null;
  return scope.tempMatrix$1.copy(i).invert(), scope.obb2$2.matrix.copy(scope.tempMatrix$1), r.shapecast({
    boundsTraverseOrder: U => scope.obb$3.distanceToBox(U),
    intersectsBounds: (U, O, N) => N < D && N < l ? (O && (scope.obb2$2.min.copy(U.min), scope.obb2$2.max.copy(U.max), scope.obb2$2.needsUpdate = !0), !0) : !1,
    intersectsRange: (U, O) => {
      if (e.boundsTree) return e.boundsTree.shapecast({
        boundsTraverseOrder: H => scope.obb2$2.distanceToBox(H),
        intersectsBounds: (H, F, k) => k < D && k < l,
        intersectsRange: (H, F) => {
          for (let k = H, W = H + F; k < W; k++) {
            scope.setTriangle(x, 3 * k, f, p), x.a.applyMatrix4(i), x.b.applyMatrix4(i), x.c.applyMatrix4(i), x.needsUpdate = !0;
            for (let $ = U, Z = U + O; $ < Z; $++) {
              scope.setTriangle(_, 3 * $, d, h), _.needsUpdate = !0;
              const J = _.distanceToTriangle(x, b, M);
              if (J < D && (T.copy(b), w && w.copy(M), D = J, R = $, P = k), J < o) return !0;
            }
          }
        }
      });
      {
        const N = scope.getTriCount(e);
        for (let H = 0, F = N; H < F; H++) {
          scope.setTriangle(x, 3 * H, f, p), x.a.applyMatrix4(i), x.b.applyMatrix4(i), x.c.applyMatrix4(i), x.needsUpdate = !0;
          for (let k = U, W = U + O; k < W; k++) {
            scope.setTriangle(_, 3 * k, d, h), _.needsUpdate = !0;
            const $ = _.distanceToTriangle(x, b, M);
            if ($ < D && (T.copy(b), w && w.copy(M), D = $, R = k, P = H), $ < o) return !0;
          }
        }
      }
    }
  }), scope.ExtendedTrianglePool.releasePrimitive(_), scope.ExtendedTrianglePool.releasePrimitive(x), D === 1 / 0 ? null : (s.point ? s.point.copy(T) : s.point = T.clone(), s.distance = D, s.faceIndex = R, a && (a.point ? a.point.copy(w) : a.point = w.clone(), a.point.applyMatrix4(scope.tempMatrix$1), T.applyMatrix4(scope.tempMatrix$1), a.distance = T.sub(a.point).length(), a.faceIndex = P), s);
};
}
