/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 276572:277788.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step0756(scope) {
scope.PointLightShadow = class PointLightShadow extends scope.LightShadow {
  constructor() {
    super(new scope.PerspectiveCamera(90, 1, .5, 500)), this.isPointLightShadow = !0, this._frameExtents = new scope.Vector2(4, 2), this._viewportCount = 6, this._viewports = [new scope.Vector4(2, 1, 1, 1), new scope.Vector4(0, 1, 1, 1), new scope.Vector4(3, 1, 1, 1), new scope.Vector4(1, 1, 1, 1), new scope.Vector4(3, 0, 1, 1), new scope.Vector4(1, 0, 1, 1)], this._cubeDirections = [new scope.Vector3(1, 0, 0), new scope.Vector3(-1, 0, 0), new scope.Vector3(0, 0, 1), new scope.Vector3(0, 0, -1), new scope.Vector3(0, 1, 0), new scope.Vector3(0, -1, 0)], this._cubeUps = [new scope.Vector3(0, 1, 0), new scope.Vector3(0, 1, 0), new scope.Vector3(0, 1, 0), new scope.Vector3(0, 1, 0), new scope.Vector3(0, 0, 1), new scope.Vector3(0, 0, -1)];
  }
  updateMatrices(e, i = 0) {
    const s = this.camera,
      a = this.matrix,
      o = e.distance || s.far;
    o !== s.far && (s.far = o, s.updateProjectionMatrix()), scope._lightPositionWorld.setFromMatrixPosition(e.matrixWorld), s.position.copy(scope._lightPositionWorld), scope._lookTarget.copy(s.position), scope._lookTarget.add(this._cubeDirections[i]), s.up.copy(this._cubeUps[i]), s.lookAt(scope._lookTarget), s.updateMatrixWorld(), a.makeTranslation(-scope._lightPositionWorld.x, -scope._lightPositionWorld.y, -scope._lightPositionWorld.z), scope._projScreenMatrix.multiplyMatrices(s.projectionMatrix, s.matrixWorldInverse), this._frustum.setFromProjectionMatrix(scope._projScreenMatrix, s.coordinateSystem, s.reversedDepth);
  }
};
}
