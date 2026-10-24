/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1369970:1370634.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1911(scope) {
scope.acceleratedMeshRaycast = function acceleratedMeshRaycast(r, e) {
  if (this.geometry.boundsTree) {
    if (this.material === void 0) return;
    scope.tmpInverseMatrix.copy(this.matrixWorld).invert(), scope.ray.copy(r.ray).applyMatrix4(scope.tmpInverseMatrix), scope._worldScale.setFromMatrixScale(this.matrixWorld), scope.direction.copy(scope.ray.direction).multiply(scope._worldScale);
    const i = scope.direction.length(),
      s = r.near / i,
      a = r.far / i,
      o = this.geometry.boundsTree;
    if (r.firstHitOnly === !0) {
      const l = scope.convertRaycastIntersect(o.raycastFirst(scope.ray, this.material, s, a), this, r);
      l && e.push(l);
    } else {
      const l = o.raycast(scope.ray, this.material, s, a);
      for (let c = 0, h = l.length; c < h; c++) {
        const d = scope.convertRaycastIntersect(l[c], this, r);
        d && e.push(d);
      }
    }
  } else scope.origMeshRaycastFunc.call(this, r, e);
};
}
