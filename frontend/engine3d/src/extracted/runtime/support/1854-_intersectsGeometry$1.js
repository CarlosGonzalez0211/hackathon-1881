/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1351297:1352693.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1854(scope) {
scope._intersectsGeometry$1 = function _intersectsGeometry$1(r, e, i, s, a = null) {
  const {
    float32Array: o,
    uint16Array: l,
    uint32Array: c
  } = scope.BufferStack;
  let h = r * 2;
  if (a === null && (i.boundingBox || i.computeBoundingBox(), scope.obb$4.set(i.boundingBox.min, i.boundingBox.max, s), a = scope.obb$4), scope.IS_LEAF(h, l)) {
    const p = e.geometry,
      f = p.index,
      _ = p.attributes.position,
      x = i.index,
      b = i.attributes.position,
      T = scope.OFFSET(r, c),
      M = scope.COUNT(h, l);
    if (scope.invertedMat$1.copy(s).invert(), i.boundsTree) return scope.arrayToBox(r, o, scope.obb2$3), scope.obb2$3.matrix.copy(scope.invertedMat$1), scope.obb2$3.needsUpdate = !0, i.boundsTree.shapecast({
      intersectsBounds: D => scope.obb2$3.intersectsBox(D),
      intersectsTriangle: D => {
        D.a.applyMatrix4(s), D.b.applyMatrix4(s), D.c.applyMatrix4(s), D.needsUpdate = !0;
        for (let R = T * 3, P = (M + T) * 3; R < P; R += 3) if (scope.setTriangle(scope.triangle2$1, R, f, _), scope.triangle2$1.needsUpdate = !0, D.intersectsTriangle(scope.triangle2$1)) return !0;
        return !1;
      }
    });
    for (let w = T * 3, D = (M + T) * 3; w < D; w += 3) {
      scope.setTriangle(scope.triangle$1, w, f, _), scope.triangle$1.a.applyMatrix4(scope.invertedMat$1), scope.triangle$1.b.applyMatrix4(scope.invertedMat$1), scope.triangle$1.c.applyMatrix4(scope.invertedMat$1), scope.triangle$1.needsUpdate = !0;
      for (let R = 0, P = x.count; R < P; R += 3) if (scope.setTriangle(scope.triangle2$1, R, x, b), scope.triangle2$1.needsUpdate = !0, scope.triangle$1.intersectsTriangle(scope.triangle2$1)) return !0;
    }
  } else {
    const p = r + 8,
      f = c[r + 6];
    return scope.arrayToBox(p, o, scope.boundingBox$1), !!(a.intersectsBox(scope.boundingBox$1) && scope._intersectsGeometry$1(p, e, i, s, a) || (scope.arrayToBox(f, o, scope.boundingBox$1), a.intersectsBox(scope.boundingBox$1) && scope._intersectsGeometry$1(f, e, i, s, a)));
  }
};
}
