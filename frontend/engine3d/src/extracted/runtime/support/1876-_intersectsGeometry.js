/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1357294:1358690.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1876(scope) {
scope._intersectsGeometry = function _intersectsGeometry(r, e, i, s, a = null) {
  const {
    float32Array: o,
    uint16Array: l,
    uint32Array: c
  } = scope.BufferStack;
  let h = r * 2;
  if (a === null && (i.boundingBox || i.computeBoundingBox(), scope.obb$2.set(i.boundingBox.min, i.boundingBox.max, s), a = scope.obb$2), scope.IS_LEAF(h, l)) {
    const p = e.geometry,
      f = p.index,
      _ = p.attributes.position,
      x = i.index,
      b = i.attributes.position,
      T = scope.OFFSET(r, c),
      M = scope.COUNT(h, l);
    if (scope.invertedMat.copy(s).invert(), i.boundsTree) return scope.arrayToBox(r, o, scope.obb2$1), scope.obb2$1.matrix.copy(scope.invertedMat), scope.obb2$1.needsUpdate = !0, i.boundsTree.shapecast({
      intersectsBounds: D => scope.obb2$1.intersectsBox(D),
      intersectsTriangle: D => {
        D.a.applyMatrix4(s), D.b.applyMatrix4(s), D.c.applyMatrix4(s), D.needsUpdate = !0;
        for (let R = T, P = M + T; R < P; R++) if (scope.setTriangle(scope.triangle2, 3 * e.resolveTriangleIndex(R), f, _), scope.triangle2.needsUpdate = !0, D.intersectsTriangle(scope.triangle2)) return !0;
        return !1;
      }
    });
    for (let w = T, D = M + T; w < D; w++) {
      const R = e.resolveTriangleIndex(w);
      scope.setTriangle(scope.triangle, 3 * R, f, _), scope.triangle.a.applyMatrix4(scope.invertedMat), scope.triangle.b.applyMatrix4(scope.invertedMat), scope.triangle.c.applyMatrix4(scope.invertedMat), scope.triangle.needsUpdate = !0;
      for (let P = 0, U = x.count; P < U; P += 3) if (scope.setTriangle(scope.triangle2, P, x, b), scope.triangle2.needsUpdate = !0, scope.triangle.intersectsTriangle(scope.triangle2)) return !0;
    }
  } else {
    const p = r + 8,
      f = c[r + 6];
    return scope.arrayToBox(p, o, scope.boundingBox), !!(a.intersectsBox(scope.boundingBox) && scope._intersectsGeometry(p, e, i, s, a) || (scope.arrayToBox(f, o, scope.boundingBox), a.intersectsBox(scope.boundingBox) && scope._intersectsGeometry(f, e, i, s, a)));
  }
};
}
