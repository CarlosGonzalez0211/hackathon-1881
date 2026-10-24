/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1368900:1369970.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1910(scope) {
scope.acceleratedBatchedMeshRaycast = function acceleratedBatchedMeshRaycast(r, e) {
  if (this.boundsTrees) {
    const i = this.boundsTrees,
      s = this._drawInfo || this._instanceInfo,
      a = this._drawRanges || this._geometryInfo,
      o = this.matrixWorld;
    scope._mesh.material = this.material, scope._mesh.geometry = this.geometry;
    const l = scope._mesh.geometry.boundsTree,
      c = scope._mesh.geometry.drawRange;
    scope._mesh.geometry.boundingSphere === null && (scope._mesh.geometry.boundingSphere = new scope.Sphere());
    for (let h = 0, d = s.length; h < d; h++) {
      if (!this.getVisibleAt(h)) continue;
      const p = s[h].geometryIndex;
      if (scope._mesh.geometry.boundsTree = i[p], this.getMatrixAt(h, scope._mesh.matrixWorld).premultiply(o), !scope._mesh.geometry.boundsTree) {
        this.getBoundingBoxAt(p, scope._mesh.geometry.boundingBox), this.getBoundingSphereAt(p, scope._mesh.geometry.boundingSphere);
        const f = a[p];
        scope._mesh.geometry.setDrawRange(f.start, f.count);
      }
      scope._mesh.raycast(r, scope._batchIntersects);
      for (let f = 0, _ = scope._batchIntersects.length; f < _; f++) {
        const x = scope._batchIntersects[f];
        x.object = this, x.batchId = h, e.push(x);
      }
      scope._batchIntersects.length = 0;
    }
    scope._mesh.geometry.boundsTree = l, scope._mesh.geometry.drawRange = c, scope._mesh.material = null, scope._mesh.geometry = null;
  } else scope.origBatchedRaycastFunc.call(this, r, e);
};
}
